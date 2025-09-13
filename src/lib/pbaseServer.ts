"use server";

import "server-only";

import { cookies } from "next/headers";
import PocketBase, { BaseAuthStore } from "pocketbase";

export async function execPocketbase<T>(fn: (pb: PocketBase) => T): Promise<T> {
  const ramAuthStore = new BaseAuthStore();
  const pbServer = new PocketBase(
    process.env.NEXT_PUBLIC_PB_URL || "",
    ramAuthStore
  );

  const authData = await getPocketbaseCookie();
  pbServer.authStore.loadFromCookie(authData);
  // pbServer.collection("users").authRefresh();

  const ret = await fn(pbServer);

  pbServer.authStore.clear();

  return ret as T;
}

export async function setPocketbaseCookie(value: string) {
  const cookieStore = await cookies();
  cookieStore.set("pb_auth", value, {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    secure: false,
    httpOnly: false,
    sameSite: "lax"
  });
}

export async function getPocketbaseCookie() {
  const cookieStore = await cookies();
  const authData = cookieStore.get("pb_auth")?.value || "";

  return authData;
}
