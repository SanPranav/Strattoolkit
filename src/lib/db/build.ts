import { makeSBRequest } from "../supabase/supabase";
import {
  BuildLocation,
  BuildGroup,
  BuildTask,
  BuildSession,
  UserWithBuildGroup,
  ActivitySummary
} from "../types/db";
import type { ErrorOrData } from "../types/utils";

// =============================================================================
// BUILD LOCATIONS
// =============================================================================

export async function fetchBuildLocations(
  activeOnly = true
): Promise<ErrorOrData<BuildLocation[]>> {
  const { data, error } = await makeSBRequest(async (sb) => {
    let query = sb.from("BuildLocations").select("*");
    if (activeOnly) {
      query = query.eq("is_active", true);
    }
    return query.order("location_name", { ascending: true });
  });

  if (error || !data) {
    return [error?.message ?? "Failed to load build locations", null];
  }

  return [null, data as BuildLocation[]];
}

export async function createBuildLocation(
  location: Omit<BuildLocation, "id" | "created_at">
): Promise<ErrorOrData<BuildLocation>> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb.from("BuildLocations").insert(location).select().single()
  );

  if (error || !data) {
    return [error?.message ?? "Failed to create location", null];
  }

  return [null, data as BuildLocation];
}

export async function updateBuildLocation(
  locationId: number,
  updates: Partial<Omit<BuildLocation, "id" | "created_at">>
): Promise<ErrorOrData<null>> {
  const { error } = await makeSBRequest(async (sb) =>
    sb.from("BuildLocations").update(updates).eq("id", locationId)
  );

  if (error) {
    return [error.message, null];
  }

  return [null, null];
}

export async function deleteBuildLocation(
  locationId: number
): Promise<ErrorOrData<null>> {
  const { error } = await makeSBRequest(async (sb) =>
    sb.from("BuildLocations").delete().eq("id", locationId)
  );

  if (error) {
    return [error.message, null];
  }

  return [null, null];
}

// =============================================================================
// BUILD GROUPS
// =============================================================================

export async function fetchBuildGroups(): Promise<ErrorOrData<BuildGroup[]>> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb.from("BuildGroups").select("*").order("group_name", { ascending: true })
  );

  if (error || !data) {
    return [error?.message ?? "Failed to load build groups", null];
  }

  return [null, data as BuildGroup[]];
}

export async function createBuildGroup(payload: {
  group_name: string;
  description?: string | null;
}): Promise<ErrorOrData<BuildGroup>> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb.from("BuildGroups").insert(payload).select().single()
  );

  if (error || !data) {
    return [error?.message ?? "Failed to create group", null];
  }

  return [null, data as BuildGroup];
}

export async function updateBuildGroup(
  groupId: number,
  updates: Partial<{ group_name: string; description: string | null }>
): Promise<ErrorOrData<null>> {
  const { error } = await makeSBRequest(async (sb) =>
    sb.from("BuildGroups").update(updates).eq("id", groupId)
  );

  if (error) {
    return [error.message, null];
  }

  return [null, null];
}

export async function deleteBuildGroup(
  groupId: number
): Promise<ErrorOrData<null>> {
  const { error } = await makeSBRequest(async (sb) =>
    sb.from("BuildGroups").delete().eq("id", groupId)
  );

  if (error) {
    return [error.message, null];
  }

  return [null, null];
}

// =============================================================================
// USER BUILD GROUP MANAGEMENT
// =============================================================================

/**
 * Fetch all users with their build group information
 */
export async function fetchAllUsersWithGroups(): Promise<
  ErrorOrData<UserWithBuildGroup[]>
> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb
      .from("UserData")
      .select("user_id, user_name, build_group, BuildGroups(group_name)")
      .order("user_name", { ascending: true })
  );

  if (error || !data) {
    return [error?.message ?? "Failed to load users", null];
  }

  const users = data
    .map((row) => {
      if (!row.BuildGroups?.group_name) {
        return null;
      }

      return {
        user_id: row.user_id,
        user_name: row.user_name,
        build_group: row.build_group,
        group_name: row.BuildGroups?.group_name
      };
    })
    .filter((a) => !!a);

    console.log(users);

  return [null, users];
}

