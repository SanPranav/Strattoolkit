import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Enums, Tables } from "./supabase.gen";

export type User = SupabaseUser;
export type UserData = Tables<"UserData">;
export type FullUserData = User & UserData & ActivitySummary;

export type ActivityEvent = Tables<"ActivityEvents">;
export type ActivitySession = Tables<"ActivitySessions">;
export type ActivityType = Enums<"activity_types">;
export type ActivitySummary = Tables<"UserActivitySummaries">;
export type RBACRule = Tables<"rbac">;

export type BuildTask = Tables<"BuildTasks">;
export type BuildSession = Tables<"BuildSessions">;
export type BuildLocation = Tables<"BuildLocations">;
export type BuildGroup = Tables<"BuildGroups">;

export type UserWithBuildGroup = Pick<UserData & BuildGroup, "user_id" | "user_name" | "group_name" | "build_group">;

