import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { getSBBrowserClient } from "./sbClient";
import { logger } from "../logger";
import type { User } from "../types/db";

type SBRequestCallback<T, U extends PostgrestSingleResponse<T>> = (
  sb: ReturnType<typeof getSBBrowserClient>
) => Promise<U>;

export async function makeSBRequest<T, U extends PostgrestSingleResponse<T>>(
  fn: SBRequestCallback<T, U>
) {
  const sb = getSBBrowserClient();

  const ret = await fn(sb);

  if (ret.error) {
    logger.error({ ret }, "[SBRequest] Request Failed");
    return ret;
  }

  return ret;
}
export function getProfileImageUrl(user?: User | null): string | undefined {
  if (!user) return undefined;

  // if (typeof user.avatar_url === "string" && user.avatar_url)
  //   return user.avatar_url;
  return user.user_metadata?.avatar_url;
}
