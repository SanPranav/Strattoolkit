const LEADERBOARD = ["outreach", "activitySummaries"] as const;
const EVENTS = ["outreach", "events"] as const;
const EVENT_SESSIONS = (eventId: number) =>
  ["outreach", "events", eventId, "sessions"] as const;
const EVENT_SUMMARY = (eventId: number) =>
  ["outreach", "events", eventId, "summary"] as const;
const CAN_MANAGE_OUTREACH = (userId: string) =>
  ["outreach", "user", userId, "canManage"] as const;
const MINUTES_THRESHOLD = ["outreach", "minutesThreshold"] as const;
const TOTAL_MINUTES = ["outreach", "minutes", "total"] as const;

const ALL_USERS = ["users", "all"] as const;

export const OUTREACH = {
  LEADERBOARD,
  EVENTS,
  EVENT_SESSIONS,
  EVENT_SUMMARY,
  MINUTES_THRESHOLD,
  TOTAL_MINUTES
};

export const USER = {
  ALL_USERS,
  CAN_MANAGE_OUTREACH
};
