import { ScoutingQuestionConfig } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "./FormField";
import { Badge } from "@/components/ui/badge";

interface DesktopFormFieldProps {
  question: ScoutingQuestionConfig;
  register: any;
  setValue: any;
  errors: any;
  index: number;
}

export function DesktopFormField({
  question,
  register,
  setValue,
  errors,
  index
}: DesktopFormFieldProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "select":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "number":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "boolean":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "slider":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <span className="text-muted-foreground text-sm font-mono">
              #{(index + 1).toString().padStart(2, "0")}
            </span>
            {question.name}
            {!question.optional && (
              <span className="text-destructive ml-1">*</span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {question.optional && (
              <Badge variant="secondary" className="text-xs">
                Optional
              </Badge>
            )}
            <Badge className={`text-xs ${getTypeColor(question.type)}`}>
              {question.type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <FormField
          question={question}
          register={register}
          setValue={setValue}
          errors={errors}
        />
      </CardContent>
    </Card>
  );
}
