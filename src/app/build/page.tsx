"use client";

import { useEffect } from "react";
import { useNavbar } from "@/hooks/useNavbar";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/hooks/useUser";
import { hasPermission } from "@/lib/rbac/rbac";
import { useQuery } from "@tanstack/react-query";
import { BUILD, USER } from "@/lib/types/queryKeys";
import {
  fetchUserBuildSummary,
  getActiveSession,
  fetchUserTasks
} from "@/lib/db/build";

import { Separator } from "@/components/ui/separator";
import Loader from "@/components/Loader";
import { BuildHeader } from "./components/BuildHeader";
import { BuildHoursCard } from "./components/BuildHoursCard";
import { ActiveSessionCard } from "./components/ActiveSessionCard";
import { TaskList } from "./components/TaskList";
import { BuildCalendar } from "./components/BuildCalendar";

export default function BuildPage() {
  const { user: userData, isLoading: isUserLoading } = useUser();
  const userId = userData?.user_id || "";

  // Check if user can manage build (review tasks)
  const { data: canManageData, isLoading: isCanManageLoading } = useQuery({
    queryKey: USER.CAN_MANAGE_BUILD(userId),
    queryFn: () =>
      hasPermission(userData?.user_role || "guest", "build_tasks:manage"),
    enabled: !isUserLoading && !!userId
  });

  // Check if user can submit tasks for review
  const { data: canSubmitData, isLoading: isCanSubmitLoading } = useQuery({
    queryKey: USER.CAN_SUBMIT_BUILD_TASKS(userId),
    queryFn: () =>
      hasPermission(userData?.user_role || "guest", "build_tasks:submit"),
    enabled: !isUserLoading && !!userId
  });

  // Get user's build summary
  const {
    data: buildSummary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary
  } = useQuery({
    queryKey: BUILD.USER_SUMMARY(userId),
    queryFn: async () => {
      const [error, summary] = await fetchUserBuildSummary(userId);
      if (error) throw new Error(error);
      return summary;
    },
    enabled: !!userId,
    staleTime: 30000
  });

  // Get user's active session
  const {
    data: activeSession,
    isLoading: isActiveSessionLoading,
    refetch: refetchActiveSession
  } = useQuery({
    queryKey: BUILD.ACTIVE_SESSION(userId),
    queryFn: async () => {
      const [error, session] = await getActiveSession(userId);
      if (error) throw new Error(error);
      return session;
    },
    enabled: !!userId,
    staleTime: 10000,
    refetchInterval: 30000 // Poll to keep session status fresh
  });

  // Get user's tasks
  const {
    data: userTasks,
    isLoading: isTasksLoading,
    refetch: refetchTasks
  } = useQuery({
    queryKey: BUILD.USER_TASKS(userId),
    queryFn: async () => {
      const [error, tasks] = await fetchUserTasks(userId);
      if (error) throw new Error(error);
      return tasks;
    },
    enabled: !!userId,
    staleTime: 60000
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

  const isLoading =
    !isHydrated || isUserLoading || isCanManageLoading || isCanSubmitLoading || isSummaryLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  const canManage = Boolean(canManageData);
  const canSubmit = Boolean(canSubmitData);

  const handleSessionChange = () => {
    refetchActiveSession();
    refetchSummary();
  };

  const handleTaskChange = () => {
    refetchTasks();
  };

  return (
    <div className="container mx-auto min-h-screen flex flex-col gap-3 px-3 sm:px-4 pt-3 pb-24">
      <BuildHeader canManage={canManage} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <BuildHoursCard
          userData={userData || null}
          buildSummary={buildSummary || null}
        />
        <ActiveSessionCard
          userId={userId}
          activeSession={activeSession || null}
          isLoading={isActiveSessionLoading}
          onSessionChange={handleSessionChange}
        />
      </div>

      <Separator className="w-full" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-3 md:gap-4">
        <TaskList
          tasks={userTasks || []}
          isLoading={isTasksLoading}
          canManage={canManage}
          canSubmit={canSubmit}
          userId={userId}
          onTaskChange={handleTaskChange}
        />
        {!isMobile && <BuildCalendar userId={userId} />}
      </div>
    </div>
  );
}
