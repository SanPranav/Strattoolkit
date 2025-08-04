import { ClientResponseError } from "pocketbase";

import { pb } from "@/lib/pbaseClient";
import { PB_Codes } from "@/lib/states";
import { Dispatch, SetStateAction } from "react";
import { pb_UserColItem } from "../types";
import { getPocketbaseCookie, setPocketbaseCookie } from "../pbaseServer";

type StateTuple = [null, string] | [ClientResponseError, null];
type PromiseStateTuple = Promise<StateTuple>;

export async function newUser(email: string, password: string, name: string) {
  try {
    const preExisting = await pb
      .collection("users")
      .getFirstListItem(`email="${email}"`);

    if (preExisting.id) return ["ALREADY_EXISTS", null];
  } catch (error: any) {
    console.warn(error);
  }

  const res1 = await create_User(email, password, name);
  if (res1[0] instanceof ClientResponseError) {
    return [PB_Codes[res1[0].status as keyof typeof PB_Codes], null];
  }

  return [null, res1[1]];
}

export async function create_User(
  email: string,
  password: string,
  name: string
): PromiseStateTuple {
  try {
    const user = await pb.collection("users").create({
      email,
      password,
      passwordConfirm: password,
      emailVisibility: true,
      name,
      role: "member"
    });

    return [null, user.id];
  } catch (error: any) {
    console.log("User creation failed:", error);

    return [error, null];
  }
}

export function registerAuthCallback(
  setUser: Dispatch<SetStateAction<pb_UserColItem | null>>
) {
  return pb.authStore.onChange(async (token, record) => {
    setUser(record as pb_UserColItem);
    setPocketbaseCookie(pb.authStore.exportToCookie());
  }, true);
}
