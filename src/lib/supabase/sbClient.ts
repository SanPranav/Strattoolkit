import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/supabase.gen";
import { assertEnv } from "../utils";

export function getSBBrowserClient() {
  const url = assertEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const anonKey = assertEnv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return createBrowserClient<Database>(url, anonKey);
}
