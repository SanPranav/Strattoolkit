import { useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { BaseField } from "./BaseField";
import { SelectQuestionConfig, SelectOption } from "@/lib/types/scoutingTypes";
import { fetchSelectOptions } from "@/lib/db/scouting";

interface SelectFieldProps {
  question: SelectQuestionConfig;
}

export function SelectField({ question }: SelectFieldProps) {
  const {
    control,
    formState: { errors }
  } = useFormContext();
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const error = errors[question.name]?.message as string | undefined;

  useEffect(() => {
    const loadOptions = async () => {
      setIsLoading(true);
      try {
        const teamOptions = await fetchSelectOptions(question.select_key);
        setOptions(teamOptions);
      } catch (error) {
        console.error("Failed to load select options:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOptions();
  }, []);

  return (
    <BaseField
      label={question.name}
      required={!question.optional}
      description={question.description}
      error={error}>
      <Controller
        name={question.name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value || ""}
            onValueChange={field.onChange}
            disabled={isLoading}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  isLoading ? "Loading options..." : `Select ${question.name}`
                }
              />
            </SelectTrigger>
            <SelectContent>
              {options.length > 0 &&
                options.map(
                  (option) =>
                    option.value && (
                      <SelectItem
                        key={option.value}
                        value={JSON.stringify(option)}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{option.value}</span>
                          <span className="text-muted-foreground">
                            {option.name.length > 30
                              ? `${option.name.slice(0, 30)}...`
                              : option.name}
                          </span>
                        </div>
                      </SelectItem>
                    )
                )}
              {options.length === 0 && (
                <SelectItem value="noop" disabled>
                  No options available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        )}
      />
    </BaseField>
  );
}
