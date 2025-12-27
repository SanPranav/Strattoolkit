"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { RBACRulesPanel } from "./RBACRulesPanel";
import { makeSBRequest } from "@/lib/supabase/supabase";
import {
  matchesPermission,
  parsePermissionString,
  type Permission,
  type PermissionString,
  type UserRole
} from "@/lib/types/rbac";

// Simple client-side load states for RBAC access
type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "forbidden" }
  | { status: "ready"; canEdit: boolean };

async function fetchPermissions(role: UserRole): Promise<Permission[]> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb.from("rbac").select("resource, action, condition").eq("user_role", role)
  );

  if (error || !data) return [];

  return data.map((row) => ({
    resource: row.resource as Permission["resource"],
    action: row.action as Permission["action"],
    condition: (row.condition as Permission["condition"]) ?? null
  }));
}

async function checkPermission(role: UserRole, permission: PermissionString) {
  const permissions = await fetchPermissions(role);
  const parsed = parsePermissionString(permission);

  return permissions.some((perm) => matchesPermission(perm, parsed));
}

export function RBACSettings() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data: authData, error: authError } = await makeSBRequest(
        async (sb) => sb.auth.getUser()
      );

      if (cancelled) return;

      if (authError || !authData?.user) {
        setState({
          status: "error",
          message: "Unable to load user data."
        });
        return;
      }

      const { data: userData, error: userDataError } = await makeSBRequest(
        async (sb) =>
          sb
            .from("UserData")
            .select("user_role")
            .eq("user_id", authData.user.id)
            .limit(1)
            .single()
      );

      if (cancelled) return;

      if (userDataError || !userData) {
        setState({ status: "error", message: "Unable to load user role." });
        return;
      }

      const canView = await checkPermission(
        userData.user_role as UserRole,
        "settings:view:all"
      );

      if (cancelled) return;

      if (!canView) {
        setState({ status: "forbidden" });
        return;
      }

      const canEdit = await checkPermission(
        userData.user_role as UserRole,
        "rbac:manage"
      );

      if (cancelled) return;

      setState({ status: "ready", canEdit });
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <Card className="border-border/70 bg-card/60 p-6 text-sm">
        Loading RBAC settings...
      </Card>
    );
  }

  if (state.status === "error") {
    return (
      <Card className="border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
        {state.message}
      </Card>
    );
  }

  if (state.status === "forbidden") {
    return (
      <Card className="border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
        You do not have permission to view RBAC settings.
      </Card>
    );
  }

  return <RBACRulesPanel canEdit={state.canEdit} />;
}
