import { useFormContext, Controller } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { BaseField } from "./BaseField";
import { BooleanQuestionConfig } from "@/lib/types/scouting";

interface BooleanFieldProps {
  question: BooleanQuestionConfig;
}

export function BooleanField({ question }: BooleanFieldProps) {
  const {
    control,
    formState: { errors }
  } = useFormContext();
  const error = errors[question.name]?.message as string | undefined;

  return (
    <BaseField
      label={question.name}
      required={!question.optional}
      description={question.description}
      error={error}>
      <Controller
        name={question.name}
        control={control}
        defaultValue={question.default}
        render={({ field }) => (
          <div className="flex items-center justify-between">
            <Switch
              checked={field.value ?? question.default}
              onCheckedChange={field.onChange}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        )}
      />
    </BaseField>
  );
}
