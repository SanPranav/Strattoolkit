import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatMinutes } from "@/lib/utils";
import { manualModifyOutreachHours } from "@/lib/db/hours";

import { BaseStates } from "@/lib/types/states";

import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";
import { Edit2, Minus, Plus } from "lucide-react";
import { ActivitySummary } from "@/lib/types/db";
import { OUTREACH } from "@/lib/types/queryKeys";

type EditUserDialogProps = {
  userData: ActivitySummary;
};

export default function AdjustHoursDialog({ userData }: EditUserDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"add" | "subtract">("add");
  const [adjustment, setAdjustment] = useState(0);

  useEffect(() => {
    if (open) {
      setMode("add");
      setAdjustment(0);
    }
  }, [open]);

  const signedAdjustment = useMemo(() => {
    const magnitude = Math.abs(adjustment);
    return mode === "add" ? magnitude : -magnitude;
  }, [adjustment, mode]);

  const projectedTotal =
    (userData.user_credited_minutes || 0) + signedAdjustment;
  const isSubmitDisabled = loading || adjustment <= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;
    setLoading(true);

    if (projectedTotal < 0) {
      toast.error("Resulting total cannot be negative.");
      setLoading(false);
      return;
    }

    if (!userData.user_id) return;

    const state = await manualModifyOutreachHours(
      userData.user_id,
      projectedTotal
    );

    switch (state) {
      case BaseStates.SUCCESS:
        toast.success(
          `${userData.user_name} now has ${formatMinutes(
            Math.max(0, projectedTotal)
          )}`
        );
        setOpen(false);
        void queryClient.invalidateQueries({
          queryKey: OUTREACH.LEADERBOARD
        });
        break;

      case BaseStates.ERROR:
      default:
        toast.error(`Failed to update ${userData.user_name}'s hours`);
        break;
    }

    setLoading(false);
  };

  const quickAdjustments = [15, 30, 60, 90];

  const handleQuickSelect = (
    minutes: number,
    direction: "add" | "subtract"
  ) => {
    setMode(direction);
    setAdjustment(minutes);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User Data</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Logged Time</p>
            <p className="text-xl font-semibold">
              {formatMinutes(userData.user_credited_minutes || 0)}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant={mode === "add" ? "default" : "outline"}
                onClick={() => setMode("add")}
                aria-label="Add minutes">
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant={mode === "subtract" ? "default" : "outline"}
                onClick={() => setMode("subtract")}
                aria-label="Subtract minutes">
                <Minus className="h-4 w-4" />
              </Button>
              <Label className="text-sm text-muted-foreground">
                {mode === "add" ? "Adding minutes" : "Removing minutes"}
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minutes-delta">Minutes</Label>
              <Input
                id="minutes-delta"
                type="number"
                value={adjustment}
                min={0}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (Number.isFinite(value) && value >= 0) {
                    setAdjustment(value);
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                Resulting total: {formatMinutes(Math.max(0, projectedTotal))}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {quickAdjustments.map((minutes) => (
                <Button
                  key={`add-${minutes}`}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleQuickSelect(minutes, "add")}>
                  +{formatMinutes(minutes)}
                </Button>
              ))}
              {quickAdjustments.map((minutes) => (
                <Button
                  key={`subtract-${minutes}`}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickSelect(minutes, "subtract")}>
                  -{formatMinutes(minutes)}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitDisabled}>
              {loading ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
