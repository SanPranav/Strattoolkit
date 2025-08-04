"use client";

import { useEffect, useState, useCallback } from "react";
import useSWR from "swr";

import { pb } from "@/lib/pbaseClient";
import { useNavbar } from "@/hooks/useNavbar";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useIsMobile } from "@/hooks/use-mobile";
import type {
  pb_OutreachEventsItem,
  pb_OutreachSessionsItem
} from "@/lib/types";

import { Calendar } from "lucide-react";
import Loader from "@/components/Loader";
import CreateEventDialog from "./CreateEventDialog";
import EventsList from "./EventsList";
import EventDetails from "./EventDetails";

export default function ManageEventsPage() {
  const { setDefaultShown } = useNavbar();
  const isHydrated = useIsHydrated();
  const isMobile = useIsMobile();

  const [selectedEvent, setSelectedEvent] =
    useState<pb_OutreachEventsItem | null>(null);

  // Fetch events
  const {
    data: events,
    error: eventsError,
    mutate: mutateEvents
  } = useSWR("outreach-events", async () => {
    const response = await pb
      .collection("OutreachEvents")
      .getFullList<pb_OutreachEventsItem>({
        sort: "-created"
      });
    return response;
  });

  // Fetch sessions for selected event
  const { data: sessions, mutate: mutateSessions } = useSWR(
    selectedEvent ? `outreach-sessions-${selectedEvent.id}` : null,
    async () => {
      if (!selectedEvent) return [];
      const response = await pb
        .collection("OutreachSessions")
        .getFullList<pb_OutreachSessionsItem>({
          filter: `event = "${selectedEvent.id}"`,
          expand: "user",
          sort: "-created"
        });
      return response;
    }
  );

  const handleEventCreated = useCallback(() => {
    mutateEvents();
  }, [mutateEvents]);

  const handleHoursLogged = useCallback(() => {
    mutateSessions();
  }, [mutateSessions]);

  const handleSessionDeleted = useCallback(() => {
    mutateSessions();
  }, [mutateSessions]);

  const handleEventDeleted = useCallback(() => {
    mutateEvents();
    if (selectedEvent) {
      setSelectedEvent(null);
    }
  }, [mutateEvents, selectedEvent]);

  const handleEventSelect = useCallback((event: pb_OutreachEventsItem) => {
    setSelectedEvent(event);
  }, []);

  useEffect(() => {
    setDefaultShown(false);
  }, [setDefaultShown]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  if (eventsError) {
    return (
      <div className="flex items-center justify-center h-screen">
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
    <div className={`p-4 flex flex-col`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className={`${isMobile ? "h-5 w-5" : "h-6 w-6"}`} />
              <h1 className={`${isMobile ? "text-2xl" : "text-3xl"} font-bold`}>
                Manage Events
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Create events and log peoples outreach hours
            </p>
          </div>
          <CreateEventDialog onEventCreated={handleEventCreated} />
        </div>
      </div>

      <div
        className={`grid lg:grid-cols-2 gap-5 ${
          isMobile ? "grid-cols-1 mb-20" : ""
        }`}>
        <EventsList
          events={events}
          selectedEvent={selectedEvent}
          onEventSelect={handleEventSelect}
          onEventDeleted={handleEventDeleted}
          onHoursLogged={handleHoursLogged}
          isMobile={false}
        />

        <EventDetails
          selectedEvent={selectedEvent}
          sessions={sessions}
          onHoursLogged={handleHoursLogged}
          onSessionDeleted={handleSessionDeleted}
        />
      </div>
    </div>
  );
}
