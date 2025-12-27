"use client";

import { useEffect, useState } from "react";
import { useNavbar } from "@/hooks/useNavbar";
import { useIsMounted } from "@/hooks/useIsHydrated";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/hooks/useUser";
import { hasPermission } from "@/lib/rbac/rbac";

import { Separator } from "@/components/ui/separator";
import Loader from "@/components/Loader";
import { OutreachTable } from "./components/OutreachTable";
import { OutreachHeader } from "./components/OutreachHeader";
import { UserProgressCard } from "./components/UserProgressCard";
import { ActivityOverviewCard } from "./components/ActivityOverviewCard";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { formatMinutes } from "@/lib/utils";
import { getOutreachMinutesThreshold } from "@/lib/db/outreach";
import { fetchTotalActivityMinutes } from "@/lib/db/activity";
import { USER, OUTREACH } from "@/lib/types/queryKeys";

export default function OutreachPage() {
  const { user: userData, isLoading: isUserLoading } = useUser();
  const { data: canManageData, isLoading: isCanManageLoading } = useQuery({
    queryKey: USER.CAN_MANAGE_OUTREACH(userData?.user_id || ""),
    queryFn: () => {
      return hasPermission(
        userData?.user_role || "guest",
        "outreach:manage:all"
      );
    }
  });
  const {
    data: outreachMinutesThreshold,
    isLoading: isOutreachMinutesLoading
  } = useQuery({
    queryKey: OUTREACH.MINUTES_THRESHOLD,
    queryFn: getOutreachMinutesThreshold
  });

  const { data: totalOutreachMinutesAllUsers = 0 } = useQuery<number>({
    queryKey: OUTREACH.TOTAL_MINUTES,
    queryFn: async () => {
      const [error, total] = await fetchTotalActivityMinutes(["outreach"]);
      if (error || total === null) {
        throw new Error(error ?? "Failed to load total outreach minutes");
      }
      return total;
    },
    staleTime: 60_000
  });

  const { setDefaultExpanded, resetNavbar } = useNavbar();
  const isHydrated = useIsMounted();
  const isMobile = useIsMobile();

  useEffect(() => {
    setDefaultExpanded(false);

    return () => {
      resetNavbar();
    };
  }, [setDefaultExpanded, resetNavbar]);

  if (
    !isHydrated ||
    isUserLoading ||
    isCanManageLoading ||
    isOutreachMinutesLoading
  )
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );

  const canManage = Boolean(canManageData);

  return (
    <div className="container mx-auto min-h-screen flex flex-col gap-3 px-3 sm:px-4 pt-3 pb-24">
      <OutreachHeader canManage={canManage} />

      <div className="grid grid-cols-1 md:grid-cols-[22rem_1fr] gap-3 md:gap-4">
        <UserProgressCard
          userData={userData || null}
          outreachMinutesThreshold={outreachMinutesThreshold || 0}
        />
        {!isMobile && (
          <ActivityOverviewCard userId={userData?.user_id || null} />
        )}
      </div>

      <Separator className="w-full" />

      <div className="flex-1 min-h-0 overflow-y-auto">
        <OutreachTable
          canManage={canManage}
          outreachMinutesThreshold={outreachMinutesThreshold || 0}
        />
      </div>

      <div className="flex justify-center pt-2">
        <Badge variant="secondary">
          Total outreach (all users):{" "}
          {formatMinutes(totalOutreachMinutesAllUsers)}
        </Badge>
      </div>
    </div>
  );
}
