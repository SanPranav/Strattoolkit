import { toast } from "sonner";
import { deleteOutreachEvents } from "@/lib/db/outreach";
import { formatDateTimeLA } from "@/lib/datetime";

import { Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Loader from "@/components/Loader";
import LogHoursDialog from "./LogHoursDialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import { logger } from "@/lib/logger";
import type { ActivityEvent, OutreachEvent } from "@/lib/types/db";

interface EventsListProps {
  events: ActivityEvent[] | undefined;
  selectedEvent: ActivityEvent | null;
  onEventSelect: (event: ActivityEvent) => void;
  onEventDeleted: () => void;
  onHoursLogged: () => void;
  variant?: "page" | "sheet";
  searchValue?: string;
  onSearchValueChange?: (value: string) => void;
}

export default function EventsList({
  events,
  selectedEvent,
  onEventSelect,
  onEventDeleted,
  onHoursLogged,
  variant = "page",
  searchValue,
  onSearchValueChange
}: EventsListProps) {
  const isSheet = variant === "sheet";

  const handleDeleteEvent = async (eventId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this event? This will also delete all associated sessions."
      )
    ) {
      return;
    }

    try {
      const [error] = await deleteOutreachEvents(eventId);

      if (error) {
        throw new Error(error ?? "Failed to delete event");
      }

      logger.warn({ eventId }, "Event deleted via list");
      toast.success("Event deleted successfully");
      onEventDeleted();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({ eventId, err: message }, "Failed to delete event");
      toast.error("Failed to delete event");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Events
          </CardTitle>

          <Input
            value={searchValue ?? ""}
            onChange={(e) => onSearchValueChange?.(e.target.value)}
            placeholder="Search events..."
            className="max-w-[260px]"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className={isSheet ? "max-h-[60vh] pr-3" : "h-full"}>
          {!events ? (
            <div className="flex items-center justify-center py-8">
              <Loader />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No events created yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedEvent?.id === event.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => onEventSelect(event)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{event.event_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {event.event_date
                          ? formatDateTimeLA(event.event_date)
                          : "N/A"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <LogHoursDialog
                        event={event}
                        onHoursLogged={onHoursLogged}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(event.id);
                        }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
