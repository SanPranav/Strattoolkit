import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const ShortMonths = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12
};

export const FullMonths = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    dateStyle: "long"
  });
}
// Helper functions

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

/**
 * Returns CSS class names for badge styling based on a value compared to cutoff thresholds.
 *
 * @param value - The numeric value to evaluate against the cutoffs
 * @param meetingCutoff - The upper threshold value that indicates "meets requirements"
 * @param approachingCutoff - The offset from cutoff that defines the middle threshold range
 * @returns CSS class string with background and text color classes:
 *   - Green classes when value >= cutoff (meets requirements)
 *   - Amber classes when value >= (cutoff - middleCutoff) (approaching requirements)
 *   - Red destructive classes when value < (cutoff - middleCutoff) (below requirements)
 */
export function getBadgeStatusStyles(
  value: number,
  meetingCutoff: number,
  approachingCutoff: number
) {
  const VALUE_TO_MEET = meetingCutoff;
  const VALUE_TO_APPROACH = approachingCutoff;

  let className = "bg-destructive/20 text-destructive";

  if (value >= VALUE_TO_MEET) {
    className = "bg-green-500/20 text-green-500";
  } else if (value >= VALUE_TO_APPROACH) {
    className = "bg-amber-500/20 text-amber-500";
  }

  return className;
}

type SearchParams = Record<string, string>;
export function getSearchParamsString(params: SearchParams, basePath = "") {
  const searchParams = new URLSearchParams(params);
  return `${basePath}?${searchParams.toString()}`;
}

export function assertEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing ${name} environment variable. Got ${value}`);
  }

  return value;
}

export function safeParseSearchParams(
  url: string
): URLSearchParams | undefined {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.searchParams;
  } catch {
    if (url.startsWith("?")) {
      return new URLSearchParams(url);
    }
  }
}

export function sanitizeInternalPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return undefined;
  }

  return value;
}
