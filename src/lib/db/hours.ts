import { cache } from "react";
import { makeSBRequest } from "@/lib/supabase/supabase";
import { BaseStates } from "@/lib/types/states";

const MANUAL_HOURS_EVENT_NAME = "Manual Hours (don't delete)";

const getManualHoursEventId = cache(async () => {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb
      .from("ActivityEvents")
      .select("id")
      .eq("event_name", MANUAL_HOURS_EVENT_NAME)
      .eq("activity_type", "outreach")
      .limit(1)
      .single()
  );

  if (error || !data?.id) {
    return null;
  }

  return data.id;
});

export async function manualModifyOutreachHours(
  userId: string,
  totalMinutes: number
): Promise<BaseStates> {
  if (!userId || !Number.isFinite(totalMinutes)) {
    return BaseStates.ERROR;
  }

  const eventId = await getManualHoursEventId();

  if (eventId === null) {
    return BaseStates.ERROR;
  }

  const { error } = await makeSBRequest(async (sb) =>
    sb.from("ActivitySessions").upsert(
      {
        user_id: userId,
        event_id: eventId,
        activity_type: "outreach",
        minutes: totalMinutes
      },
      { onConflict: "user_id,event_id" }
    )
  );

  if (error) {
    return BaseStates.ERROR;
  }

  return BaseStates.SUCCESS;
}
