import { redirect } from "next/navigation";

import OutreachPage from "./OutreachPage";
import { getUserRole, hasPermission } from "@/lib/permissions";
import { getOutreachMinutesCutoff } from "@/lib/db/outreach";
import { PBServer } from "@/lib/pb";
import { getUserData } from "@/lib/db/user";

export default async function ServerDataFetcher() {
  const pb = await PBServer.getInstance();

  const [error, userData] = await getUserData(
    pb.authStore.record?.id || "",
    pb
  );
  const userRole = getUserRole(pb);

  if (error || !userData.expand?.user?.id || !userRole) {
    redirect("/auth/login?redirect=/outreach");
  }

  const outreachMinutesCutoff = await getOutreachMinutesCutoff(pb);

  const canManage = hasPermission(userRole, "outreach:manage");

  return (
    <OutreachPage
      {...{
        canManage,
        user: userData.expand.user,
        userData,
        outreachMinutesCutoff
      }}
    />
  );
}
