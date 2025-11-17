"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { fetchEvents } from "@/lib/db/outreach";
import { PBBrowser } from "@/lib/pb";
import type { OutreachEvent } from "@/lib/types/pocketbase";
import { formatPbDate } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import CreateEventDialog from "./manage/CreateEventDialog";
import LogHoursDialog from "./manage/LogHoursDialog";

import { CalendarCheck, Clock3, RefreshCcw, ArrowUpRight } from "lucide-react";

type OutreachQuickManageCardProps = {
  events: OutreachEvent[];
  canManage: boolean;
  onRosterReloadAction: () => void | Promise<void>;
};

const MAX_VISIBLE_EVENTS = 3;

function getUpcomingEvents(events: OutreachEvent[]) {
  const now = new Date();
  return events
    .filter((event) => {
      if (!event.date) return false;
      const time = new Date(event.date).getTime();
      return (
        !Number.isNaN(time) && time >= now.getTime() - 1000 * 60 * 60 * 24 * 2
      );
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, MAX_VISIBLE_EVENTS);
}

export default function OutreachQuickManageCard({
  events,
  canManage,
  onRosterReloadAction
}: OutreachQuickManageCardProps) {
  const [localEvents, setLocalEvents] = useState<OutreachEvent[]>(events ?? []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocalEvents(events ?? []);
  }, [events]);

  const upcomingEvents = useMemo(
    () => getUpcomingEvents(localEvents),
    [localEvents]
  );

  const refreshEvents = useCallback(async () => {
    setLoading(true);
    const [error, latestEvents] = await fetchEvents(PBBrowser.getInstance());

    if (error || !latestEvents) {
      const message = error ? `PocketBase error ${error}` : "No events found";
      toast.error(`Failed to refresh events: ${message}`);
    } else {
      setLocalEvents(latestEvents);
    }

    setLoading(false);
  }, []);

  const handleHoursLogged = useCallback(() => {
    onRosterReloadAction();
    refreshEvents();
  }, [onRosterReloadAction, refreshEvents]);

  const handleEventCreated = useCallback(() => {
    refreshEvents();
  }, [refreshEvents]);


  return (
    <Card className="min-h-[220px]">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <CalendarCheck className="h-4 w-4" /> Quick Manage
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Snapshots of upcoming outreach events
          </p>
        </div>
        {canManage && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={refreshEvents}
            disabled={loading}>
            <RefreshCcw
              className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"}
            />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingEvents.length === 0 ? (
          <div className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            {canManage
              ? "No upcoming events scheduled. Create one to get started."
              : "No upcoming events to show."}
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-lg border px-4 py-3 flex flex-col gap-2 bg-muted/30">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-sm">{event.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {formatPbDate(event.date)}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1">
                    <Clock3 className="h-3 w-3" />
                    {new Date(event.date).toLocaleDateString(undefined, {
                      weekday: "short"
                    })}
                  </Badge>
                </div>
                {canManage ? (
                  <div className="flex justify-end">
                    <LogHoursDialog
                      event={event}
                      onHoursLogged={handleHoursLogged}
                      onEventUpdated={refreshEvents}
                    />
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Reach out to leadership to log minutes for this event.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-3">
        <Button variant="outline" size="sm" asChild className="flex-1">
          <Link
            href="/outreach/manage"
            className="flex items-center justify-center gap-1">
            Open manager <ArrowUpRight className="h-3 w-3" />
          </Link>
        </Button>
        {canManage && <CreateEventDialog onEventCreated={handleEventCreated} />}
      </CardFooter>
    </Card>
  );
}
