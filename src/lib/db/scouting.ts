import { Dexie, type EntityTable } from "dexie";

import { pb } from "@/lib/pbaseClient";

import {
  DexieScoutingSubmission,
  ScoutingSubmission,
  SelectOption
} from "../types/scouting";

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

export async function fetchTeamOptions() {
  try {
    const record = await pb
      .collection("ScoutingSettings")
      .getFirstListItem(`key='sk_EventTeams'`)
      .catch();

    if (record && record.value) {
      return record.value as SelectOption[];
    }

    return [];
  } catch (error) {
    console.error(`Failed to fetch options for 'sk_EventTeams':`, error);
    return [];
  }
}

export async function fetchSelectOptions(key: string) {
  try {
    const record = await pb
      .collection("ScoutingSettings")
      .getFirstListItem(`key='${key}'`)
      .catch();

    if (record && record.value) {
      return record.value as SelectOption[];
    }

    return [];
  } catch (error) {
    console.error(`Failed to fetch options for '${key}':`, error);
    return [];
  }
}

export async function getAllResponses() {
  try {
    return await dexie.responses.toArray();
  } catch (error) {
    console.error("Failed to fetch responses from IndexedDB:", error);
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

    console.log("Formatted responses for upload:", formattedResponses);

    // TODO: Implement actual upload logic
    // This is where you'll add the upload functionality
    return formattedResponses;
  } catch (error) {
    console.error("Failed to get responses for upload:", error);
    throw error;
  }
}

export async function markResponseAsUploaded(id: number) {
  try {
    await dexie.responses.update(id, { uploaded: true });
  } catch (error) {
    console.error(`Failed to mark response ${id} as uploaded:`, error);
    throw error;
  }
}
