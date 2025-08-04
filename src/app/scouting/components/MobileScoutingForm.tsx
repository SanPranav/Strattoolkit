import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, FileText, Send, Loader2 } from "lucide-react";
import { MobileFormField } from "./MobileFormField";
import { ScoutingQuestionConfig } from "../types";

interface MobileScoutingFormProps {
  config: ScoutingQuestionConfig[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
  register: any;
  setValue: any;
  errors: any;
  isSubmitting: boolean;
  handleSubmit: any;
}

export function MobileScoutingForm({
  config,
  onSubmit,
  register,
  setValue,
  errors,
  isSubmitting,
  handleSubmit
}: MobileScoutingFormProps) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pb-4">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Match Scouting
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Fill out all required fields to submit scouting data
            </p>
          </CardHeader>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-4 w-4" />
              Match Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamNumber" className="text-base font-medium">
                Team Number <span className="text-destructive">*</span>
              </Label>
              <Input
                {...register("teamNumber", { required: true })}
                id="teamNumber"
                placeholder="e.g. 5199"
                className="text-lg p-4 h-14 focus:ring-2 focus:ring-primary"
              />
              {errors.teamNumber && (
                <p className="text-sm text-destructive font-medium">
                  Team number is required
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="matchNumber" className="text-base font-medium">
                Match Number <span className="text-destructive">*</span>
              </Label>
              <Input
                {...register("matchNumber", { required: true })}
                id="matchNumber"
                placeholder="e.g. Q1, SF2, F1"
                className="text-lg p-4 h-14 focus:ring-2 focus:ring-primary"
              />
              {errors.matchNumber && (
                <p className="text-sm text-destructive font-medium">
                  Match number is required
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Separator className="flex-1" />
            <Badge variant="secondary" className="px-3 py-1">
              {config.length} Questions
            </Badge>
            <Separator className="flex-1" />
          </div>

          {config.map((question, index) => (
            <MobileFormField
              key={index}
              question={question}
              register={register}
              setValue={setValue}
              errors={errors}
            />
          ))}
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg">
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
      </div>
    </ScrollArea>
  );
}
