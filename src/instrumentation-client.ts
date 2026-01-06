import posthog from "posthog-js";
import { assertEnv } from "./lib/utils";

const posthogKey = assertEnv(
  "NEXT_PUBLIC_POSTHOG_KEY",
  process.env.NEXT_PUBLIC_POSTHOG_KEY
);

// no reverse proxy for PostHog
// posthog.init(posthogKey, {
//   // api_host: "/ph",
//   api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
//   defaults: "2025-11-30"
// });

// yes reverse proxy for PostHog
posthog.init(posthogKey, {
  api_host: "/ph",
  ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
  defaults: "2025-11-30"
});