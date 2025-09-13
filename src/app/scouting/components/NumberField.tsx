import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { BaseField } from "./BaseField";
import { NumberQuestionConfig } from "@/lib/types/scouting";

interface NumberFieldProps {
  question: NumberQuestionConfig;
}

export function NumberField({ question }: NumberFieldProps) {
  const {
    register,
    formState: { errors }
  } = useFormContext();
  const error = errors[question.name]?.message as string | undefined;

  return (
    <BaseField
      label={question.name}
      required={!question.optional}
      description={
        question.description ||
        `Enter a number between ${question.min} and ${question.max}${
          question.unit ? ` (${question.unit})` : ""
        }`
      }
      error={error}>
      <div className="relative">
        <Input
          type="number"
          min={question.min}
          max={question.max}
          step={1}
          className="pr-12"
          placeholder={`${question.min}-${question.max}`}
          {...register(question.name, {
            valueAsNumber: true
          })}
        />
        {question.unit && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            {question.unit}
          </div>
        )}
      </div>
    </BaseField>
  );
}
