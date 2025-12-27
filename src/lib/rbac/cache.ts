import type { Permission, UserRole } from "../types/rbac";

type CacheEntry = {
  permissions: Permission[];
  storedAt: number;
};

const CACHE_TTL_MS = 60000; // 60 seconds

const permissionsCache = new Map<UserRole, CacheEntry>();

export function getCachedPermissions(role: UserRole): Permission[] | null {
  const entry = permissionsCache.get(role);
  if (!entry) return null;

  const age = Date.now() - entry.storedAt;
  if (age > CACHE_TTL_MS) {
    permissionsCache.delete(role);
    return null;
  }

  return entry.permissions;
}

export function setCachedPermissions(
  role: UserRole,
  permissions: Permission[]
): void {
  permissionsCache.set(role, {
    permissions,
    storedAt: Date.now()
  });
}

export function invalidateCache(role?: UserRole): void {
  if (role) {
    permissionsCache.delete(role);
  } else {
    permissionsCache.clear();
  }
}

export function clearCache(): void {
  permissionsCache.clear();
}
