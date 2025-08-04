"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { pb } from "@/lib/pbaseClient";
import { ScoutingQuestionConfig, ScoutingSubmission } from "./types";
import { MobileScoutingForm } from "./components/MobileScoutingForm";
import { DesktopScoutingForm } from "./components/DesktopScoutingForm";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavbar } from "@/hooks/useNavbar";
import { Loader2 } from "lucide-react";

interface ScoutingFormProps {
  config: ScoutingQuestionConfig[];
  userId: string;
}

export default function ScoutingForm({ config, userId }: ScoutingFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm();
  const isHydrated = useIsHydrated();
  const isMobile = useIsMobile();

  const { setDefaultShown } = useNavbar();

  useEffect(() => {
    setDefaultShown(false);
  }, [setDefaultShown]);

  useEffect(() => {
    config.forEach((question) => {
      if (question.type === "boolean") {
        setValue(question.name, question.boolean_default);
      } else if (question.type === "slider") {
        setValue(
          question.name,
          Math.floor((question.slider_min + question.slider_max) / 2)
        );
      } else if (question.type === "number") {
        setValue(question.name, 0);
      }
    });
  }, [config, setValue]);

  const onSubmit = async (data: Record<string, any>) => {
    for (const question of config) {
      const isOptional = question.optional === true;
      if (!isOptional) {
        const value = data[question.name];
        if (value === undefined || value === null || value === "") {
          toast.error(`Please select ${question.name}`);
          return;
        }
      }
    }

    if (!data.teamNumber) {
      toast.error("Please enter a team number");
      return;
    }
    if (!data.matchNumber) {
      toast.error("Please enter a match number");
      return;
    }
    try {
      const submission: Partial<ScoutingSubmission> = {
        user: userId,
        teamNumber: data.teamNumber,
        matchNumber: data.matchNumber,
        data: {}
      };
      config.forEach((question) => {
        submission.data![question.name] = data[question.name];
      });
      await pb.collection("ScoutingData").create(submission);
      toast.success("Scouting data submitted successfully!");
      reset();
    } catch (error) {
      console.error("Failed to submit scouting data:", error);
      toast.error("Failed to submit scouting data");
    }
  };

  if (!isHydrated) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <Card className={`${isMobile ? "mx-4" : ""} bg-card/80`}>
          <CardHeader>
            <CardTitle
              className={`${
                isMobile ? "text-xl" : "text-2xl"
              } flex items-center gap-2`}>
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading Form...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`${
                isMobile ? "h-40" : "h-80"
              } flex items-center justify-center`}>
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">
                  Preparing scouting form...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? "px-4 pb-20" : ""} flex-1 overflow-hidden`}>
      {isMobile ? (
        <MobileScoutingForm
          config={config}
          onSubmit={onSubmit}
          register={register}
          setValue={setValue}
          errors={errors}
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmit}
        />
      ) : (
        <DesktopScoutingForm
          config={config}
          onSubmit={onSubmit}
          register={register}
          setValue={setValue}
          errors={errors}
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
