import z from "zod";
import type { UserData } from "./db";
import type { Tables, TablesInsert } from "./supabase";

export type UserRole = UserData["user_role"];

export const Resources = [
  "outreach",
  "settings",
  "scouting",
  "users",
  "rbac"
] as const;
export type Resource = (typeof Resources)[number];

export const Actions = [
  "view",
  "manage",
  "edit",
  "submit",
  "delete",
  "create"
] as const;
export type Action = (typeof Actions)[number];

export const Conditions = ["own", "all", null] as const;
export type Condition = (typeof Conditions)[number];

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

export type RoutePermissionsObject = {
  [key: string]:
    | PermissionString
    | (RoutePermissionsObject & { base: PermissionString })
    | null
    | undefined;
};

export const ResourceEnum = z.enum(Resources);
export const ActionEnum = z.enum(Actions);
export const ConditionEnum = z.enum(Conditions.filter((c) => c !== null));

export const PermissionStringSchema = z.union([
  z.templateLiteral([ResourceEnum, ":", ActionEnum, ":", ConditionEnum]),
  z.templateLiteral([ResourceEnum, ":", ActionEnum])
]);

export const RoutePermissionsSchema: z.ZodType<RoutePermissionsObject> =
  z.record(
    z.string(),
    z
      .union([
        PermissionStringSchema,
        z.lazy(() =>
          RoutePermissionsSchema.and(z.object({ base: PermissionStringSchema }))
        )
      ])
      .nullish()
  );

export type PermissionStringSchema = z.infer<typeof PermissionStringSchema>;
