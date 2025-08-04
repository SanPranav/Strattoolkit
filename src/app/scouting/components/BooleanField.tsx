import { BooleanQuestionConfig } from "../types";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";

interface BooleanFieldProps {
  question: BooleanQuestionConfig;
  register: any;
  setValue: any;
}

export function BooleanField({
  question,
  register,
  setValue
}: BooleanFieldProps) {
  useEffect(() => {
    setValue(question.name, question.boolean_default);
  }, [question, setValue]);

  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={question.name}>
        {question.name}
        {!question.optional && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Switch
        id={question.name}
        defaultChecked={question.boolean_default}
        onCheckedChange={(checked) => setValue(question.name, checked)}
        {...register(question.name)}
      />
    </div>
  );
}
