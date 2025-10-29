import { Dexie, type EntityTable } from "dexie";
import type { RecordModel } from "pocketbase";

import { type PBClientBase } from "@/lib/pb";

import {
  DexieScoutingSubmission,
  ScoutingQuestionConfig,
  ScoutingSubmission,
  SelectOption
} from "../types/scouting";
import { ErrorCodes } from "../states";
import { logger } from "../logger";

export const dexie = new Dexie("ScoutingFormResponses") as Dexie & {
  responses: EntityTable<DexieScoutingSubmission, "id">;
};
dexie.version(3).stores({
  responses: "++id, user, team, data, date, uploaded"
});

/**
 * Handles form submission - placeholder implementation
 * TODO: Implement actual submission logic
 */
export async function handleFormSubmission(submission: ScoutingSubmission) {
  try {
    const stringSubmission = {
      ...submission,
      team: JSON.stringify(submission.team),
      data: JSON.stringify(submission.data),
      uploaded: false
    } satisfies Omit<DexieScoutingSubmission, "id">;

    await dexie.responses.add(stringSubmission as any);

    return {
      error: false
    };
  } catch {
    return {
      error: true
    };
  }
}

export async function getScoutingConfig(
  client: PBClientBase
): Promise<[ErrorCodes, null] | [null, ScoutingQuestionConfig[]]> {
  const [error, record] = await client.getFirstListItem<
    RecordModel & { value?: ScoutingQuestionConfig[] }
  >("ScoutingSettings", "key='ScoutingConfig'");

  if (error) {
    logger.error(
      { key: "ScoutingConfig", code: error },
      "Failed to fetch scouting config"
    );
    return [error, null];
  }

  return [null, record.value || []];
}

export async function fetchTeamOptions(
  client: PBClientBase
): Promise<[ErrorCodes, null] | [null, SelectOption[]]> {
  const [error, record] = await client.getFirstListItem<
    RecordModel & { value?: SelectOption[] }
  >("ScoutingSettings", "key='sk_EventTeams'");

  if (error) {
    if (error === "01x404") {
      return [null, []];
    }

    logger.error(
      { key: "sk_EventTeams", code: error },
      "Failed to fetch select options"
    );
    return [error, null];
  }

  return [null, (record?.value as SelectOption[]) ?? []];
}

export async function fetchSelectOptions(
  key: string,
  client: PBClientBase
): Promise<[ErrorCodes, null] | [null, SelectOption[]]> {
  const [error, record] = await client.getFirstListItem<
    RecordModel & { value?: SelectOption[] }
  >("ScoutingSettings", `key='${key}'`);

  if (error) {
    if (error === "01x404") {
      return [null, []];
    }

    logger.error({ key, code: error }, "Failed to fetch select options");
    return [error, null];
  }

  return [null, (record?.value as SelectOption[]) ?? []];
}

export async function getAllResponses() {
  try {
    return await dexie.responses.toArray();
  } catch (error: any) {
    logger.error(
      { err: error?.message },
      "Failed to fetch responses from IndexedDB"
    );
    return [];
  }
}

export async function uploadResponses() {
  try {
    const responses = await dexie.responses
      .where("uploaded")
      .equals("false")
      .toArray();

    const formattedResponses = responses.map((response) => ({
      id: response.id!,
      user: response.user,
      team: response.team,
      data: response.data, // Already stringified JSON
      date: response.date
    }));

    logger.info(
      { count: formattedResponses.length },
      "Prepared responses for upload"
    );

    // TODO: Implement actual upload logic
    // This is where you'll add the upload functionality
    return formattedResponses;
  } catch (error: any) {
    logger.error({ err: error?.message }, "Failed to get responses for upload");
    throw error;
  }
}

export async function markResponseAsUploaded(id: number) {
  try {
    await dexie.responses.update(id, { uploaded: true });
    logger.info({ id }, "Marked response as uploaded");
  } catch (error: any) {
    logger.error(
      { id, err: error?.message },
      "Failed to mark response uploaded"
    );
    throw error;
  }
}
