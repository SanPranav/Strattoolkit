import { makeSBRequest } from "../supabase/supabase";
import { ActivitySession, ActivitySummary, ActivityType } from "../types/db";

type PaginatedResult<T> = {
  items: T[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
};

export async function fetchUserActivitySummary(
  userId: string,
  types: ActivityType[]
): Promise<ErrorOrData<ActivitySummary>> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb
      .from("UserActivitySummaries")
      .select("user_id,user_name,user_credited_minutes,minutes")
      .in("activity_type", types)
      .eq("user_id", userId)
      .maybeSingle()
  );

  if (error) {
    return [error.message ?? "Failed to load activity summary", null];
  }

  return [null, data as ActivitySummary | null];
}

export async function fetchActivitySummariesPaginated(
  page: number,
  perPage: number,
  types: ActivityType[],
  orderBy: string = "user_credited_minutes",
  orderDirection: "asc" | "desc" = "desc"
): Promise<PaginatedResult<ActivitySummary> | null> {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await makeSBRequest(async (sb) =>
    sb
      .from("UserActivitySummaries")
      .select("*", { count: "exact" })
      .in("activity_type", types)
      .order(orderBy, { ascending: orderDirection === "asc" })
      .range(from, to)
  );

  if (error || !data || count === null) {
    return null;
  }

  return {
    items: data as ActivitySummary[],
    page,
    perPage,
    totalItems: count,
    totalPages: Math.ceil(count / perPage)
  };
}

export async function fetchActivitySessionsByEventId(
  eventId: number
): Promise<ErrorOrData<ActivitySession[]>> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb.from("ActivitySessions").select("*").eq("event_id", eventId)
  );

  if (error || !data) {
    return [error?.message ?? "Failed to load event summary", null];
  }

  return [null, data];
}

export async function fetchTotalActivityMinutes(
  types: ActivityType[]
): Promise<ErrorOrData<number>> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb
      .from("UserActivitySummaries")
      .select("minutes")
      .in("activity_type", types)
  );

  if (error) {
    return [error.message ?? "Failed to load total minutes", null];
  }

  const total = (data ?? []).reduce((acc, row) => acc + (row?.minutes ?? 0), 0);

  return [null, total];
}
