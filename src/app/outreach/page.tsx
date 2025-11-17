import OutreachPage from "./OutreachPage";
import { getUserRole, hasPermission } from "@/lib/permissions";
import {
  fetchEvents,
  fetchUserSessionEventDates,
  getOutreachMinutesCutoff
} from "@/lib/db/outreach";
import { PBServer, PBClientBase } from "@/lib/pb";
import { getUserData, listUserData } from "@/lib/db/user";
import ServerToaster from "@/components/ServerToaster";
import type { OutreachEvent } from "@/lib/types/pocketbase";
import type { ErrorCodes } from "@/lib/states";

const PAGE_SIZE = 25;

export const dynamic = "force-dynamic";
export const revalidate = 0;

type OutreachServerSnapshot = {
  initialUsers: Awaited<ReturnType<typeof listUserData>>[1];
  initialUsersError: Awaited<ReturnType<typeof listUserData>>[0] | null;
  quickManageEvents: OutreachEvent[];
  activityTimestamps: string[];
};

async function loadOutreachSnapshot(
  client: PBClientBase,
  userId: string
): Promise<OutreachServerSnapshot> {
  const [
    [usersError, users],
    [eventsError, events],
    [activityError, activityDates]
  ] = await Promise.all([
    listUserData(1, PAGE_SIZE, client),
    fetchEvents(client),
    userId
      ? fetchUserSessionEventDates(userId, client)
      : Promise.resolve<[ErrorCodes, null]>(["01x01", null])
  ]);

  const quickManageEvents = (events ?? [])
    .filter((event) => {
      if (!event.date) return false;
      const eventTime = new Date(event.date).getTime();
      if (Number.isNaN(eventTime)) return false;
      const now = Date.now();
      const thirtyDaysAgo = now - 1000 * 60 * 60 * 24 * 30;
      return eventTime >= thirtyDaysAgo;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  return {
    initialUsers: users ?? null,
    initialUsersError: usersError,
    quickManageEvents,
    activityTimestamps:
      activityError || !Array.isArray(activityDates) ? [] : activityDates
  };
}

export default async function ServerDataFetcher() {
  const pb = await PBServer.getInstance();

  const [userError, userData] = await getUserData(
    pb.authStore.record?.id || "",
    pb
  );
  const userRole = getUserRole(pb) || "guest";

  if (!userData?.expand?.user?.id) {
    return (
      <ServerToaster
        {...{
          message: `Error: '${userError}'. Please try again later.`,
          type: "error"
        }}
      />
    );
  }

  const [outreachMinutesCutoff, snapshot] = await Promise.all([
    getOutreachMinutesCutoff(pb),
    loadOutreachSnapshot(pb, userData.expand.user.id)
  ]);

  const canManage = hasPermission(userRole, "outreach:manage");

  return (
    <OutreachPage
      {...{
        canManage,
        user: userData.expand.user,
        userData,
        outreachMinutesCutoff,
        pageSize: PAGE_SIZE,
        initialUsers: snapshot.initialUsers,
        initialUsersError: snapshot.initialUsersError,
        quickManageEvents: snapshot.quickManageEvents,
        activityTimestamps: snapshot.activityTimestamps
      }}
    />
  );
}
