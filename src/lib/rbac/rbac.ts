"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getSBServerClient } from "../supabase/sbServer";
import { makeSBRequest } from "../supabase/supabase";
import { logger } from "../logger";
import type {
  Permission,
  PermissionString,
  RBACRule,
  RBACRuleInsert,
  RBACRuleUpdate,
  UserRole
} from "../types/rbac";
import {
  getCachedPermissions,
  setCachedPermissions,
  invalidateCache
} from "./cache";
import { parsePermissionString, matchesPermission } from "../types/rbac";

export async function fetchPermissionsForRole(
  role: UserRole,
  client?: SupabaseClient
): Promise<Permission[]> {
  const cached = getCachedPermissions(role);
  if (cached) {
    return cached;
  }

  const clientToUse =
    client ?? (await getSBServerClient({ getAll: () => [], setAll: () => {} }));

  const rolesToFetch: UserRole[] = (() => {
    switch (role) {
      case "admin":
        return ["admin", "member", "guest"];
      case "member":
        return ["member", "guest"];
      case "guest":
        return ["guest"];
      default:
        return [role];
    }
  })();

  const { data, error } = await clientToUse
    .from("rbac")
    .select("resource, action, condition")
    .in("user_role", rolesToFetch);

  if (error) {
    logger.error(error, `[RBAC] Failed to fetch permissions for role ${role}:`);
    return [];
  }

  const permissions: Permission[] =
    data?.map((row) => ({
      resource: row.resource as Permission["resource"],
      action: row.action as Permission["action"],
      condition: row.condition as Permission["condition"]
    })) ?? [];

  if (role === "admin") {
    permissions.push(
      {
        resource: "settings",
        action: "view",
        condition: "all"
      },
      {
        resource: "settings",
        action: "edit",
        condition: "all"
      }
    );
  }

  setCachedPermissions(role, permissions);
  return permissions;
}

export async function fetchAllRBACRules(): Promise<RBACRule[]> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb
      .from("rbac")
      .select("resource, action, condition")
      .order("user_role", { ascending: true })
  );

  if (error) {
    logger.error(error, "[RBAC] Failed to fetch all RBAC rules:");
    return [];
  }

  return (data ?? []) as RBACRule[];
}

export async function createRBACRule(
  rule: RBACRuleInsert
): Promise<[string | null, RBACRule | null]> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb
      .from("rbac")
      .insert({
        user_role: rule.user_role,
        resource: rule.resource,
        action: rule.action,
        condition: rule.condition ?? null
      })
      .select("*")
      .maybeSingle()
  );

  if (error || !data) {
    logger.error(
      error,
      `[RBAC] Failed to create RBAC rule: ${rule.resource}:${rule.action}`
    );
    return [error?.message ?? "Failed to create RBAC rule", null];
  }

  invalidateCache(rule.user_role);
  return [null, data as RBACRule];
}

export async function updateRBACRule(
  id: number,
  rule: RBACRuleUpdate
): Promise<[string | null, RBACRule | null]> {
  const updatePayload: Partial<RBACRule> = {};

  if (rule.user_role !== undefined) updatePayload.user_role = rule.user_role;
  if (rule.resource !== undefined) updatePayload.resource = rule.resource;
  if (rule.action !== undefined) updatePayload.action = rule.action;
  if (rule.condition !== undefined) updatePayload.condition = rule.condition;

  const { data, error } = await makeSBRequest(async (sb) =>
    sb.from("rbac").update(updatePayload).eq("id", id).select("*").maybeSingle()
  );

  if (error || !data) {
    logger.error(error, `[RBAC] Failed to update RBAC rule ${id}:`);
    return [error?.message ?? "Failed to update RBAC rule", null];
  }

  const updatedRule = data as RBACRule;
  invalidateCache(updatedRule.user_role);
  if (rule.user_role && rule.user_role !== updatedRule.user_role) {
    invalidateCache(rule.user_role);
  }

  return [null, updatedRule];
}

export async function deleteRBACRule(id: number): Promise<[string | null]> {
  const { data: ruleToDelete, error: fetchError } = await makeSBRequest(
    async (sb) => sb.from("rbac").select("user_role").eq("id", id).maybeSingle()
  );

  if (fetchError) {
    logger.error(
      fetchError,
      `[RBAC] Failed to fetch RBAC rule ${id} for deletion:`
    );
    return [fetchError.message];
  }

  const { error } = await makeSBRequest(async (sb) =>
    sb.from("rbac").delete().eq("id", id)
  );

  if (error) {
    logger.error(error, `[RBAC] Failed to delete RBAC rule ${id}:`);
    return [error.message];
  }

  if (ruleToDelete) {
    invalidateCache(ruleToDelete.user_role as UserRole);
  }

  return [null];
}

export async function hasPermission(
  role: UserRole,
  permission: PermissionString,
  client?: SupabaseClient
): Promise<boolean> {
  const permissions = await fetchPermissionsForRole(role, client);
  const parsedPermission = parsePermissionString(permission);

  return permissions.some((perm) =>
    matchesPermission(
      {
        resource: perm.resource,
        action: perm.action,
        condition: perm.condition
      },
      parsedPermission
    )
  );
}
