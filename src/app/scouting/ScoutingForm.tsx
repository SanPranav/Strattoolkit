"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { handleFormSubmission } from "@/lib/db/scouting";
import { useNavbar } from "@/hooks/useNavbar";

import { ScoutingQuestionConfig } from "@/lib/types/scouting";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, Loader2, RotateCcw, AlertCircle } from "lucide-react";

import { BooleanField } from "./components/BooleanField";
import { NumberField } from "./components/NumberField";
import { SliderField } from "./components/SliderField";
import { TextField } from "./components/TextField";
import { TextareaField } from "./components/TextareaField";
import { SelectField } from "./components/SelectField";
import { createResolver } from "./schema";
import { TeamField } from "./components/TeamField";

interface ScoutingFormProps {
  config: ScoutingQuestionConfig[];
  userId: string;
}

export default function ScoutingForm({ config, userId }: ScoutingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setDefaultShown, setMobileNavbarSide } = useNavbar();

  const resolver = createResolver(config);

  const methods = useForm({
    resolver,
    mode: "onTouched"
  });

  const {
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = methods;

  useEffect(() => {
    setDefaultShown(false);
    setMobileNavbarSide("right");

    console.log(userId);
  }, [setDefaultShown, setMobileNavbarSide]);

  const onSubmit = async function (data: any) {
    setIsSubmitting(true);

    toast.loading("Submitting scouting data...", { id: "sSubmit" });

    const submission = {
      user: userId,
      team: data.team,
      data,
      date: new Date()
    };

    console.log(submission);

    const result = await handleFormSubmission(submission);

    if (!result.error) {
      toast.success("Scouting data submitted successfully!", { id: "sSubmit" });
      reset();
    } else {
      toast.error(result.error || "Failed to submit data", { id: "sSubmit" });
    }

    setIsSubmitting(false);
  };

  const renderField = function (question: ScoutingQuestionConfig) {
    switch (question.type) {
      case "team":
        return <TeamField key={question.name} question={question} />;
      case "boolean":
        return <BooleanField key={question.name} question={question} />;
      case "number":
        return <NumberField key={question.name} question={question} />;
      case "slider":
        return <SliderField key={question.name} question={question} />;
      case "select":
        return <SelectField key={question.name} question={question} />;
      case "text":
        return <TextField key={question.name} question={question} />;
      case "textarea":
        return <TextareaField key={question.name} question={question} />;
      default:
        return null;
    }
  };

  const errorCount = Object.keys(errors).length;

  return (
    <FormProvider {...methods}>
      <div className="w-full space-y-6">
        {/* Progress Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="mb-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Scouting Form
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Fill out the form below to submit scouting data
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  {config.length} Questions
                </Badge>
                {errorCount > 0 && (
                  <Badge variant="destructive" className="text-sm">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errorCount} Error{errorCount !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Form Fields */}
        <Card className="pt-0">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 sm:gap-8">
                {config.map((question, index) => (
                  <div key={question.name}>
                    {renderField(question)}
                    {index < config.length - 1 && (
                      <Separator className="mt-6" />
                    )}
                  </div>
                ))}
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between sticky bottom-0 z-10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {errorCount > 0 ? (
                <>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span>
                    Please fix {errorCount} error{errorCount !== 1 ? "s" : ""}{" "}
                    above
                  </span>
                </>
              ) : isValid ? (
                <span className="text-green-600">Form is ready to submit</span>
              ) : (
                <span>Complete required fields to submit</span>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting || errorCount > 0}
                className="flex-1 sm:flex-none min-w-[120px]">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </FormProvider>
  );
}
