"use server";

import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { makeSBRequest } from "../supabase/supabase";
import { getSBSuperuserClient } from "../supabase/sbServer";
import { logger } from "../logger";
import type {
  Permission,
  PermissionRule,
  PermissionString,
  RBACRule,
  RBACRuleInsert,
  RBACRuleUpdate,
  UserRole
} from "../types/rbac";
import {
  getCachedPermissions,
  setFullCachedPermissions,
  invalidateCache,
  setCachedPermissions
} from "./cache";
import { parsePermissionString, matchesPermission } from "./matcher";
import { ErrorOrData } from "../types/utils";

export async function fetchPermissionsForRole(
  role: UserRole,
  client?: SupabaseClient
): Promise<Permission[]> {
  const cached = getCachedPermissions(role);
  if (cached) {
    logger.debug(
      { role, count: cached.length },
      "[RBAC] Returning cached permissions"
    );
    return cached;
  }

  const { data, error } = await makeSBRequest(
    async (sb) => sb.from("rbac").select("*").eq("user_role", role),
    client ?? getSBSuperuserClient()
  );

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

  logger.debug(
    { role, count: permissions.length },
    "[RBAC] Permissions fetched from database"
  );

  setCachedPermissions(role, permissions);
  return permissions;
}

export async function fetchAllRBACRules(): Promise<Partial<
  Record<UserRole, RBACRule[]>
> | null> {
  const { data, error } = await makeSBRequest(
    async (sb) =>
      sb.from("rbac").select("*").order("user_role", { ascending: true }),
    getSBSuperuserClient()
  );

  if (error) {
    logger.error(error, "[RBAC] Failed to fetch all RBAC rules:");
    return null;
  }

  const grouped = (data ?? []).reduce((acc, rule) => {
    const key = rule.user_role as UserRole;
    if (!acc[key]) acc[key] = [] as RBACRule[];
    (acc[key] as RBACRule[]).push(rule as RBACRule);
    return acc;
  }, {} as Partial<Record<UserRole, RBACRule[]>>);

  setFullCachedPermissions(grouped as any);
  logger.debug(
    { roles: Object.keys(grouped).length },
    "[RBAC] Loaded all RBAC rules"
  );
  return grouped;
}

export async function createRBACRule(
  rule: RBACRuleInsert
): Promise<ErrorOrData<RBACRule, PostgrestError>> {
  const { data, error } = await makeSBRequest(
    async (sb) =>
      sb
        .from("rbac")
        .insert({
          user_role: rule.user_role,
          resource: rule.resource,
          action: rule.action,
          condition: rule.condition ?? null
        })
        .select("*")
        .maybeSingle(),
    getSBSuperuserClient()
  );

  if (error || !data) {
    logger.error(
      error,
      `[RBAC] Failed to create RBAC rule: ${rule.resource}:${rule.action}`
    );
    return [error as any, null];
  }

  invalidateCache(rule.user_role);
  logger.debug(
    { rule: `${rule.user_role}:${rule.resource}:${rule.action}` },
    "[RBAC] Created RBAC rule"
  );
  return [null, data as RBACRule];
}

export async function updateRBACRule(
  id: number,
  rule: RBACRuleUpdate
): Promise<ErrorOrData<RBACRule, PostgrestError>> {
  const updatePayload: Partial<RBACRule> = {};

  if (rule.user_role !== undefined) updatePayload.user_role = rule.user_role;
  if (rule.resource !== undefined) updatePayload.resource = rule.resource;
  if (rule.action !== undefined) updatePayload.action = rule.action;
  if (rule.condition !== undefined) updatePayload.condition = rule.condition;

  const { data, error } = await makeSBRequest(
    async (sb) =>
      sb
        .from("rbac")
        .update(updatePayload)
        .eq("id", id)
        .select("*")
        .maybeSingle(),
    getSBSuperuserClient()
  );

  if (error || !data) {
    logger.error(error, `[RBAC] Failed to update RBAC rule ${id}:`);
    return [error as any, null];
  }

  const updatedRule = data as RBACRule;
  invalidateCache(updatedRule.user_role);
  if (rule.user_role && rule.user_role !== updatedRule.user_role) {
    invalidateCache(rule.user_role);
  }

  logger.debug({ id, rule: updatePayload }, "[RBAC] Updated RBAC rule");

  return [null, updatedRule];
}

export async function deleteRBACRule(
  id: number
): Promise<ErrorOrData<"SUCCESS", PostgrestError>> {
  const { data: ruleToDelete, error: fetchError } = await makeSBRequest(
    async (sb) =>
      sb.from("rbac").select("user_role").eq("id", id).maybeSingle(),
    getSBSuperuserClient()
  );

  if (fetchError) {
    logger.error(
      fetchError,
      `[RBAC] Failed to fetch RBAC rule ${id} for deletion:`
    );
    return [fetchError, null];
  }

  const { error } = await makeSBRequest(
    async (sb) => sb.from("rbac").delete().eq("id", id),
    getSBSuperuserClient()
  );

  if (error) {
    logger.error(error, `[RBAC] Failed to delete RBAC rule ${id}:`);
    return [error, null];
  }

  if (ruleToDelete) {
    invalidateCache(ruleToDelete.user_role as UserRole);
  }

  logger.debug({ id }, "[RBAC] Deleted RBAC rule");

  return [null, "SUCCESS"];
}

export async function checkPermission(
  role: UserRole,
  permission: PermissionString,
  client?: SupabaseClient
): Promise<boolean> {
  const permissions = await fetchPermissionsForRole(role, client);
  const parsedPermission = parsePermissionString(permission);

  const hasPermission = permissions.some((perm) =>
    matchesPermission(
      {
        resource: perm.resource,
        action: perm.action,
        condition: perm.condition
      },
      parsedPermission
    )
  );

  logger.debug(
    { role, permission, parsedPermission, permissions, hasPermission },
    "[RBAC] Checking permission"
  );

  return hasPermission;
}

export async function hasPermission(
  role: UserRole,
  permission: PermissionRule,
  client?: SupabaseClient
): Promise<boolean> {
  if (typeof permission === "string") {
    return checkPermission(role, permission, client);
  }

  const { permissions, type } = permission;

  const permissionsMap = Promise.all(
    permissions.map((perm) => checkPermission(role, perm, client))
  );
  if (type === "and") {
    return permissionsMap.then((results) => results.every(Boolean));
  } else if (type === "or") {
    return permissionsMap.then((results) => results.some(Boolean));
  } else {
    logger.error(
      { permission },
      "[RBAC] Invalid permission rule type. Expected 'and' or 'or'."
    );
    return false;
  }
}
