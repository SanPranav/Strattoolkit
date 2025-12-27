import {
  Permission,
  PermissionString,
  Resource,
  Condition,
  Action
} from "../types/rbac";

export function matchesPermission(
  given: { resource: string; action: string; condition: string | null },
  required: Permission
): boolean {
  const givenCondition = given.condition ?? "all";
  const requiredCondition = required.condition ?? null;

  if (
    given.resource !== required.resource ||
    given.action !== required.action
  ) {
    return false;
  }

  // Exact match
  if (givenCondition === requiredCondition) {
    return true;
  }

  // "all" permission covers "own" and null
  if (givenCondition === "all" && ["own", null].includes(requiredCondition)) {
    return true;
  }

  return false;
}

export function formatPermissionString(
  permission: Permission
): PermissionString {
  if (permission.condition) {
    return `${permission.resource}:${permission.action}:${permission.condition}`;
  }
  return `${permission.resource}:${permission.action}`;
}

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
