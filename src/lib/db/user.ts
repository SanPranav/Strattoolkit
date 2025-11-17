import { Dispatch, SetStateAction } from "react";
import type { ListResult, OnStoreChangeFunc } from "pocketbase";

import type { User, UserData } from "@/lib/types/pocketbase";
import { clearPBAuthCookie } from "../pbServerUtils";
import { PBClientBase } from "../pb";
import { ErrorCodes } from "../states";
import { logger } from "../logger";

export async function newUser(
  email: string,
  password: string,
  name: string,
  client: PBClientBase
): Promise<[ErrorCodes, null] | [null, User]> {
  const [lookupError, existingUser] = await client.getFirstListItem<User>(
    "users",
    `email="${email.replace(/"/g, '\\"')}"`
  );
  if (existingUser) return ["01x03", null];
  if (lookupError && lookupError !== "01x404") return [lookupError, null];

  return createUser(email, password, name, client);
}

export async function createUser(
  email: string,
  password: string,
  name: string,
  client: PBClientBase
): Promise<[ErrorCodes, null] | [null, User]> {
  const result = await client.createOne<User>("users", {
    email,
    password,
    passwordConfirm: password,
    emailVisibility: true,
    name,
    role: "member"
  });

  const [, createdUser] = result;
  if (createdUser) {
    logger.info({ userId: createdUser.id, email }, "Created new user");
  }

  return result;
}

export function registerAuthCallback(
  cb: OnStoreChangeFunc,
  client: PBClientBase
) {
  client.authStore.onChange(cb, true);
}

export async function listUserData(
  page: number,
  perPage: number,
  client: PBClientBase
): Promise<[ErrorCodes, null] | [null, ListResult<UserData>]> {
  return client.getList<UserData>("UserData", page, perPage, {
    expand: "user"
  });
}

export async function listAllUsers(
  client: PBClientBase
): Promise<[ErrorCodes, null] | [null, User[]]> {
  return client.getFullList<User>("users", undefined, { sort: "name" });
}

export async function getUserData(
  userId: string,
  client: PBClientBase
): Promise<[ErrorCodes, null] | [null, UserData]> {
  const [error, data] = await client.getFirstListItem<UserData>(
    "UserData",
    `user='${userId}'`,
    { expand: "user", requestKey: null }
  );
  if (error) {
    return [error, null];
  }

  return [null, data];
}
