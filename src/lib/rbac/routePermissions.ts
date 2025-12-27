"use server";

import { logger } from "../logger";
import {
  PermissionString,
  RoutePermissionsObject,
  RoutePermissionsSchema
} from "../types/rbac";

let routePermissions = RoutePermissionsSchema.parse({
  outreach: {
    base: "outreach:view",
    manage: "outreach:manage"
  },
  settings: "settings:view:own",
  auth: null,
  api: null,
  info: null
}) satisfies RoutePermissionsObject;

export async function setRoutePermissions(newPermissions: Record<string, any>) {
  const parsed = RoutePermissionsSchema.safeParse(newPermissions);

  if (parsed.success) {
    routePermissions = parsed.data;
  } else {
    logger.error(
      parsed,
      "[RBAC - Route Permissions] Invalid route permissions object provided. Defaulting."
    );

    throw new Error(
      "[RBAC - Route Permissions] Invalid route permissions object provided. Defaulting."
    );
  }
}

export async function getRequiredPermissionsForRoute(
  routeSegments: string[]
): Promise<PermissionString[] | null> {
  if (routeSegments.length === 0) return null;

  let ret: PermissionString[] = [];
  let currentPermissionSegment = routePermissions;
  for (const segment of routeSegments) {
    if (typeof segment !== "string") {
      return null;
    }

    if (!(segment in currentPermissionSegment)) {
      return null;
    }

    const permission = currentPermissionSegment[segment];
    if (!permission) {
      return null;
    }

    if (typeof permission === "string") {
      ret.push(permission);
      continue;
    }

    if (typeof permission === "object" && permission !== null) {
      currentPermissionSegment = permission;
      ret.push(permission["base"]);
      continue;
    }
  }

  return ret;
}
