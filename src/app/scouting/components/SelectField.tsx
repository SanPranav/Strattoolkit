import { SelectQuestionConfig, TeamOption } from "../types";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { pb } from "@/lib/pbaseClient";
import { toast } from "sonner";

interface SelectFieldProps {
  question: SelectQuestionConfig;
  register: any;
  errors: any;
}

export function SelectField({ question, register, errors }: SelectFieldProps) {
  const [options, setOptions] = useState<TeamOption[]>([]);
  const isRequired = !question.optional;

  useEffect(() => {
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
  }, [question]);

  return (
    <div className="grid gap-2">
      <Label htmlFor={question.name}>
        {question.name}
        {!question.optional && <span className="text-destructive ml-1">*</span>}
      </Label>
      <select
        id={question.name}
        className="bg-input border-border text-foreground rounded-md p-2"
        {...register(question.name, { required: isRequired })}>
        <option value="">Select {question.name}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errors[question.name] && (
        <p className="text-sm text-destructive">This field is required</p>
      )}
    </div>
  );
}
