import { useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSBBrowserClient } from "@/lib/supabase/sbClient";

import type { FullUserData, User } from "@/lib/types/db";
import { getUserDataByUserId } from "@/lib/db/user";
import { fetchUserActivitySummary } from "@/lib/db/activity";

export function useUser() {
  const supabase = getSBBrowserClient();
  const queryClient = useQueryClient();

  const combineUserData = useCallback(async (user: User) => {
    const [error, userData] = await getUserDataByUserId(user?.id || "");
    const [activityError, activity] = await fetchUserActivitySummary(
      user?.id || "",
      ["build", "outreach"]
    );

    if (error || !userData) {
      return;
    }

    const union = {
      ...user,
      ...userData,
      ...activity
    } as FullUserData;

    if (activityError) {
      // Activity data is optional; ignore errors silently for now
      return union;
    }

    return union;
  }, []);

  const { data: user, isLoading } = useQuery<FullUserData | null>({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const userRes = await supabase.auth.getUser();

      if (userRes.error || !userRes.data.user) {
        return null;
      }

      const combinedUser = await combineUserData(userRes.data.user);
      return combinedUser || null;
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [queryClient, supabase]);

  return { user, isLoading } as const;
}
