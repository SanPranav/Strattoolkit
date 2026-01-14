"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { fetchUserBuildSessions } from "@/lib/db/build";
import { BUILD } from "@/lib/types/queryKeys";
import type { BuildSession } from "@/lib/types/db";
import { formatMinutes } from "@/lib/utils";

type BuildCalendarProps = {
  userId: string;
};

export function BuildCalendar({ userId }: BuildCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Fetch user's build sessions
  const { data: sessions, isLoading } = useQuery({
    queryKey: BUILD.SESSIONS(userId),
    queryFn: async () => {
      const [error, data] = await fetchUserBuildSessions(userId, {
        limit: 100
      });
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!userId,
    staleTime: 60_000
  });

  // Create a map of dates to sessions
  const sessionsByDate = useMemo(() => {
    if (!sessions) return new Map<string, BuildSession[]>();

    const map = new Map<string, BuildSession[]>();

    sessions.forEach((session) => {
      const date = new Date(session.started_at).toDateString();
      const existing = map.get(date) || [];
      map.set(date, [...existing, session]);
    });

    return map;
  }, [sessions]);

  // Get sessions for selected date
  const selectedDateSessions = useMemo(() => {
    if (!selectedDate) return [];
    return sessionsByDate.get(selectedDate.toDateString()) || [];
  }, [selectedDate, sessionsByDate]);

  // Calculate total minutes for selected date
  const selectedDateMinutes = useMemo(() => {
    return selectedDateSessions.reduce((total, session) => {
      const start = new Date(session.started_at).getTime();
      const end = session.ended_at
        ? new Date(session.ended_at).getTime()
        : Date.now();
      return total + Math.floor((end - start) / 1000 / 60);
    }, 0);
  }, [selectedDateSessions]);

  // Dates with sessions for highlighting
  const datesWithSessions = useMemo(() => {
    return new Set(
      Array.from(sessionsByDate.keys()).map((d) => new Date(d).toDateString())
    );
  }, [sessionsByDate]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Build Calendar
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[100px] text-center">
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric"
              })}
            </span>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={{
                hasSession: (date) => datesWithSessions.has(date.toDateString())
              }}
              modifiersStyles={{
                hasSession: {
                  fontWeight: "bold",
                  backgroundColor: "hsl(var(--primary) / 0.1)",
                  color: "hsl(var(--primary))"
                }
              }}
              className="rounded-md"
            />

            {/* Selected Date Details */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedDate?.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric"
                  })}
                </span>
                {selectedDateSessions.length > 0 && (
                  <Badge variant="secondary">
                    {formatMinutes(selectedDateMinutes)}
                  </Badge>
                )}
              </div>

              {selectedDateSessions.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No sessions on this day
                </p>
              ) : (
                <div className="space-y-1">
                  {selectedDateSessions.map((session) => {
                    const start = new Date(session.started_at);
                    const end = session.ended_at
                      ? new Date(session.ended_at)
                      : null;
                    const duration = end
                      ? Math.floor(
                          (end.getTime() - start.getTime()) / 1000 / 60
                        )
                      : null;

                    return (
                      <div
                        key={session.id}
                        className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1">
                        <span>
                          {start.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                          {end && (
                            <>
                              {" - "}
                              {end.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </>
                          )}
                          {!end && (
                            <Badge
                              className="ml-2 text-[10px] py-0"
                              variant="outline">
                              Active
                            </Badge>
                          )}
                        </span>
                        {duration !== null && (
                          <span className="text-muted-foreground">
                            {formatMinutes(duration)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
