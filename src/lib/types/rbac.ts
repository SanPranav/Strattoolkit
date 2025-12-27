import type { UserData } from "./db";
import type { Tables, TablesInsert } from "./supabase";

export type UserRole = UserData["user_role"];

const Resource = ["outreach", "settings", "scouting", "users", "rbac"] as const;
export type Resource = (typeof Resource)[number];

const Action = [
  "view",
  "manage",
  "edit",
  "submit",
  "delete",
  "create"
] as const;
export type Action = (typeof Action)[number];

const Condition = ["own", "all", null] as const;
export type Condition = (typeof Condition)[number];

export type Permission = {
  resource: Resource;
  action: Action;
  condition: Condition;
};

export type PermissionString =
  | `${Resource}:${Action}`
  | `${Resource}:${Action}:${Exclude<Condition, null>}`;

export type RBACRule = Tables<"rbac">;

export type RBACRuleInsert = Omit<
  TablesInsert<"rbac">,
  "id" | "created_at" | "updated_at"
>;

export type RBACRuleUpdate = Partial<
  Omit<TablesInsert<"rbac">, "id" | "created_at" | "updated_at">
>;

export function parsePermissionString(
  permission: PermissionString
): Permission {
  const parts = permission.split(":") as [Resource, Action, Condition?];
  return {
    resource: parts[0],
    action: parts[1],
    condition: parts[2] ?? null
  };
}

export function formatPermissionString(
  permission: Permission
): PermissionString {
  if (permission.condition) {
    return `${permission.resource}:${permission.action}:${permission.condition}`;
  }
  return `${permission.resource}:${permission.action}`;
}

export function matchesPermission(
  rule: { resource: string; action: string; condition: string | null },
  permission: Permission
): boolean {
  const ruleCondition = rule.condition ?? null;
  const permCondition = permission.condition ?? null;

  return (
    rule.resource === permission.resource &&
    rule.action === permission.action &&
    ruleCondition === permCondition
  );
}
