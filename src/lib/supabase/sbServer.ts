import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { assertEnv } from "../utils";
import { Database } from "../types/supabase.gen";
import { createClient } from "@supabase/supabase-js";
import { cache } from "react";

type CookieStore = Parameters<typeof createServerClient>[2]["cookies"];

export const getSBServerClient = (cookies: CookieStore) => {
  const url = assertEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const anonKey = assertEnv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll: cookies.getAll,
      setAll: cookies.setAll
    }
  });
};

export const getSBSuperuserClient = cache(() => {
  const url = assertEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const serviceRoleSecret = assertEnv(
    "SUPABASE_SERVICE_KEY",
    process.env.SUPABASE_SERVICE_KEY
  );

  return createClient(url, serviceRoleSecret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
});

export async function getSBServerClientWithNextJSCookies() {
  const cookieStore = await cookies();
  return getSBServerClient({
    getAll: () => {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value }) => cookieStore.set(name, value));
    }
  });
}
