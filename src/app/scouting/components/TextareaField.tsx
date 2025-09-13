import { useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { BaseField } from "./BaseField";
import { TextareaQuestionConfig } from "@/lib/types/scouting";

interface TextareaFieldProps {
  question: TextareaQuestionConfig;
}

export function TextareaField({ question }: TextareaFieldProps) {
  const {
    register,
    formState: { errors },
    watch
  } = useFormContext();
  const error = errors[question.name]?.message as string | undefined;
  const currentValue = watch(question.name) || "";

  return (
    <BaseField
      label={question.name}
      required={!question.optional}
      description={question.description}
      error={error}>
      <div className="relative">
        <Textarea
          placeholder={
            question.placeholder || `Enter ${question.name.toLowerCase()}`
          }
          maxLength={question.maxLength}
          rows={question.rows || 4}
          className="w-full resize-y min-h-[100px]"
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
          <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 px-1 rounded">
            {currentValue.length}/{question.maxLength}
          </div>
        )}
      </div>
    </BaseField>
  );
}
