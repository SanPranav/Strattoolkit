"use server";

import { cookies } from "next/headers";
import { getSBServerClient } from "../supabase/sbServer";

import type { UserData } from "../types/db";

export async function getUserWithId(
  userId: string
): Promise<[string | null, UserData | null]> {
  const sb = getSBServerClient(await cookies());

  const { data, error } = await sb
    .from("UserData")
    .select("*")
    .eq("user", userId)
    .limit(1)
    .maybeSingle<UserData>();

  if (error || !data) {
    return [error?.message ?? "Failed to get user", null];
  }

  return [null, data];
}

export async function getAllUsers(): Promise<
  [string | null, UserData[] | null]
> {
  const sb = getSBServerClient(await cookies());

  const { data, error } = await sb
    .from("UserData")
    .select("*")
    .order("name", { ascending: true });

  if (error || !data) {
    return [error?.message ?? "Failed to get user", null];
  }

  return [null, data];
}
