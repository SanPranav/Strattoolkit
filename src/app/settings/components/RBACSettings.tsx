"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { RBACRulesPanel } from "./RBACRulesPanel";
import { hasPermission } from "@/lib/rbac/rbac";
import { useUser } from "@/hooks/useUser";

// Simple client-side load states for RBAC access
type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "forbidden" }
  | { status: "ready"; canEdit: boolean };

export function RBACSettings() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const { user, isLoading } = useUser();

  useEffect(() => {
    const load = async () => {
      if (isLoading) return;

      if (!user) {
        setState({ status: "error", message: "User not found." });
        return;
      }
      const canView = await hasPermission(user.user_role, {
        permissions: ["rbac:view", "rbac:manage"],
        type: "or"
      });

      if (!canView) {
        setState({ status: "forbidden" });
        return;
      }

      const canEdit = await hasPermission(user.user_role, {
        permissions: ["rbac:edit", "rbac:manage"],
        type: "or"
      });

      setState({ status: "ready", canEdit });
    };

    load();
  }, [isLoading, user]);

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
