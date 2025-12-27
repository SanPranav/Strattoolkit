import posthog from "posthog-js";

import { logger } from "../logger";
import { setRoutePermissions } from "./routePermissions";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogApiHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
const TTL_MS = 2 * 60 * 1000;

let posthogInitialized = false;
let lastInitializedAt = 0;
let routePermissionsInitialization: Promise<void> | null = null;

async function initializeRoutePermissions() {
  if (!posthogKey) {
    logger.warn(
      "[RBAC - Route Permissions] NEXT_PUBLIC_POSTHOG_KEY missing; using defaults."
    );
    lastInitializedAt = Date.now();
    return;
  }

  try {
    if (!posthogInitialized) {
      posthog.init(posthogKey, {
        api_host: posthogApiHost,
        ui_host:
          process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.posthog.com",
        disable_session_recording: true,
        capture_pageview: false,
        capture_pageleave: false
      });
      posthogInitialized = true;
    } else {
      await posthog.reloadFeatureFlags?.();
    }

    const payload = await posthog.getFeatureFlagPayload(
      "rbac_route_permissions"
    );

    if (payload && typeof payload === "object") {
      setRoutePermissions(payload as Record<string, any>);
      logger.info(
        "[RBAC - Route Permissions] Loaded permissions from PostHog feature flag."
      );
    } else {
      logger.warn(
        "[RBAC - Route Permissions] No PostHog payload; keeping default permissions."
      );
    }
  } catch (error) {
    logger.error(
      error,
      "[RBAC - Route Permissions] Failed to load permissions from PostHog."
    );
  } finally {
    lastInitializedAt = Date.now();
  }
}

export function ensureRoutePermissionsInitialized() {
  const now = Date.now();
  if (!routePermissionsInitialization || now - lastInitializedAt > TTL_MS) {
    routePermissionsInitialization = initializeRoutePermissions();
  }

  return routePermissionsInitialization;
}