/**
 * Fetch users in a specific build group
 */
export async function fetchGroupUsers(
  groupId: number
): Promise<ErrorOrData<UserWithBuildGroup[]>> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb
      .from("UserData")
      .select("user_id, user_name, build_group")
      .eq("build_group", groupId)
      .order("user_name", { ascending: true })
  );

  if (error || !data) {
    return [error?.message ?? "Failed to load group users", null];
  }

  return [null, data as UserWithBuildGroup[]];
}

/**
 * Fetch the build group for a specific user
 */
export async function fetchUserBuildGroup(
  userId: string
): Promise<ErrorOrData<BuildGroup | null>> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb
      .from("UserData")
      .select("build_group, BuildGroups(*)")
      .eq("user_id", userId)
      .single()
  );

  if (error || !data) {
    return [error?.message ?? "Failed to load user group", null];
  }

  return [null, (data.BuildGroups as BuildGroup) ?? null];
}

/**
 * Update a user's build group (assign to group or remove from group)
 */
export async function updateUserBuildGroup(
  userId: string,
  groupId: number | null
): Promise<ErrorOrData<null>> {
  const { error } = await makeSBRequest(async (sb) =>
    sb.from("UserData").update({ build_group: groupId }).eq("user_id", userId)
  );

  if (error) {
    return [error.message, null];
  }

  return [null, null];
}

// =============================================================================
// BUILD TASKS
// =============================================================================

export async function fetchBuildTasks(filters?: {
  groupId?: number;
  status?: BuildTask["status"];
}): Promise<ErrorOrData<BuildTask[]>> {
  const { data, error } = await makeSBRequest(async (sb) => {
    let query = sb.from("BuildTasks").select("*");

    if (filters?.groupId) {
      query = query.eq("assigned_group_id", filters.groupId);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    return query.order("due_date", { ascending: true, nullsFirst: false });
  });

  if (error || !data) {
    return [error?.message ?? "Failed to load tasks", null];
  }

  return [null, data as BuildTask[]];
}

export type BuildTaskWithUsers = BuildTask & {
  completed_by_name: string | null;
  reviewed_by_name: string | null;
  created_by_name: string | null;
};

export async function fetchBuildTasksWithUsers(filters?: {
  groupId?: number;
  status?: BuildTask["status"];
}): Promise<ErrorOrData<BuildTaskWithUsers[]>> {
  const { data, error } = await makeSBRequest(async (sb) => {
    let query = sb.from("BuildTasks").select(`
      *,
      completed_by_user:UserData!BuildTasks_completed_by_fkey(user_name),
      reviewed_by_user:UserData!BuildTasks_reviewed_by_fkey(user_name),
      created_by_user:UserData!BuildTasks_created_by_fkey(user_name)
    `);

    if (filters?.groupId) {
      query = query.eq("assigned_group_id", filters.groupId);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    return query.order("due_date", { ascending: true, nullsFirst: false });
  });

  if (error || !data) {
    return [error?.message ?? "Failed to load tasks", null];
  }

  // Transform the nested user data to flat fields
  const transformedData = (data as any[]).map((task) => ({
    ...task,
    completed_by_name: task.completed_by_user?.user_name || null,
    reviewed_by_name: task.reviewed_by_user?.user_name || null,
    created_by_name: task.created_by_user?.user_name || null,
    completed_by_user: undefined,
    reviewed_by_user: undefined,
    created_by_user: undefined
  })) as BuildTaskWithUsers[];

  return [null, transformedData];
}

export async function fetchUserTasks(
  userId: string
): Promise<ErrorOrData<BuildTask[]>> {
  // First get user's build group from UserData
  const { data: userData, error: userError } = await makeSBRequest(async (sb) =>
    sb.from("UserData").select("build_group").eq("user_id", userId).single()
  );

  if (userError || !userData) {
    return [userError?.message ?? "Failed to load user data", null];
  }

  const groupId = (userData as { build_group: number | null }).build_group;

  if (!groupId) {
    return [null, []]; // User not in any group
  }

  const { data, error } = await makeSBRequest(async (sb) =>
    sb
      .from("BuildTasks")
      .select("*")
      .eq("assigned_group_id", groupId)
      .order("status", { ascending: true })
      .order("due_date", { ascending: true, nullsFirst: false })
  );

  if (error || !data) {
    return [error?.message ?? "Failed to load tasks", null];
  }

  return [null, data as BuildTask[]];
}

export async function createBuildTask(
  payload: Omit<
    BuildTask,
    | "id"
    | "created_at"
    | "updated_at"
    | "created_by"
    | "assigned_user_id"
    | "completed_by"
    | "submission_notes"
    | "review_notes"
    | "reviewed_by"
    | "rejection_reason"
  >
): Promise<ErrorOrData<BuildTask>> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb.from("BuildTasks").insert(payload).select().single()
  );

  if (error || !data) {
    return [error?.message ?? "Failed to create task", null];
  }

  return [null, data as BuildTask];
}

