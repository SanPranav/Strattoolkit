import { useState, useEffect } from "react";

import { registerAuthCallback } from "@/lib/db/user";
import type { User } from "@/lib/types/pocketbase";
import { PBBrowser } from "@/lib/pb";

export function useUser() {
  const pb = PBBrowser.getInstance();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return registerAuthCallback(setUser, pb);
  }, []);

  return { user, setUser } as const;
}
