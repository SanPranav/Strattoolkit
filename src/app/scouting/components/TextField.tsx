import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { BaseField } from "./BaseField";
import { TextQuestionConfig } from "@/lib/types/scouting";

interface TextFieldProps {
  question: TextQuestionConfig;
}

export function TextField({ question }: TextFieldProps) {
  const {
    register,
    formState: { errors }
  } = useFormContext();
  const error = errors[question.name]?.message as string | undefined;

  return (
    <BaseField
      label={question.name}
      required={!question.optional}
      description={question.description}
      error={error}>
      <div className="relative">
        <Input
          type="text"
          placeholder={
            question.placeholder || `Enter ${question.name.toLowerCase()}`
          }
          maxLength={question.maxLength}
          className="w-full"
          {...register(question.name, {
            required: !question.optional
              ? `${question.name} is required`
              : false,
            maxLength: question.maxLength
              ? {
                  value: question.maxLength,
                  message: `${question.name} must be less than ${question.maxLength} characters`
                }
              : undefined
          })}
        />
        {question.maxLength && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
            {question.maxLength}
          </div>
        )}
      </div>
    </BaseField>
  );
}
