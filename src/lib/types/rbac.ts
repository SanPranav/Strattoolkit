import z from "zod";
import type { UserData } from "./db";
import type { Tables, TablesInsert } from "@/lib/types/supabase.gen";

export type UserRole = UserData["user_role"];

export type RBACRule = Tables<"rbac">;
export type RBACRuleInsert = Omit<
  TablesInsert<"rbac">,
  "id" | "created_at" | "updated_at"
>;
export type RBACRuleUpdate = Partial<
  Omit<TablesInsert<"rbac">, "id" | "created_at" | "updated_at">
>;

export const Resources = [
  "activity_events",
  "activity_sessions",
  "build_tasks",
  "build_sessions",
  "build_locations",
  "build_groups",
  "rbac",
  "user_data",
  "settings",
  "scouting"
] as const;
export type Resource = (typeof Resources)[number];

export const Actions = ["view", "edit", "manage", "create", "submit"] as const;
export type Action = (typeof Actions)[number];

export const Conditions = ["own", "all", null] as const;
export type Condition = (typeof Conditions)[number];

export type Permission = {
  resource: Resource;
  action: Action;
  condition: Condition;
};

export const ResourceEnum = z.enum(Resources);
export const ActionEnum = z.enum(Actions);
export const ConditionEnum = z.enum(Conditions.filter((c) => c !== null));

export const PermissionStringSchema = z.union([
  z.templateLiteral([ResourceEnum, ":", ActionEnum, ":", ConditionEnum]),
  z.templateLiteral([ResourceEnum, ":", ActionEnum])
]);

export const PermissionRuleSchema = z.union([
  PermissionStringSchema,
  z.object({
    permissions: z.array(PermissionStringSchema),
    type: z.enum(["and", "or"])
  })
]);

export const RoutePermissionsSchema = z.record(
  z.string(),
  PermissionRuleSchema
);

export type PermissionString = z.infer<typeof PermissionStringSchema>;
export type PermissionRule = z.infer<typeof PermissionRuleSchema>;
export type RoutePermissionsMap = z.infer<typeof RoutePermissionsSchema>;
