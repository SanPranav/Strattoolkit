import OutreachPage from "./OutreachPage";
import { getUserRole, hasPermission } from "@/lib/permissions";
import { getOutreachMinutesCutoff } from "@/lib/db/outreach";
import { PBServer } from "@/lib/pb";
import { getUserData } from "@/lib/db/user";
import ServerToaster from "@/components/ServerToaster";

export const dynamic = "force-dynamic";

export default async function ServerDataFetcher() {
  const pb = await PBServer.getInstance();

  const [error, userData] = await getUserData(
    pb.authStore.record?.id || "",
    pb
  );
  const userRole = getUserRole(pb) || "guest";

  if (!userData?.expand?.user?.id) {
    return (
      <ServerToaster
        {...{
          message: `Error: '${error}'. Please try again later.`,
          type: "error"
        }}
      />
    );
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
