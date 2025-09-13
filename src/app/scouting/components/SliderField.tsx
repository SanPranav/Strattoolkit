import { useFormContext, Controller } from "react-hook-form";
import { Slider } from "@/components/ui/slider";
import { BaseField } from "./BaseField";
import { SliderQuestionConfig } from "@/lib/types/scouting";

interface SliderFieldProps {
  question: SliderQuestionConfig;
}

export function SliderField({ question }: SliderFieldProps) {
  const {
    control,
    formState: { errors }
  } = useFormContext();
  const error = errors[question.name]?.message as string | undefined;

  const getMarks = () => {
    const range = question.max - question.min;
    if (range <= 10) {
      return Array.from({ length: range + 1 }, (_, i) => question.min + i);
    }
    const step = Math.ceil(range / 5);
    const len = Math.ceil(range / step);

    const marks = [];
    for (let i = 0; i < len; i++) {
      marks.push(question.min + i * step);
    }

    return marks;
  };

  const marks = getMarks();
  const defaultValue =
    question.default ?? Math.floor((question.min + question.max) / 2);

  return (
    <BaseField
      label={question.name}
      required={!question.optional}
      description={question.description}
      error={error}>
      <Controller
        name={question.name}
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => (
          <div className="px-2 py-4">
            <div className="flex items-center justify-around mb-4">
              <div className="font-semibold text-lg text-primary min-w-[2rem] text-center">
                {field.value ?? defaultValue}
              </div>
            </div>

            <Slider
              min={question.min}
              max={question.max}
              step={question.step || 1}
              value={[field.value ?? defaultValue]}
              onValueChange={(value) => field.onChange(value[0])}
              className="w-full"
            />

            {marks.length <= 5 && (
              <div className="flex justify-between text-xs text-muted-foreground mt-3 px-1">
                {marks.map((mark, index) => (
                  <span key={mark} className="opacity-60">
                    {mark}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      />
    </BaseField>
  );
}
