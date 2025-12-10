import { UserData } from "./db";

export type DisabledPagesFlag = {
  [key in UserData["role"]]: string[];
};

export const FLAG_NAME_VALUES = [
  "advanced_reporting",
  "disabled_pages",
  "outreach_minutes_cutoff",
  "flag_ttl_ms"
] as const;

export type FlagNames = string;

export type FeatureFlag =
  | boolean
  | {
      enabled: boolean;
      percent?: number;
      roles?: string[];
      value?: string | number;
      list?: (string | number)[];
      paramEvalMethod?: "OR" | "AND";
      percentEvalMethod?: "ID" | "RANDOM";
    };

export type FlagParams = Partial<{
  userRole: string;
  userId: string;
}>;

export type EvalRet = {
  enabled: boolean;
  value?: Extract<FeatureFlag, object>["value"];
  list?: Extract<FeatureFlag, object>["list"];
  exists: boolean;
};
