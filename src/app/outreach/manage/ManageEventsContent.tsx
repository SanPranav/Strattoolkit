"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchOutreachEvents,
  fetchOutreachEventSessions
} from "@/lib/db/outreach";
import {
  fetchActivitySessionsByEventId,
  fetchTotalActivityMinutes
} from "@/lib/db/activity";

import { useIsMobile } from "@/hooks/use-mobile";

import Loader from "@/components/Loader";
import CreateEventDialog from "./CreateEventDialog";
import EventsList from "./EventsList";
import EventDetails from "./EventDetails";

import { Calendar } from "lucide-react";
import type { ActivityEvent, ActivitySession } from "@/lib/types/db";
import { formatMinutes } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatDateTimeLA } from "@/lib/datetime";
import { OUTREACH } from "@/lib/types/queryKeys";

type ManageEventsContentProps = {
  variant?: "page" | "sheet";
};

export default function ManageEventsContent({
  variant = "page"
}: ManageEventsContentProps) {
  const isMobile = useIsMobile();
  const isSheet = variant === "sheet";
  const queryClient = useQueryClient();

  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(
    null
  );

  const [eventSearch, setEventSearch] = useState("");

  const eventsFetcher = useCallback(async (): Promise<ActivityEvent[]> => {
    const [error, data] = await fetchOutreachEvents();

    if (error || !data) {
      throw new Error(error ?? "Failed to load events");
    }

    return data;
  }, []);

  const {
    data: events = [],
    error: eventsError,
    isLoading: isLoadingEvents
  } = useQuery<ActivityEvent[], Error>({
    queryKey: OUTREACH.EVENTS,
    queryFn: eventsFetcher
  });

  const { data: totalOutreachMinutesAllUsers = 0 } = useQuery<number>({
    queryKey: OUTREACH.TOTAL_MINUTES,
    queryFn: async () => {
      const [error, total] = await fetchTotalActivityMinutes(["outreach"]);
      if (error || total === null) {
        throw new Error(error ?? "Failed to load total outreach minutes");
      }
      return total;
    },
    staleTime: 60_000
  });

  const sessionsFetcher = useCallback(async (): Promise<ActivitySession[]> => {
    if (!selectedEvent?.event_name) return [];

    const [error, data] = await fetchOutreachEventSessions(selectedEvent.id);

    if (error || !data) {
      throw new Error(error ?? "Failed to load sessions");
    }

    return data;
  }, [selectedEvent]);

  const { data: sessions = [] } = useQuery<ActivitySession[]>({
    queryKey: [...OUTREACH.EVENT_SESSIONS(selectedEvent?.id ?? 0)],
    queryFn: sessionsFetcher,
    enabled: Boolean(selectedEvent?.id),
    staleTime: 30_000
  });

  const { data: eventSessions = [] } = useQuery({
    queryKey: [
      ...OUTREACH.EVENT_SUMMARY(selectedEvent?.id ?? 0),
      selectedEvent?.event_name
    ],
    queryFn: async () => {
      if (!selectedEvent?.id) return [];
      const [, data] = await fetchActivitySessionsByEventId(selectedEvent.id);
      return data;
    },
    enabled: Boolean(selectedEvent?.id)
  });

  const totals = useMemo(() => {
    if (!eventSessions?.length) return { raw: 0, credited: 0 };
    return eventSessions.reduce(
      (acc, row) => {
        acc.raw += row.minutes ?? 0;
        acc.credited +=
          Math.min(row.minutes, selectedEvent?.minutes_cap ?? Infinity) ?? 0;
        return acc;
      },
      { raw: 0, credited: 0 }
    );
  }, [eventSessions, selectedEvent?.minutes_cap]);

  const handleEventCreated = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: OUTREACH.EVENTS });
  }, [queryClient]);

  const invalidateCurrentEventData = useCallback(() => {
    if (!selectedEvent?.id) return;
    void queryClient.invalidateQueries({
      queryKey: OUTREACH.EVENT_SESSIONS(selectedEvent.id)
    });
    void queryClient.invalidateQueries({
      queryKey: OUTREACH.EVENT_SUMMARY(selectedEvent.id)
    });
  }, [queryClient, selectedEvent?.id]);

  const handleHoursLogged = useCallback(() => {
    invalidateCurrentEventData();
  }, [invalidateCurrentEventData]);

  const handleSessionDeleted = useCallback(() => {
    invalidateCurrentEventData();
  }, [invalidateCurrentEventData]);

  const handleEventDeleted = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: OUTREACH.EVENTS
    });
    setSelectedEvent(null);
  }, [queryClient]);

  const handleEventSelect = useCallback((event: ActivityEvent) => {
    setSelectedEvent(event);
  }, []);

  const layoutClassName = useMemo(() => {
    if (isSheet) {
      return "flex flex-col xl:flex-row gap-4";
    }

    return `grid lg:grid-cols-2 gap-5 ${isMobile ? "grid-cols-1 mb-20" : ""}`;
  }, [isSheet, isMobile]);

  const filteredEvents = useMemo(() => {
    const q = eventSearch.trim().toLowerCase();
    if (!q) return events;

    return events.filter((event) => {
      const name = (event.event_name ?? "").toLowerCase();
      const dateStr = event.event_date
        ? formatDateTimeLA(event.event_date)
        : "";
      return name.includes(q) || dateStr.toLowerCase().includes(q);
    });
  }, [eventSearch, events]);

  if (eventsError) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Error Loading Events
          </h2>
          <p className="text-muted-foreground">
            Failed to load events. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        isSheet
          ? "flex flex-col gap-5 max-h-[80vh]"
          : "p-4 flex flex-col min-h-[calc(100vh-4rem)]"
      }>
      <div className={isSheet ? "space-y-3" : "mb-6"}>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className={isSheet ? "h-4 w-4" : "h-6 w-6"} />
              <h2
                className={
                  isSheet ? "text-xl font-semibold" : "text-3xl font-bold"
                }>
                Manage Events
              </h2>
              <Badge variant="secondary" className="ml-2">
                Total (all users): {formatMinutes(totalOutreachMinutesAllUsers)}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              Create events and log outreach sessions.
            </p>
          </div>
          <CreateEventDialog onEventCreated={handleEventCreated} />
        </div>
      </div>

      {isLoadingEvents ? (
        <div className="flex items-center justify-center py-12">
          <Loader />
        </div>
      ) : (
        <div className={layoutClassName + " min-h-0"}>
          <EventsList
            events={filteredEvents}
            selectedEvent={selectedEvent}
            onEventSelect={handleEventSelect}
            onEventDeleted={handleEventDeleted}
            onHoursLogged={handleHoursLogged}
            variant={variant}
            searchValue={eventSearch}
            onSearchValueChange={setEventSearch}
          />
          <EventDetails
            selectedEvent={selectedEvent}
            sessions={sessions || []}
            totals={totals}
            onHoursLogged={handleHoursLogged}
            onSessionDeleted={handleSessionDeleted}
            variant={variant}
          />
        </div>
      )}
    </div>
  );
}
