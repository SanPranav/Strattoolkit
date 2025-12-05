import { makeSBRequest } from "../supabase/supabase";
import { BaseStates } from "@/lib/types/states";

export async function manualModifyOutreachHours(
  userId: string,
  deltaMinutes: number
): Promise<BaseStates> {
  if (!userId || !Number.isFinite(deltaMinutes)) {
    return BaseStates.ERROR;
  }

  const { data, error } = await makeSBRequest(async (sb) =>
    sb
      .from("OutreachSessions")
      .upsert(
        {
          user: userId,
          event: "ManualHours",
          minutes: deltaMinutes
        },
        { onConflict: "user,event" }
      )
      .select()
  );

  if (error) {
    return BaseStates.ERROR;
  }

  return BaseStates.SUCCESS;
}
