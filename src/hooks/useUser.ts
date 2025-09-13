import { useState, useEffect } from "react";

import { registerAuthCallback } from "@/lib/db/user";
import type { User } from "@/lib/types/pocketbase";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return registerAuthCallback(setUser);
  }, []);

  return { user, setUser } as const;
}
