import { PostHog } from "posthog-node";
import { assertEnv } from "./utils";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const featureFlagKey = process.env.POSTHOG_FEATURE_FLAG_KEY;

// Require project key only when actually creating a real client
const client = posthogKey
  ? new PostHog(posthogKey, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      ...(featureFlagKey && { personalApiKey: featureFlagKey }),
      featureFlagsPollingInterval: 180000
    })
  : ({
      getRemoteConfigPayload: async (_key: string) => undefined,
      flush: async () => {}
    } as Pick<PostHog, "getRemoteConfigPayload" | "flush">);

export default client;