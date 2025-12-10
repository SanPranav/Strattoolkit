import posthog from "posthog-js";
import { assertEnv } from "./lib/utils";

const posthogKey = assertEnv(
  "NEXT_PUBLIC_POSTHOG_KEY",
  process.env.NEXT_PUBLIC_POSTHOG_KEY
);

posthog.init(posthogKey, {
  api_host: "/ph",
  ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.posthog.com",
  defaults: "2025-11-30"
});