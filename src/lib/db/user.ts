import { makeSBRequest } from "../supabase/supabase";
import type { UserData } from "../types/db";

type PaginatedResult<T> = {
  items: T[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
};

async function getUserDataRange(
  from: number,
  to: number
): Promise<{
  rows: UserData[];
  count: number | null;
}> {
  const { data, error, count } = await makeSBRequest(async (sb) =>
    sb.from("UserData").select("*", { count: "exact" }).range(from, to)
  );

  if (error || !data) {
    return {
      rows: [],
      count: null
    };
  }

  return {
    rows: data,
    count
  };
}

export async function fetchUserDataPaginated(
  page: number,
  perPage: number
): Promise<PaginatedResult<UserData> | null> {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { rows, count } = await getUserDataRange(from, to);

  if (count === null) {
    return null;
  }

  return {
    items: rows,
    page,
    perPage,
    totalItems: count,
    totalPages: Math.ceil(count / perPage)
  };
}

export async function fetchUserData(id: string): Promise<UserData | null> {
  const [error, data] = await getUserDataByUserId(id);
  if (error || !data) {
    return null;
  }
  return data;
}

export async function getUserDataByUserId(
  userId: string
): Promise<[string | null, UserData | null]> {
  const { data, error } = await makeSBRequest(async (sb) =>
    sb.from("UserData").select("*").eq("user", userId).limit(1).single()
  );

  if (error || !data) {
    return [error?.message ?? "Failed to load user data", null];
  }

  return [null, data];
}
