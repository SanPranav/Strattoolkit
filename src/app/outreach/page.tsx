import { redirect } from "next/navigation";

import { execPocketbase } from "@/lib/pbaseServer";
import type { pb_UserColItem, pb_UserDataItem } from "@/lib/types";

import OutreachPage from "./OutreachPage";

export default async function ServerDataFetcher() {
  const [userData, user, outreachMinutesCutoff] = await execPocketbase(
    async (pb) => {
      const authRecord = pb.authStore.record as pb_UserColItem;

      let data: pb_UserDataItem | undefined;
      let outreachMinutesCutoff = 900;
      try {
        data = await pb
          .collection("UserData")
          .getFirstListItem<pb_UserDataItem>(`user='${authRecord.id}'`, {
            expand: "user"
          });
        const record = await pb
          .collection("Settings")
          .getFirstListItem("key='OutreachMinsCutoff'");

        outreachMinutesCutoff = parseInt(record.value) || 900;
      } catch (e) {
        console.warn(`[OutreachPage: "${authRecord?.id}"]`, e);
      }

      return [data, authRecord, outreachMinutesCutoff];
    }
  );

  if (!user?.id) {
    redirect("/auth/login");
  }

  const isAdmin = user.role === "admin";

  return <OutreachPage {...{ isAdmin, userData, outreachMinutesCutoff }} />;
}
