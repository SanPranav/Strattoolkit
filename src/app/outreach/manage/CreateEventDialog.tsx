// React
import { useState } from "react";
// UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/DateTimePicker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
// Data
import { createOutreachEvent } from "@/lib/db/outreach";
// Feedback
import { toast } from "sonner";
// Icons
import { Plus } from "lucide-react";
import { logger } from "@/lib/logger";
import { toISOFromPickerDate } from "@/lib/datetime";

interface CreateEventDialogProps {
  onEventCreated: () => void;
}

export default function CreateEventDialog({
  onEventCreated
}: CreateEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dateISO: "",
    minutesCap: ""
  });

  const [pickerDate, setPickerDate] = useState<Date | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dateISO) {
      toast.error("Please fill in all fields");
      return;
    }

    const parsedCap = formData.minutesCap.trim();
    if (parsedCap) {
      const capNumber = Number(parsedCap);
      if (!Number.isFinite(capNumber) || capNumber < 0) {
        toast.error("Minutes cap must be a non-negative number");
        return;
      }
    }

    setLoading(true);
    try {
      const minutes_cap = Number(formData.minutesCap.trim()) || null;

      const [error, created] = await createOutreachEvent({
        event_name: formData.name,
        event_date: formData.dateISO,
        minutes_cap
      });

      if (error || !created) {
        throw new Error(error ?? "Failed to create event");
      }

      logger.info({ eventId: created.id }, "Event created via dialog");
      toast.success("Event created successfully");
      setFormData({ name: "", dateISO: "", minutesCap: "" });
      setPickerDate(undefined);
      setOpen(false);
      onEventCreated();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({ err: message }, "Error creating event");
      toast.error("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter event name"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Event Date</Label>
            <div className={loading ? "pointer-events-none opacity-60" : ""}>
              <DateTimePicker
                value={pickerDate}
                onChange={(next) => {
                  setPickerDate(next);
                  setFormData({
                    ...formData,
                    dateISO: next ? toISOFromPickerDate(next) : ""
                  });
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="minutes-cap">Minutes Cap (optional)</Label>
            <Input
              id="minutes-cap"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="e.g. 120"
              value={formData.minutesCap}
              onChange={(e) =>
                setFormData({ ...formData, minutesCap: e.target.value })
              }
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank for no cap. Minutes will be credited up to this value
              per session.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
