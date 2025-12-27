import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
  bulkCreateOutreachEventSessions,
  updateOutreachEvent
} from "@/lib/db/outreach";
import { getAllUsers } from "@/lib/db/server";
import { formatMinutes, cn } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { DateTimePicker } from "@/components/DateTimePicker";
import { parseISODateTime, toISOFromPickerDate } from "@/lib/datetime";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";

import {
  Clock,
  Loader2,
  Plus,
  Trash2,
  User as UserIcon,
  ChevronsUpDown,
  Check,
  Save,
  Calendar
} from "lucide-react";
import type { ActivityEvent, UserData } from "@/lib/types/db";
import { useQuery } from "@tanstack/react-query";
import { USER } from "@/lib/types/queryKeys";

interface LogHoursDialogProps {
  event: ActivityEvent;
  onHoursLogged: () => void;
  // Optional: parent can revalidate events after rename/date change
  onEventUpdated?: () => void;
}

interface UserSubmission {
  rowId: string; // stable row key
  userId: string; // selected user id
  minutes: number;
}

// Combobox component for selecting a user with search

export default function LogHoursDialog({
  event,
  onHoursLogged,
  onEventUpdated
}: LogHoursDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [eventName, setEventName] = useState(event.event_name ?? "");
  const [eventDate, setEventDate] = useState<Date | undefined>(
    parseISODateTime(event.event_date)
  );
  const [minutesCap, setMinutesCap] = useState<string>(
    event.minutes_cap != null ? String(event.minutes_cap) : ""
  );

  const {
    data: allUsers,
    isLoading: isLoadingUsers,
    error: usersError
  } = useQuery({
    queryKey: USER.ALL_USERS,
    queryFn: async () => {
      const [error, data] = await getAllUsers();
      if (error || !data) {
        throw new Error(error ?? "Failed to load users");
      }
      return data;
    },
    enabled: open
  });

  const [submissions, setSubmissions] = useState<UserSubmission[]>([
    {
      rowId: crypto.randomUUID(),
      userId: "",
      minutes: 0
    }
  ]);

  // Reset editable event fields whenever dialog opens
  useEffect(() => {
    if (open) {
      setEventName(event.event_name ?? "");
      setEventDate(parseISODateTime(event.event_date));
      setMinutesCap(event.minutes_cap != null ? String(event.minutes_cap) : "");
    }
  }, [open, event.event_name, event.event_date, event.minutes_cap]);

  useEffect(() => {
    if (open) {
      let hasChanges = false;
      if (event.event_name !== eventName) hasChanges = true;
      const nextISO = eventDate ? toISOFromPickerDate(eventDate) : "";
      if ((event.event_date ?? "") !== nextISO) hasChanges = true;

      const currentCap = event.minutes_cap ?? "";
      const nextCap = minutesCap.trim();
      const normalizedNextCap = nextCap === "" ? "" : Number(nextCap);
      if (currentCap !== normalizedNextCap) hasChanges = true;

      setIsSaveDisabled(!hasChanges);
    }
  }, [
    eventName,
    eventDate,
    minutesCap,
    open,
    event.event_name,
    event.event_date,
    event.minutes_cap
  ]);

  const addNewSubmission = () =>
    setSubmissions((prev) => [
      ...prev,
      {
        rowId: crypto.randomUUID(),
        userId: "",
        minutes: 0
      }
    ]);

  const removeSubmission = (rowId: string) => {
    if (submissions.length > 1) {
      setSubmissions((prev) => prev.filter((s) => s.rowId !== rowId));
    } else {
      toast.error("At least one user submission is required");
    }
  };

  const updateSubmission = function <T extends keyof UserSubmission>(
    rowId: string,
    field: T,
    value: UserSubmission[T]
  ) {
    setSubmissions((prev) =>
      prev.map((s) => (s.rowId === rowId ? { ...s, [field]: value } : s))
    );
  };

  const totalMinutes = useMemo(
    () => submissions.reduce((acc, s) => acc + (s.minutes || 0), 0),
    [submissions]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate submissions
    const valid = submissions.filter((s) => s.userId && s.minutes > 0);

    if (!valid.length) {
      toast.error("Please select at least one user and enter valid minutes");
      return;
    }

    // Check for duplicate users
    const ids = valid.map((s) => s.userId);
    if (new Set(ids).size !== ids.length) {
      toast.error("Cannot log hours for the same user multiple times");
      return;
    }

    setSubmitting(true);
    try {
      const [error] = await bulkCreateOutreachEventSessions(
        valid.map((s) => ({
          user_id: s.userId,
          event_id: event.id,
          minutes: s.minutes
        }))
      );

      if (error) {
        throw new Error(error ?? "Failed to log hours");
      }

      logger.info({ eventId: event.id, count: valid.length }, "Hours logged");
      toast.success(
        `Hours logged successfully for ${valid.length} user${
          valid.length > 1 ? "s" : ""
        }`
      );

      // Reset form
      setSubmissions([
        {
          rowId: crypto.randomUUID(),
          userId: "",
          minutes: 0
        }
      ]);

      setOpen(false);
      onHoursLogged();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({ eventId: event.id, err: message }, "Error logging hours");
      toast.error("Failed to log hours");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEventSave = async () => {
    if (!eventName || !eventDate) {
      toast.error("Event name and date are required");
      return;
    }

    const capTrimmed = minutesCap.trim();
    let nextMinutesCap: number | null = null;
    if (capTrimmed) {
      const parsed = Number(capTrimmed);
      if (!Number.isFinite(parsed) || parsed < 0) {
        toast.error("Minutes cap must be a non-negative number");
        return;
      }
      nextMinutesCap = parsed;
    }

    const nextEventDateISO = toISOFromPickerDate(eventDate);

    if (
      eventName === event.event_name &&
      nextEventDateISO === (event.event_date ?? "") &&
      (event.minutes_cap ?? null) === nextMinutesCap
    ) {
      toast.message("No changes to save");
      return;
    }

    setSavingEvent(true);
    try {
      const [error] = await updateOutreachEvent(event.id, {
        event_name: eventName,
        event_date: nextEventDateISO,
        minutes_cap: nextMinutesCap
      });

      if (error) {
        throw new Error(error ?? "Failed to update event");
      }
      logger.info({ eventId: event.id }, "Event updated");
      toast.success("Event updated");
      onEventUpdated?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({ eventId: event.id, err: message }, "Error updating event");
      toast.error("Failed to update event");
    } finally {
      setSavingEvent(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Clock className="h-4 w-4 mr-2" />
          Log Hours
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px] max-h-[85vh] overflow-hidden p-0">
        <div className="grid grid-rows-[auto,1fr,auto] h-full max-h-[85vh]">
          <div className="p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" /> Log Hours for {event.event_name}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="overflow-y-auto p-6 space-y-6">
            {/* Event editable details */}
            <div className="rounded-lg border p-4 bg-muted/30 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" /> Event Details
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-name">Event Name</Label>
                  <Input
                    id="event-name"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Event name"
                    disabled={savingEvent || submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-date">Event Date</Label>
                  <div
                    className={
                      savingEvent || submitting
                        ? "pointer-events-none opacity-60"
                        : ""
                    }>
                    <DateTimePicker value={eventDate} onChange={setEventDate} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minutes-cap">Minutes Cap (optional)</Label>
                  <Input
                    id="minutes-cap"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="e.g. 120"
                    value={minutesCap}
                    onChange={(e) => setMinutesCap(e.target.value)}
                    disabled={savingEvent || submitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank for no cap. Minutes per session are credited up
                    to this value.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant={isSaveDisabled ? "secondary" : "default"}
                  size="sm"
                  onClick={handleEventSave}
                  disabled={savingEvent || submitting || isSaveDisabled}>
                  {savingEvent ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>

            <form
              id="log-hours-form"
              onSubmit={handleSubmit}
              className="space-y-6">
              {/* User hours section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">User Hours</Label>
                    <p className="text-xs text-muted-foreground">
                      Search & select each user, then enter minutes. Add
                      additional rows as needed.
                    </p>
                  </div>
                </div>

                {isLoadingUsers ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="w-32 space-y-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-10 mt-6" />
                      </div>
                    ))}
                    <div className="text-sm text-muted-foreground flex items-center gap-2 justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading
                      users...
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((sub) => (
                      <div
                        key={sub.rowId}
                        className="flex flex-col sm:flex-row gap-3 items-start p-3 border rounded-lg bg-muted/10">
                        <div className="flex-1 space-y-2 w-full">
                          <Label>User</Label>
                          <UserCombobox
                            users={allUsers ?? []}
                            value={sub.userId}
                            onChange={(val) =>
                              updateSubmission(sub.rowId, "userId", val)
                            }
                            disabled={submitting}
                          />
                        </div>

                        <div className="w-full sm:w-32 space-y-2">
                          <Label
                            htmlFor={`minutes-${sub.rowId}`}
                            className="flex items-center justify-between w-full">
                            <span>Minutes</span>
                            {sub.minutes > 0 && (
                              <span className="text-[10px] font-medium text-muted-foreground">
                                {formatMinutes(sub.minutes)}
                              </span>
                            )}
                          </Label>
                          <Input
                            id={`minutes-${sub.rowId}`}
                            type="number"
                            value={sub.minutes || ""}
                            onChange={(e) =>
                              updateSubmission(
                                sub.rowId,
                                "minutes",
                                parseInt(e.target.value) || 0
                              )
                            }
                            placeholder="0"
                            min="0"
                            disabled={submitting}
                          />
                        </div>

                        <div className="flex sm:flex-col gap-2 sm:gap-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSubmission(sub.rowId)}
                            disabled={submissions.length === 1 || submitting}
                            className="mt-6 h-10 w-10 p-0 text-muted-foreground hover:text-destructive"
                            aria-label="Remove row">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="border-t bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur p-4">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                <span>
                  Rows: <strong>{submissions.length}</strong>
                </span>
                <span>
                  Total Minutes: <strong>{totalMinutes}</strong>
                  {totalMinutes > 0 && (
                    <strong> = {formatMinutes(totalMinutes)}</strong>
                  )}
                </span>
              </div>
              <DialogFooter className="flex-row gap-2 !mt-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addNewSubmission}
                  disabled={submitting || isLoadingUsers}
                  className="flex items-center gap-2">
                  <Plus className="h-6 w-6" /> Add Row
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={submitting || savingEvent}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="log-hours-form"
                  onClick={(e) => {
                    const confirmed = confirm(
                      "Are you sure you want to log these hours?"
                    );
                    if (!confirmed) e.preventDefault();
                  }}
                  disabled={submitting || isLoadingUsers || savingEvent}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                      Logging...
                    </>
                  ) : (
                    "Log Hours"
                  )}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UserCombobox({
  users,
  value,
  onChange,
  disabled,
  placeholder = "Select user..."
}: {
  users: UserData[];
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  const currentUser = users.find((u) => u.user_id === value);
  const fallbackDisplay =
    currentUser?.user_name ?? currentUser?.email ?? "Unknown";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between">
          <span className="flex items-center gap-2 truncate">
            {currentUser ? (
              <>
                <UserIcon className="h-4 w-4 opacity-70" />
                <span className="truncate" title={fallbackDisplay}>
                  {fallbackDisplay}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[320px] p-0 max-h-[70vh]"
        align="start"
        sideOffset={8}
        onWheelCapture={(event) => event.stopPropagation()}
        onTouchMoveCapture={(event) => event.stopPropagation()}>
        <Command>
          <CommandInput placeholder="Search users..." autoFocus />
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            {users.map((user) => (
              <CommandItem
                key={user.user_name}
                value={`${user.user_name ?? ""} ${user.email ?? ""}`}
                onSelect={() => {
                  onChange(user.user_id);
                  setOpen(false);
                }}>
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    user.user_id === value ? "opacity-100" : "opacity-0"
                  )}
                />
                <span
                  className="truncate"
                  title={user.user_name ?? user.email ?? "Unknown"}>
                  {user.user_name ?? user.email ?? "Unknown"}
                </span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
