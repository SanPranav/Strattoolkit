import { PostHog } from "posthog-node";
import { assertEnv } from "./utils";

const posthogKey = assertEnv(
  "NEXT_PUBLIC_POSTHOG_KEY",
  process.env.NEXT_PUBLIC_POSTHOG_KEY
);
const featureFlagKey = assertEnv(
  "POSTHOG_FEATURE_FLAG_KEY",
  process.env.POSTHOG_FEATURE_FLAG_KEY
);

const client = new PostHog(posthogKey, {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
  personalApiKey: featureFlagKey,
  featureFlagsPollingInterval: 180000
});
export default client;