import { NumberQuestionConfig } from "../types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface NumberFieldProps {
  question: NumberQuestionConfig;
  register: any;
  errors: any;
}

export function NumberField({ question, register, errors }: NumberFieldProps) {
  const isRequired = !question.optional;

  return (
    <div className="grid gap-2">
      <Label htmlFor={question.name}>
        {question.name}
        {!question.optional && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={question.name}
        type="number"
        min={question.number_min}
        max={question.number_max}
        className="bg-input border-border text-foreground"
        {...register(question.name, {
          required: isRequired,
          min: question.number_min,
          max: question.number_max,
          valueAsNumber: true
        })}
      />
      {errors[question.name] && (
        <p className="text-sm text-destructive">
          Please enter a number between {question.number_min} and{" "}
          {question.number_max}
        </p>
      )}
    </div>
  );
}
