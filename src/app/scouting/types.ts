export type SelectQuestionConfig = {
  name: string;
  type: "select";
  select_key: string;
  optional?: boolean;
};

export type NumberQuestionConfig = {
  name: string;
  type: "number";
  number_min: number;
  number_max: number;
  optional?: boolean;
};

export type BooleanQuestionConfig = {
  name: string;
  type: "boolean";
  boolean_default: boolean;
  optional?: boolean;
};

export type SliderQuestionConfig = {
  name: string;
  type: "slider";
  slider_min: number;
  slider_max: number;
  optional?: boolean;
};

export type ScoutingQuestionConfig =
  | SelectQuestionConfig
  | NumberQuestionConfig
  | BooleanQuestionConfig
  | SliderQuestionConfig;

export interface ScoutingSubmission {
  user: string;
  teamNumber: string;
  matchNumber: string;
  data: Record<string, any>;
  created: string;
}

export interface TeamOption {
  value: string;
  label: string;
}
