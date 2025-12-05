import { useCallback, useEffect, useState } from "react";
import { getSBBrowserClient } from "@/lib/supabase/sbClient";

import type { FullUserData, User } from "@/lib/types/db";
import { getUserDataByUserId } from "@/lib/db/user";

export function useUser() {
  const supabase = getSBBrowserClient();
  const [user, setUser] = useState<FullUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const combineUserData = useCallback(async (user: User) => {
    const [error, userData] = await getUserDataByUserId(user?.id || "");

    if (error || !userData) {
      return;
    }

    const union = { ...user, ...userData } as FullUserData;

    return union;
  }, []);

  useEffect(() => {
    let active = true;
    let subscription: { unsubscribe: () => void } | null = null;

    (async () => {
      const userRes = await supabase.auth.getUser();

      if (!active) return;

      if (userRes.error || !userRes.data.user) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const combinedUser = await combineUserData(userRes.data.user);

      if (!active) return;

      setUser(combinedUser || null);
      setIsLoading(false);

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session?.user) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        combineUserData(session?.user).then((combinedUser) => {
          if (!active) return;
          setUser(combinedUser || null);
          setIsLoading(false);
        });
      });

      subscription = data.subscription;
    })();

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, [supabase, setUser, combineUserData]);

  return { user, isLoading } as const;
}
