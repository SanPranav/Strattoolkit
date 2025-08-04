import { useState, useEffect } from "react";

import { registerAuthCallback } from "@/lib/db/user";
import type { pb_UserColItem } from "@/lib/types";

export function useUser() {
  const [user, setUser] = useState<pb_UserColItem | null>(null);

  useEffect(() => {
    return registerAuthCallback(setUser);
  }, []);

  return { user, setUser } as const;
}
