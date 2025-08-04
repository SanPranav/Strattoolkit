import { ScoutingQuestionConfig } from "../types";
import { NumberField } from "./NumberField";
import { SelectField } from "./SelectField";
import { BooleanField } from "./BooleanField";
import { SliderField } from "./SliderField";

interface FormFieldProps {
  question: ScoutingQuestionConfig;
  register: any;
  setValue: any;
  errors: any;
}

export function FormField({
  question,
  register,
  setValue,
  errors
}: FormFieldProps) {
  switch (question.type) {
    case "select":
      return (
        <SelectField question={question} register={register} errors={errors} />
      );
    case "number":
      return (
        <NumberField question={question} register={register} errors={errors} />
      );
    case "boolean":
      return (
        <BooleanField
          question={question}
          register={register}
          setValue={setValue}
        />
      );
    case "slider":
      return (
        <SliderField
          question={question}
          register={register}
          setValue={setValue}
        />
      );
    default:
      return <div>Unknown question type</div>;
  }
}
