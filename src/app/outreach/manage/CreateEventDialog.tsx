// React
import { useState } from "react";
// UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
// Data
import { createEvent } from "@/lib/db/outreach";
// Feedback
import { toast } from "sonner";
// Icons
import { Plus } from "lucide-react";
import { logger } from "@/lib/logger";
import { ErrorToString } from "@/lib/states";
import { PBBrowser } from "@/lib/pb";

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
    date: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const [error, created] = await createEvent(
        {
          name: formData.name,
          date: formData.date
        },
        PBBrowser.getInstance()
      );

      if (error || !created) {
        const message = error ? ErrorToString[error] ?? error : "Unknown error";
        logger.error({ err: message }, "Error creating event");
        toast.error(`Failed to create event: ${message}`);
        return;
      }

      logger.info({ eventId: created.id }, "Event created via dialog");
      toast.success("Event created successfully");
      setFormData({ name: "", date: "" });
      setOpen(false);
      onEventCreated();
    } catch (error: any) {
      logger.error({ err: error?.message }, "Error creating event");
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
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              disabled={loading}
            />
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
