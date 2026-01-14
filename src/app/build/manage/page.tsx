"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNavbar } from "@/hooks/useNavbar";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useUser } from "@/hooks/useUser";
import { hasPermission } from "@/lib/rbac/rbac";
import { useQuery } from "@tanstack/react-query";
import { BUILD, USER } from "@/lib/types/queryKeys";
import {
  fetchBuildLocations,
  fetchBuildGroups,
  fetchBuildTasksWithUsers
} from "@/lib/db/build";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loader from "@/components/Loader";
import { ManageHeader } from "./components/ManageHeader";
import { LocationsTab } from "./components/LocationsTab";
import { GroupsTab } from "./components/GroupsTab";
import { TasksTab } from "./components/TasksTab";

export default function BuildManagePage() {
  const router = useRouter();
  const { user: userData, isLoading: isUserLoading } = useUser();
  const userId = userData?.user_id || "";
  const [activeTab, setActiveTab] = useState("locations");

  // Check if user can manage build
  const { data: canManageData, isLoading: isCanManageLoading } = useQuery({
    queryKey: USER.CAN_MANAGE_BUILD(userId),
    queryFn: () =>
      hasPermission(userData?.user_role || "guest", "build_tasks:manage"),
    enabled: !isUserLoading && !!userId
  });

  // Fetch data
  const {
    data: locations,
    isLoading: isLocationsLoading,
    refetch: refetchLocations
  } = useQuery({
    queryKey: BUILD.LOCATIONS,
    queryFn: async () => {
      const [error, data] = await fetchBuildLocations(false);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!canManageData
  });

  const {
    data: groups,
    isLoading: isGroupsLoading,
    refetch: refetchGroups
  } = useQuery({
    queryKey: BUILD.GROUPS,
    queryFn: async () => {
      const [error, data] = await fetchBuildGroups();
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!canManageData
  });

  const {
    data: tasks,
    isLoading: isTasksLoading,
    refetch: refetchTasks
  } = useQuery({
    queryKey: BUILD.TASKS,
    queryFn: async () => {
      const [error, data] = await fetchBuildTasksWithUsers();
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!canManageData
  });

  const { setDefaultExpanded, resetNavbar } = useNavbar();
  const isHydrated = useIsMounted();

  useEffect(() => {
    setDefaultExpanded(false);
    return () => {
      resetNavbar();
    };
  }, [setDefaultExpanded, resetNavbar]);

  // Redirect if not authorized
  useEffect(() => {
    if (!isUserLoading && !isCanManageLoading && !canManageData) {
      router.replace("/build");
    }
  }, [isUserLoading, isCanManageLoading, canManageData, router]);

  const isLoading = !isHydrated || isUserLoading || isCanManageLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  if (!canManageData) {
    return null; // Will redirect
  }

  return (
    <div className="container mx-auto min-h-screen flex flex-col gap-4 px-3 sm:px-4 pt-3 pb-24">
      <ManageHeader />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="locations" className="mt-4">
          <LocationsTab
            locations={locations || []}
            isLoading={isLocationsLoading}
            onRefresh={refetchLocations}
          />
        </TabsContent>

        <TabsContent value="groups" className="mt-4">
          <GroupsTab
            groups={groups || []}
            isLoading={isGroupsLoading}
            onRefresh={refetchGroups}
          />
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <TasksTab
            tasks={tasks || []}
            groups={groups || []}
            isLoading={isTasksLoading}
            userId={userId}
            onRefresh={refetchTasks}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
