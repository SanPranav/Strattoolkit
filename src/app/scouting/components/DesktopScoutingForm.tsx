import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, FileText, Send, Loader2 } from "lucide-react";
import { DesktopFormField } from "./DesktopFormField";
import { ScoutingQuestionConfig } from "../types";

interface DesktopScoutingFormProps {
  config: ScoutingQuestionConfig[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
  register: any;
  setValue: any;
  errors: any;
  isSubmitting: boolean;
  handleSubmit: any;
}

export function DesktopScoutingForm({
  config,
  onSubmit,
  register,
  setValue,
  errors,
  isSubmitting,
  handleSubmit
}: DesktopScoutingFormProps) {
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border-blue-400">
      <Card className="h-full flex flex-col overflow-scroll border-red-400">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-3">
                <FileText className="h-6 w-6" />
                Match Scouting Form
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Submit detailed match data for team analysis
              </p>
            </div>
            <Badge variant="outline" className="px-3 py-2">
              {config.length} Questions
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Match Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="teamNumber"
                      className="text-base font-medium">
                      Team Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      {...register("teamNumber", { required: true })}
                      id="teamNumber"
                      placeholder="e.g. 5199"
                      className="h-12 text-base focus:ring-2 focus:ring-primary"
                    />
                    {errors.teamNumber && (
                      <p className="text-sm text-destructive font-medium">
                        Team number is required
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="matchNumber"
                      className="text-base font-medium">
                      Match Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      {...register("matchNumber", { required: true })}
                      id="matchNumber"
                      placeholder="e.g. Q1, SF2, F1"
                      className="h-12 text-base focus:ring-2 focus:ring-primary"
                    />
                    {errors.matchNumber && (
                      <p className="text-sm text-destructive font-medium">
                        Match number is required
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <br />
            <Separator />
            <br />

            <div className="grid gap-6">
              {config.map((question, index) => (
                <DesktopFormField
                  key={index}
                  question={question}
                  register={register}
                  setValue={setValue}
                  errors={errors}
                  index={index}
                />
              ))}
            </div>

            <div className="flex justify-end pt-6 border-t">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Submit Scouting Data
                  </>
                )}
              </Button>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </form>
  );
}
