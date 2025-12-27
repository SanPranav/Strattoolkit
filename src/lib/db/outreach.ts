import { makeSBRequest } from "../supabase/supabase";
import type { ActivitySession } from "../types/db";
import { cache } from "react";
import { ActivityEvent } from "../types/db";
import { posthog } from "posthog-js";

export async function fetchOutreachEvents(): Promise<
  [string | null, ActivityEvent[] | null]
> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb.from("ActivityEvents").select("*").eq("activity_type", "outreach")
  );

  if (error || !data) {
    return [error?.message ?? "Failed to load events", null];
  }

  return [null, data];
}

export async function createOutreachEvent(
  payload: Pick<ActivityEvent, "event_name" | "event_date" | "minutes_cap">
): Promise<[string | null, ActivityEvent | null]> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb.from("ActivityEvents").insert({
      ...payload,
      activity_type: "outreach"
    })
  );

  if (error || !data) {
    return [error?.message ?? "Failed to create event", null];
  }

  return [null, data];
}

export async function updateOutreachEvent(
  eventId: number,
  updates: Partial<
    Pick<ActivityEvent, "event_name" | "event_date" | "minutes_cap">
  >
): Promise<[string | null]> {
  const payload: Partial<ActivityEvent> = {};

  if (updates.event_name !== undefined) {
    payload.event_name = updates.event_name;
  }

  if (updates.event_date) {
    payload.event_date = new Date(updates.event_date).toISOString();
  }

  if (updates.minutes_cap !== undefined) {
    payload.minutes_cap = updates.minutes_cap;
  }

  const { error } = await makeSBRequest(async (sb) =>
    sb
      .from("ActivityEvents")
      .update(payload)
      .eq("id", eventId)
      .eq("activity_type", "outreach")
  );

  if (error) {
    return [error.message];
  }

  return [null];
}

export async function deleteOutreachEvents(
  ...eventId: number[]
): Promise<[string | null]> {
  const { error } = await makeSBRequest(async (sb) =>
    sb
      .from("ActivityEvents")
      .delete()
      .in("id", eventId)
      .eq("activity_type", "outreach")
  );

  if (error) {
    return [error.message];
  }

  return [null];
}

export async function fetchOutreachEventSessions(
  eventId: number
): Promise<[string | null, ActivitySession[] | null]> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb
      .from("ActivitySessions")
      .select("*")
      .eq("event_id", eventId)
      .eq("activity_type", "outreach")
      .order("created_at", { ascending: false })
  );

  if (error) {
    return [error?.message ?? "Failed to load sessions", null];
  }

  return [null, data];
}

export async function bulkCreateOutreachEventSessions(
  records: Pick<ActivitySession, "event_id" | "user_id" | "minutes">[]
): Promise<[string | null]> {
  if (!records.length) {
    return [null];
  }

  const payload = records.map((record) => {
    return {
      ...record,
      activity_type: "outreach"
    } satisfies Omit<ActivitySession, "id" | "created_at">;
  });

  const { error } = await makeSBRequest(async (sb) =>
    sb.from("ActivitySessions").insert(payload)
  );

  if (error) {
    return [error.message];
  }

  return [null];
}

export async function deleteSession(
  sessionId: number
): Promise<[string | null]> {
  const { error } = await makeSBRequest(async (sb) =>
    sb.from("ActivitySessions").delete().eq("id", sessionId)
  );

  if (error) {
    return [error.message];
  }

  return [null];
}

export async function updateSessionMinutes(
  sessionId: number,
  minutes: number
): Promise<[string | null]> {
  if (!Number.isFinite(minutes) || minutes < 0) {
    return ["Minutes must be a non-negative number"];
  }

  const { error } = await makeSBRequest(async (sb) =>
    sb.from("ActivitySessions").update({ minutes }).eq("id", sessionId)
  );

  if (error) {
    return [error.message];
  }

  return [null];
}

export async function fetchUserSessionEventDates(
  userId: string
): Promise<[string | null, string[] | null]> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb
      .from("ActivitySessions")
      .select("event_id, ActivityEvents!inner(event_date)")
      .eq("user_id", userId)
      .eq("activity_type", "outreach")
      .order("ActivityEvents(event_date)", { ascending: false })
  );

  if (error || !data) {
    return [error?.message ?? "Failed to load activity", null];
  }

  return [
    null,
    data.map((row) => row.ActivityEvents.event_date ?? "").filter(Boolean)
  ];
}

export const getOutreachMinutesThreshold = cache(async (): Promise<number> => {
  const DEFAULT_MINUTES_CUTOFF = 900;

  const value = await posthog.getFeatureFlagPayload(
    "outreach_minutes_qual_threshold"
  );

  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  return DEFAULT_MINUTES_CUTOFF;
});
