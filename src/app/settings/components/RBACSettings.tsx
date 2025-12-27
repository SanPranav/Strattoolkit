"use server";

import { Card } from "@/components/ui/card";
import { hasPermission } from "@/lib/rbac/rbac";
import { RBACRulesPanel } from "./RBACRulesPanel";
import { getUserDataByUserId } from "@/lib/db/user";
import { makeSBRequest } from "@/lib/supabase/supabase";

export async function RBACSettings() {
  const { data: userData, error } = await makeSBRequest(async (sb) => {
    const { data, error } = await sb.auth.getUser();

    if (error || !data.user) {
      return { data: null, error: error || new Error("No user logged in") };
    }

    return sb
      .from("UserData")
      .select("user_role")
      .eq("user_id", data.user?.id)
      .limit(1)
      .single();
  });

  if (error || !userData) {
    return (
      <Card className="border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
        Unable to load user data.
      </Card>
    );
  }

  const canView = await hasPermission(userData.user_role, "settings:view:all");
  const canEdit = await hasPermission(userData.user_role, "rbac:manage");

  if (!canView) {
    return (
      <Card className="border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
        You do not have permission to view RBAC settings.
      </Card>
    );
  }

  return <RBACRulesPanel canEdit={Boolean(canEdit)} />;
}
