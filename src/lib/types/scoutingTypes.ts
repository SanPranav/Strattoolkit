interface BaseQuestionConfig {
  name: string;
  type: string;
  description?: string;
  optional?: boolean;
}

export interface SelectQuestionConfig extends BaseQuestionConfig {
  type: "select";
  select_key: string;
  default?: string;
}

export interface NumberQuestionConfig extends BaseQuestionConfig {
  type: "number";
  min: number;
  max: number;
  unit?: string;
  default?: number;
}

export interface BooleanQuestionConfig extends BaseQuestionConfig {
  type: "boolean";
  default?: boolean;
}

export interface SliderQuestionConfig extends BaseQuestionConfig {
  type: "slider";
  min: number;
  max: number;
  step?: number;
  default?: number;
}

export interface TextQuestionConfig extends BaseQuestionConfig {
  type: "text";
  placeholder?: string;
  maxLength?: number;
  default?: string;
}

export interface TextareaQuestionConfig extends BaseQuestionConfig {
  type: "textarea";
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  default?: string;
}

export interface UnknownQuestionConfig extends BaseQuestionConfig {
  type: Exclude<
    string,
    "select" | "number" | "boolean" | "slider" | "text" | "textarea"
  >;
  [key: string]: any; // Allow additional properties for unknown types
}

export type ScoutingQuestionConfig =
  | SelectQuestionConfig
  | NumberQuestionConfig
  | BooleanQuestionConfig
  | SliderQuestionConfig
  | TextQuestionConfig
  | TextareaQuestionConfig;

export interface ScoutingSubmission {
  user: string;
  data: Record<string, string | number | boolean>;
  date: Date;
}

export interface DexieScoutingSubmission {
  user: string;
  data: string;
  date: Date;
}

export interface SelectOption {
  value: number;
  name: string;
}

export interface FormFieldProps {
  question: ScoutingQuestionConfig;
  index: number;
  isLoading?: boolean;
}