export async function updateBuildTask(
  taskId: number,
  updates: Partial<Omit<BuildTask, "id" | "created_at">>
): Promise<ErrorOrData<BuildTask>> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb
      .from("BuildTasks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", taskId)
      .select()
      .single()
  );

  if (error || !data) {
    return [error?.message ?? "Failed to update task", null];
  }

  return [null, data as BuildTask];
}

export async function submitTaskForReview(
  taskId: number,
  userId: string
): Promise<ErrorOrData<BuildTask>> {
  return updateBuildTask(taskId, { status: "in_review", completed_by: userId });
}

export async function reviewTask(
  taskId: number,
  reviewerId: string,
  decision: "complete" | "rejected",
  notes?: string
): Promise<ErrorOrData<BuildTask>> {
  const updates: Partial<Omit<BuildTask, "id" | "created_at">> = {
    status: decision,
    reviewed_by: reviewerId
  };

  if (decision === "rejected" && notes) {
    updates.rejection_reason = notes;
  }

  return updateBuildTask(taskId, updates);
}

export async function deleteBuildTask(
  taskId: number
): Promise<ErrorOrData<null>> {
  const { error } = await makeSBRequest(async (sb) =>
    sb.from("BuildTasks").delete().eq("id", taskId)
  );

  if (error) {
    return [error.message, null];
  }

  return [null, null];
}

// =============================================================================
// BUILD SESSIONS
// =============================================================================

export async function fetchUserBuildSessions(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<ErrorOrData<BuildSession[]>> {
  const { data, error } = await makeSBRequest(async (sb) => {
    let query = sb
      .from("BuildSessions")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit ?? 10) - 1
      );
    }

    return query;
  });

  if (error || !data) {
    return [error?.message ?? "Failed to load sessions", null];
  }

  return [null, data as BuildSession[]];
}

