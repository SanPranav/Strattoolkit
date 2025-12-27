// import { useMemo } from "react";
// import { useUser } from "./useUser";
// import type { PermissionString } from "@/lib/types/rbac";

// export function usePermission(permission: PermissionString): boolean {
//   const { user } = useUser();
//   const role = user?.user_role ?? "guest";


//   // fully invalid
//   // // For client components, we need to check permissions synchronously
//   // // This is a simplified check - for full RBAC, use checkPermission async
//   // // For now, we'll use a fallback based on role hierarchy
//   // return useMemo(() => {
//   //   // if (!role) return false;

//   //   // // Fallback permission check based on role hierarchy
//   //   // // This will be replaced by proper RBAC once permissions are loaded
//   //   // const roleHierarchy: Record<string, string[]> = {
//   //   //   guest: ["scouting:view", "scouting:submit"],
//   //   //   member: [
//   //   //     "scouting:view",
//   //   //     "scouting:submit",
//   //   //     "outreach:view",
//   //   //     "settings:view",
//   //   //     "scouting:view_submissions"
//   //   //   ],
//   //   //   admin: [
//   //   //     "scouting:view",
//   //   //     "scouting:submit",
//   //   //     "outreach:view",
//   //   //     "settings:view",
//   //   //     "scouting:view_submissions",
//   //   //     "outreach:manage",
//   //   //     "settings:manage"
//   //   //   ]
//   //   // };

//   //   // const rolePerms = roleHierarchy[role] ?? [];
//   //   // return rolePerms.includes(permission);
//   // }, [role, permission]);
// }
