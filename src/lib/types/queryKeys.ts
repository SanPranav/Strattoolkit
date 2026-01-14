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
const AUTH_USER = ["auth", "user"] as const;

// Build query keys
const BUILD_EVENTS = ["build", "events"] as const;
const BUILD_ACTIVE_EVENT = ["build", "events", "active"] as const;
const BUILD_LOCATIONS = ["build", "locations"] as const;
const BUILD_GROUPS = ["build", "groups"] as const;
const BUILD_GROUP_MEMBERS = (groupId: number) =>
  ["build", "groups", groupId, "members"] as const;
const BUILD_TASKS = ["build", "tasks"] as const;
const BUILD_USER_TASKS = (userId: string) =>
  ["build", "tasks", "user", userId] as const;
const BUILD_SESSIONS = (userId: string) =>
  ["build", "sessions", userId] as const;
const BUILD_ACTIVE_SESSION = (userId: string) =>
  ["build", "sessions", userId, "active"] as const;
const BUILD_USER_SUMMARY = (userId: string) =>
  ["build", "summary", userId] as const;
const BUILD_LEADERBOARD = ["build", "leaderboard"] as const;
const BUILD_ALL_USERS_WITH_GROUPS = ["build", "users", "withGroups"] as const;
const CAN_MANAGE_BUILD = (userId: string) =>
  ["build", "user", userId, "canManage"] as const;
const CAN_SUBMIT_BUILD_TASKS = (userId: string) =>
  ["build", "user", userId, "canSubmit"] as const;

export const OUTREACH = {
  LEADERBOARD,
  EVENTS,
  EVENT_SESSIONS,
  EVENT_SUMMARY,
  MINUTES_THRESHOLD,
  TOTAL_MINUTES
};

export const BUILD = {
  EVENTS: BUILD_EVENTS,
  ACTIVE_EVENT: BUILD_ACTIVE_EVENT,
  LOCATIONS: BUILD_LOCATIONS,
  GROUPS: BUILD_GROUPS,
  GROUP_MEMBERS: BUILD_GROUP_MEMBERS,
  ALL_USERS_WITH_GROUPS: BUILD_ALL_USERS_WITH_GROUPS,
  TASKS: BUILD_TASKS,
  USER_TASKS: BUILD_USER_TASKS,
  SESSIONS: BUILD_SESSIONS,
  ACTIVE_SESSION: BUILD_ACTIVE_SESSION,
  USER_SUMMARY: BUILD_USER_SUMMARY,
  LEADERBOARD: BUILD_LEADERBOARD
};

export const USER = {
  ALL_USERS,
  CAN_MANAGE_OUTREACH,
  CAN_MANAGE_BUILD,
  CAN_SUBMIT_BUILD_TASKS,
  AUTH_USER
};
