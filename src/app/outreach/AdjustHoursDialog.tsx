"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { manualModifyOutreachHours } from "@/lib/db/hours";
import { BaseStates } from "@/lib/states";
import { formatMinutes } from "@/lib/utils";
import type { UserData } from "@/lib/types/pocketbase";
import { PBBrowser } from "@/lib/pb";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Edit2, Loader2, Minus, Plus } from "lucide-react";

type AdjustHoursDialogProps = {
  userData: UserData;
  onAdjusted?: () => void;
};

const QUICK_MINUTES = [15, 30, 60, 90];

export default function AdjustHoursDialog({
  userData,
  onAdjusted
}: AdjustHoursDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "subtract">("add");
  const [minutes, setMinutes] = useState(30);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const deltaMinutes = useMemo(
    () => (mode === "add" ? minutes : minutes * -1),
    [mode, minutes]
  );

  const projectedTotal = useMemo(() => {
    const next = (userData.outreachMinutes || 0) + deltaMinutes;
    return next < 0 ? 0 : next;
  }, [deltaMinutes, userData.outreachMinutes]);

  const isDisabled = minutes <= 0 || submitting;

  useEffect(() => {
    if (!open) {
      setMode("add");
      setMinutes(30);
      setReason("");
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (minutes <= 0 || submitting) return;

    const userId = userData.expand?.user?.id;
    if (!userId) {
      toast.error("Cannot adjust hours: missing user reference");
      return;
    }

    if (userData.outreachMinutes + deltaMinutes < 0) {
      toast.error("Adjustment would reduce this member below zero minutes.");
      return;
    }

    setSubmitting(true);
    const result = await manualModifyOutreachHours(
      userId,
      deltaMinutes,
      PBBrowser.getInstance(),
      reason.trim() || undefined
    );

    if (result === BaseStates.SUCCESS) {
      const adjustmentLabel = `${deltaMinutes > 0 ? "+" : ""}${formatMinutes(
        Math.abs(deltaMinutes)
      )}`;
      toast.success(
        `${
          userData.expand?.user?.name ?? "User"
        } adjusted by ${adjustmentLabel}. New total: ${formatMinutes(
          projectedTotal
        )}`
      );
      onAdjusted?.();
      setOpen(false);
    } else {
      toast.error("Failed to adjust outreach hours");
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Adjust Manual Hours</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Apply a scoped adjustment to this member&apos;s outreach minutes.
              Use this for manual corrections instead of editing totals
              directly.
            </p>
          </DialogHeader>

          <div className="grid gap-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Adjustment Type
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={mode === "add" ? "default" : "outline"}
                onClick={() => setMode("add")}
                className="flex-1">
                <Plus className="h-4 w-4 mr-1" /> Add Minutes
              </Button>
              <Button
                type="button"
                size="sm"
                variant={mode === "subtract" ? "default" : "outline"}
                onClick={() => setMode("subtract")}
                className="flex-1">
                <Minus className="h-4 w-4 mr-1" /> Subtract Minutes
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Minutes</label>
            <Input
              type="number"
              value={minutes || ""}
              onChange={(event) => {
                const value = parseInt(event.target.value, 10);
                setMinutes(Number.isNaN(value) ? 0 : Math.abs(value));
              }}
              min={0}
            />
            <div className="flex flex-wrap gap-2">
              {QUICK_MINUTES.map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMinutes(value)}>
                  {value} min
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="adjust-reason">
              Reason (optional)
            </label>
            <Textarea
              id="adjust-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Add a short note for audit history"
              rows={3}
            />
          </div>

          <div className="grid gap-1 rounded-md border px-3 py-2 text-sm bg-muted/40">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current total</span>
              <span>{formatMinutes(userData.outreachMinutes || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Adjustment</span>
              <span
                className={
                  deltaMinutes >= 0 ? "text-emerald-600" : "text-rose-600"
                }>
                {deltaMinutes >= 0 ? "+" : "-"}
                {formatMinutes(Math.abs(deltaMinutes))}
              </span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Projected total</span>
              <span>{formatMinutes(projectedTotal)}</span>
            </div>
          </div>

          <DialogFooter className="flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isDisabled}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving
                </>
              ) : (
                "Apply adjustment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
