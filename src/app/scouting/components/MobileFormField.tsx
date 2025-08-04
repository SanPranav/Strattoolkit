import { ScoutingQuestionConfig } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { pb } from "@/lib/pbaseClient";
import { toast } from "sonner";
import { TeamOption } from "../types";

interface MobileFormFieldProps {
  question: ScoutingQuestionConfig;
  register: any;
  setValue: any;
  errors: any;
}

export function MobileFormField({
  question,
  register,
  setValue,
  errors
}: MobileFormFieldProps) {
  const [options, setOptions] = useState<TeamOption[]>([]);
  const [sliderValue, setSliderValue] = useState<number[]>([0]);

  // Fetch options for select fields
  useEffect(() => {
    if (question.type === "select") {
      const fetchOptions = async () => {
        try {
          const record = await pb
            .collection("Settings")
            .getFirstListItem(`key='${question.select_key}'`);
          if (record && record.value) {
            setOptions(record.value);
          }
        } catch (error) {
          console.error(`Failed to fetch options for ${question.name}:`, error);
          toast.error(`Failed to load options for ${question.name}`);
        }
      };
      fetchOptions();
    }
  }, [question]);

  // Initialize slider value
  useEffect(() => {
    if (question.type === "slider") {
      const initialValue = Math.floor(
        (question.slider_min + question.slider_max) / 2
      );
      setSliderValue([initialValue]);
      register(question.name);
      setValue(question.name, initialValue);
    }
  }, [question, register, setValue]);

  const renderField = () => {
    switch (question.type) {
      case "select":
        return (
          <div className="space-y-3">
            <select
              id={question.name}
              className="w-full bg-background border border-border text-foreground rounded-lg p-4 text-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              {...register(question.name, { required: !question.optional })}>
              <option value="">Select {question.name}</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors[question.name] && (
              <p className="text-sm text-destructive font-medium">
                This field is required
              </p>
            )}
          </div>
        );

      case "number":
        return (
          <div className="space-y-3">
            <Input
              id={question.name}
              type="number"
              min={question.number_min}
              max={question.number_max}
              className="text-lg p-4 h-14 focus:ring-2 focus:ring-primary"
              placeholder={`Enter ${question.name.toLowerCase()}`}
              {...register(question.name, {
                required: !question.optional,
                min: question.number_min,
                max: question.number_max,
                valueAsNumber: true
              })}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: {question.number_min}</span>
              <span>Max: {question.number_max}</span>
            </div>
            {errors[question.name] && (
              <p className="text-sm text-destructive font-medium">
                Please enter a number between {question.number_min} and{" "}
                {question.number_max}
              </p>
            )}
          </div>
        );

      case "boolean":
        return (
          <div className="flex items-center justify-between py-2">
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">
                Toggle to set value
              </div>
            </div>
            <Switch
              id={question.name}
              defaultChecked={question.boolean_default}
              className="scale-125"
              onCheckedChange={(checked) => setValue(question.name, checked)}
              {...register(question.name)}
            />
          </div>
        );

      case "slider":
        const handleSliderChange = (newValue: number[]) => {
          setSliderValue(newValue);
          setValue(question.name, newValue[0]);
        };

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Current value
              </span>
              <span className="text-2xl font-bold text-primary">
                {sliderValue[0]}
              </span>
            </div>
            <Slider
              id={question.name}
              min={question.slider_min}
              max={question.slider_max}
              step={1}
              value={sliderValue}
              onValueChange={handleSliderChange}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{question.slider_min}</span>
              <span>{question.slider_max}</span>
            </div>
          </div>
        );

      default:
        return <div>Unknown question type</div>;
    }
  };

  return (
    <Card className="border-l-4 border-l-primary/30 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Label
              htmlFor={question.name}
              className="text-base font-semibold text-foreground leading-tight">
              {question.name}
              {!question.optional && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            {question.optional && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                Optional
              </span>
            )}
          </div>
          {renderField()}
        </div>
      </CardContent>
    </Card>
  );
}