export async function fetchAllBuildSessions(options?: {
  limit?: number;
}): Promise<ErrorOrData<BuildSession[]>> {
  const { data, error } = await makeSBRequest(async (sb) => {
    let query = sb
      .from("BuildSessions")
      .select("*")
      .order("started_at", { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    return query;
  });

  if (error || !data) {
    return [error?.message ?? "Failed to load sessions", null];
  }

  return [null, data as BuildSession[]];
}

export async function getActiveSession(
  userId: string
): Promise<ErrorOrData<BuildSession | null>> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb
      .from("BuildSessions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  );

  if (error) {
    return [error.message, null];
  }

  return [null, data as BuildSession | null];
}

export async function startBuildSession(
  userId: string,
  locationId?: number | null,
  notes?: string
): Promise<ErrorOrData<BuildSession>> {
  // First check if there's an active session
  const [activeError, activeSession] = await getActiveSession(userId);
  if (activeError) {
    return [activeError, null];
  }
  if (activeSession) {
    return ["You already have an active session. Please end it first.", null];
  }

  const payload = {
    user_id: userId,
    location_id: locationId ?? null,
    notes: notes ?? null,
    status: "active" as const
  };

  const { data, error } = await makeSBRequest(async (sb) =>
    sb.from("BuildSessions").insert(payload).select().single()
  );

  if (error || !data) {
    return [error?.message ?? "Failed to start session", null];
  }

  return [null, data as BuildSession];
}

export async function stopBuildSession(
  sessionId: number,
  notes?: string
): Promise<ErrorOrData<BuildSession>> {
  const updatePayload: Partial<BuildSession> = {
    ended_at: new Date().toISOString(),
    status: "completed"
  };

  if (notes !== undefined) {
    updatePayload.notes = notes;
  }

  const { data, error } = await makeSBRequest(async (sb) =>
    sb
      .from("BuildSessions")
      .update(updatePayload)
      .eq("id", sessionId)
      .eq("status", "active")
      .select()
      .single()
  );

  if (error || !data) {
    return [error?.message ?? "Failed to stop session", null];
  }

  return [null, data as BuildSession];
}

export async function updateBuildSession(
  sessionId: number,
  updates: Partial<Pick<BuildSession, "notes" | "ended_at" | "status">>
): Promise<ErrorOrData<BuildSession>> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb
      .from("BuildSessions")
      .update(updates)
      .eq("id", sessionId)
      .select()
      .single()
  );

  if (error || !data) {
    return [error?.message ?? "Failed to update session", null];
  }

  return [null, data as BuildSession];
}

export async function deleteBuildSession(
  sessionId: number
): Promise<ErrorOrData<null>> {
  const { error } = await makeSBRequest(async (sb) =>
    sb.from("BuildSessions").delete().eq("id", sessionId)
  );

  if (error) {
    return [error.message, null];
  }

  return [null, null];
}

// =============================================================================
// BUILD SUMMARIES / STATS
// =============================================================================

export async function fetchUserBuildSummary(
  userId: string
): Promise<ErrorOrData<ActivitySummary | null>> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb
      .from("UserActivitySummaries")
      .select("*")
      .eq("user_id", userId)
      .eq("activity_type", "build")
      .maybeSingle()
  );

  if (error) {
    return [error.message, null];
  }

  return [null, data];
}

export async function fetchBuildLeaderboard(
  limit = 10
): Promise<ErrorOrData<ActivitySummary[]>> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb
      .from("UserActivitySummaries")
      .select("*")
      .order("total_minutes", { ascending: false })
      .eq("activity_type", "build")
      .limit(limit)
  );

  if (error || !data) {
    return [error?.message ?? "Failed to load leaderboard", null];
  }

  return [null, data];
}

export async function getUserBuildMinutes(
  userId: string
): Promise<ErrorOrData<number>> {
  const [error, summary] = await fetchUserBuildSummary(userId);

  if (error) {
    return [error, null];
  }

  return [null, summary?.user_credited_minutes ?? 0];
}

// =============================================================================
// LOCATION VALIDATION HELPERS
// =============================================================================

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if user's coordinates are within any valid build location
 */
export async function validateUserLocation(
  userLat: number,
  userLon: number
): Promise<ErrorOrData<BuildLocation | null>> {
  const [error, locations] = await fetchBuildLocations(true);

  if (error) {
    return [error, null];
  }

  if (!locations || locations.length === 0) {
    return ["No build locations configured", null];
  }

  for (const location of locations) {
    const distance = calculateDistance(
      userLat,
      userLon,
      location.latitude,
      location.longitude
    );

    if (distance <= location.radius_meters) {
      return [null, location];
    }
  }

  return [null, null]; // Not at any valid location
}
