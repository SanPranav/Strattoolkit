import { redirect } from "next/navigation";

import { execPocketbase } from "@/lib/pbaseServer";
import type { User, UserData } from "@/lib/types/pocketbase";

import OutreachPage from "./OutreachPage";

export default async function ServerDataFetcher() {
  const [userData, user, outreachMinutesCutoff] = await execPocketbase(
    async (pb) => {
      const authRecord = pb.authStore.record as User;

      let data: UserData | undefined;
      let outreachMinutesCutoff = 900;
      try {
        data = await pb
          .collection("UserData")
          .getFirstListItem<UserData>(`user='${authRecord.id}'`, {
            expand: "user"
          });
        const record = await pb
          .collection("Settings")
          .getFirstListItem("key='OutreachMinsCutoff'");

        outreachMinutesCutoff = parseInt(record.value) || 900;
      } catch (e) {
        console.warn(
          `[OutreachPage: "${authRecord ? authRecord?.id : "? id ?"}"]`,
          e
        );
      }

      return [data, authRecord, outreachMinutesCutoff];
    }
  );

  if (!user?.id) {
    redirect("/auth/login");
  }

  const isAdmin = user.role === "admin";

  return (
    <OutreachPage {...{ isAdmin, user, userData, outreachMinutesCutoff }} />
  );
}
