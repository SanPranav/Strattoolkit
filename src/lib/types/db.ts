import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Enums, Tables } from "./supabase";

export type User = SupabaseUser;
export type UserData = Tables<"UserData">;
export type FullUserData = User & UserData & ActivitySummary;

export type OutreachEvent = Tables<"OutreachEvents">;
export type OutreachSession = Tables<"OutreachSessions">;

export type ActivityEvent = Tables<"ActivityEvents">;
export type ActivitySession = Tables<"ActivitySessions">;
export type ActivityType = Enums<"activity_types">;
export type ActivitySummary = Tables<"UserActivitySummaries">;
export type RBACRule = Tables<"rbac">;
