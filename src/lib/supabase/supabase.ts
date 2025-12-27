import { SupabaseClient } from "@supabase/supabase-js";
import { getSBBrowserClient } from "./sbClient";
import { logger } from "../logger";
import type { FullUserData, } from "../types/db";

type SBRequestCallback<T, U> = (
  sb: ReturnType<typeof getSBBrowserClient>
) => Promise<U>;

export async function makeSBRequest<T, U>(fn: SBRequestCallback<T, U>, client?: SupabaseClient) {
  const sb = client ?? getSBBrowserClient();

  const ret = await fn(sb);

  if (ret && typeof ret === "object" && "error" in ret && ret.error) {
    logger.error({ ret }, "[SBRequest] Request Failed");
    return ret;
  } else {
    logger.debug({ ret }, "[SBRequest] Request Succeeded");
  }

  return ret;
}

export function getProfileImageUrl(
  user?: Pick<FullUserData, "avatar_url"> | null
): string | undefined {
  if (user?.avatar_url) return user.avatar_url;
  // user metadata + google storage + custom bucket for user uploaded images???
  return undefined;
}
