import type { SupabaseClient } from "@supabase/supabase-js";
import { getSBBrowserClient } from "../supabase/sbClient";
import { makeSBRequest } from "../supabase/supabase";
import type { OutreachEvent, OutreachSession } from "../types/db";
import { cache } from "react";
import { runFlag } from "../flags";

type SessionInsert = {
  userId: string;
  eventId: string;
  minutes: number;
};

export async function fetchEvents(): Promise<
  [string | null, OutreachEvent[] | null]
> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb.from("OutreachEvents").select("*").order("date", { ascending: false })
  );

  if (error || !data) {
    return [error?.message ?? "Failed to load events", null];
  }

  return [null, data];
}

export async function createEvent(payload: {
  name: string;
  date: string;
}): Promise<[string | null, OutreachEvent | null]> {
  const eventDate = new Date(payload.date).toISOString().split("T")[0];

  const { data, error } = await makeSBRequest(async (sb) =>
    sb
      .from("OutreachEvents")
      .insert({
        name: payload.name,
        date: eventDate
      })
      .select("*")
      .maybeSingle()
  );

  if (error || !data) {
    return [error?.message ?? "Failed to create event", null];
  }

  return [null, data];
}

export async function updateEvent(
  eventId: number,
  updates: Partial<{ name: string; date: string }>
): Promise<[string | null]> {
  const payload: Partial<OutreachEvent> = {};

  if (updates.name !== undefined) {
    payload.name = updates.name;
  }

  if (updates.date) {
    payload.date = new Date(updates.date).toISOString().split("T")[0];
  }

  const { error } = await makeSBRequest(async (sb) =>
    sb.from("OutreachEvents").update(payload).eq("id", eventId)
  );

  if (error) {
    return [error.message];
  }

  return [null];
}

export async function deleteEvent(eventId: number): Promise<[string | null]> {
  const { error } = await makeSBRequest(async (sb) =>
    sb.from("OutreachEvents").delete().eq("id", eventId)
  );

  if (error) {
    return [error.message];
  }

  return [null];
}

export async function fetchSessionsForEvent(
  eventId: string
): Promise<[string | null, OutreachSession[] | null]> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb
      .from("OutreachSessions")
      .select("*")
      .eq("event", eventId)
      .order("created_at", { ascending: false })
  );

  if (error) {
    return [error?.message ?? "Failed to load sessions", null];
  }

  return [null, data];
}

export async function createSessionsBulk(
  records: SessionInsert[]
): Promise<[string | null]> {
  if (!records.length) {
    return [null];
  }

  const payload = records.map((record) => ({
    user: record.userId,
    event: record.eventId,
    minutes: record.minutes
  }));

  const { error } = await makeSBRequest(async (sb) =>
    sb.from("OutreachSessions").insert(payload)
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
    sb.from("OutreachSessions").delete().eq("id", sessionId)
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
      .from("OutreachSessions")
      .select("event:OutreachEvents(date)")
      .eq("user", userId)
      .order("event", { ascending: false })
  );

  if (error || !data) {
    return [error?.message ?? "Failed to load activity", null];
  }

  return [null, data.map((row) => row.event.date ?? "")];
}

export const getOutreachMinutesCutoff = cache(async (): Promise<number> => {
  const DEFAULT_MINUTES_CUTOFF = 900;

  const { enabled, value, exists } = await runFlag(
    "outreach_minutes_cutoff",
    getSBBrowserClient()
  );

  if (!exists) return DEFAULT_MINUTES_CUTOFF;
  if (enabled && typeof value === "number" && Number.isFinite(value))
    return value;

  return DEFAULT_MINUTES_CUTOFF;
});
