import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSBBrowserClient } from "@/lib/supabase/sbClient";

import type { FullUserData } from "@/lib/types/db";
import { getUserDataWithUserId } from "@/lib/db/user";
import { fetchUserActivitySummary } from "@/lib/db/activity";
import { USER } from "@/lib/types/queryKeys";

const CACHE_TIME = 1000 * 60 * 5; // 5 minutes

export function useUser() {
  const supabase = getSBBrowserClient();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<FullUserData | null>({
    queryKey: USER.AUTH_USER,
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        return null;
      }

      const userId = data.user.id;
      const [[userError, userData], [, activity]] = await Promise.all([
        getUserDataWithUserId(userId),
        fetchUserActivitySummary(userId, ["build", "outreach"])
      ]);

      if (userError || !userData) {
        return null;
      }

      return {
        ...data.user,
        ...userData,
        ...activity
      } as FullUserData;
    },
    staleTime: CACHE_TIME,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: USER.AUTH_USER });
    });

    return () => subscription.unsubscribe();
  }, [queryClient, supabase]);

  return { user, isLoading } as const;
}
