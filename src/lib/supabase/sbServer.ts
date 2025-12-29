import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { assertEnv } from "../utils";
import { Database } from "../types/supabase";

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

export const getSBServerClientWithNextJSCookies = async () => {
  const cookieStore = await cookies();
  return getSBServerClient({
    getAll: () => {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value }) => cookieStore.set(name, value));
    }
  });
};
