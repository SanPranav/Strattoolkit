import { SliderQuestionConfig } from "../types";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";

interface SliderFieldProps {
  question: SliderQuestionConfig;
  register: any;
  setValue: any;
}

export function SliderField({
  question,
  register,
  setValue
}: SliderFieldProps) {
  const [value, setValueInternal] = useState<number[]>([
    Math.floor((question.slider_min + question.slider_max) / 2)
  ]);

  useEffect(() => {
    register(question.name);
    setValue(question.name, value[0]);
  }, [register, setValue, question.name, value]);

  const handleValueChange = (newValue: number[]) => {
    setValueInternal(newValue);
    setValue(question.name, newValue[0]);
  };

  const getMarks = () => {
    const range = question.slider_max - question.slider_min;
    if (range <= 10) {
      return Array.from(
        { length: range + 1 },
        (_, i) => question.slider_min + i
      );
    }
    const step = Math.ceil(range / 5);
    return Array.from(
      { length: Math.ceil(range / step) + 1 },
      (_, i) => question.slider_min + i * step
    );
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <Label htmlFor={question.name}>
          {question.name}
          {!question.optional && (
            <span className="text-destructive ml-1">*</span>
          )}
        </Label>
        <span className="text-sm font-medium">{value[0]}</span>
      </div>
      <Slider
        id={question.name}
        min={question.slider_min}
        max={question.slider_max}
        step={1}
        value={value}
        onValueChange={handleValueChange}
        className="pt-4"
      />
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        {getMarks().map((mark) => (
          <span key={mark} className="px-1">
            {mark}
          </span>
        ))}
      </div>
    </div>
  );
}
