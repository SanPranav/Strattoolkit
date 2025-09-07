import { Dexie, type EntityTable } from "dexie";

import { pb } from "@/lib/pbaseClient";

import {
  DexieScoutingSubmission,
  ScoutingSubmission,
  SelectOption
} from "../types/scoutingTypes";

export const dexie = new Dexie("ScoutingFormResponses") as Dexie & {
  responses: EntityTable<DexieScoutingSubmission>;
};
dexie.version(1).stores({
  responses: "++id, user, data, date"
});

/**
 * Handles form submission - placeholder implementation
 * TODO: Implement actual submission logic
 */
export async function handleFormSubmission(submission: ScoutingSubmission) {
  const stringSubmission = {
    ...submission,
    data: JSON.stringify(submission.data)
  };

  await dexie.responses.add(stringSubmission);

  setTimeout(() => {
    const r = dexie.responses.where("date").equals(submission.date).toArray();
    console.log(r);
  }, 3000);

  return {
    error: false,
    data: null
  };
}

/**
 * Fetches team options for select fields
 */
export async function fetchSelectOptions(key: string): Promise<SelectOption[]> {
  return [];

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
