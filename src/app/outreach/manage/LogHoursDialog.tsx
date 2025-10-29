import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { createSessionsBulk, updateEvent } from "@/lib/db/outreach";
import { listAllUsers } from "@/lib/db/user";
import { formatMinutes, cn } from "@/lib/utils";
import type { OutreachEvent, User } from "@/lib/types/pocketbase";
import { logger } from "@/lib/logger";
import { ErrorToString } from "@/lib/states";

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
import { PBBrowser } from "@/lib/pb";

interface LogHoursDialogProps {
  event: OutreachEvent;
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
  const [users, setUsers] = useState<User[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);

  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [eventName, setEventName] = useState(event.name);
  const [eventDate, setEventDate] = useState(event.date.split(" ").at(0));

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
      setEventName(event.name);
      setEventDate(event.date.split(" ").at(0));
    }
  }, [open, event.name, event.date]);

  useEffect(() => {
    if (open) {
      let hasChanges = false;
      if (event.name !== eventName) hasChanges = true;
      if (event.date.split(" ").at(0) !== eventDate) hasChanges = true;

      setIsSaveDisabled(!hasChanges);
    }
  }, [eventName, eventDate, open, event.name, event.date]);

  // Fetch users when dialog opens
  useEffect(() => {
    if (!users.length && open) {
      fetchUsers();
    }
  }, [users.length, open]);

  async function fetchUsers() {
    setFetchingUsers(true);
    try {
      const [error, allUsers] = await listAllUsers(PBBrowser.getInstance());

      if (error || !allUsers) {
        throw new Error(
          error ? ErrorToString[error] ?? "PocketBase error" : "No users"
        );
      }

      setUsers(allUsers);
    } catch (error: any) {
      logger.error({ err: error?.message }, "Error fetching users");
      toast.error("Failed to load users");
    } finally {
      setFetchingUsers(false);
    }
  }

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
      const [error] = await createSessionsBulk(
        valid.map((s) => ({
          userId: s.userId,
          eventId: event.id,
          minutes: s.minutes
        })),
        PBBrowser.getInstance()
      );

      if (error) {
        throw new Error(ErrorToString[error] ?? error);
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
    } catch (error: any) {
      logger.error(
        { eventId: event.id, err: error?.message },
        "Error logging hours"
      );
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

    if (eventName === event.name && eventDate === event.date.split(" ")[0]) {
      toast.message("No changes to save");
      return;
    }

    setSavingEvent(true);
    try {
      const [error] = await updateEvent(
        event.id,
        {
          name: eventName,
          date: eventDate
        },
        PBBrowser.getInstance()
      );

      if (error) {
        throw new Error(ErrorToString[error] ?? error);
      }
      logger.info({ eventId: event.id }, "Event updated");
      toast.success("Event updated");
      onEventUpdated?.();
    } catch (error: any) {
      logger.error(
        { eventId: event.id, err: error?.message },
        "Error updating event"
      );
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
      <DialogContent className="sm:max-w-[750px] max-h-[85vh] overflow-y-auto space-y-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" /> Log Hours for {event.name}
          </DialogTitle>
        </DialogHeader>

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
              <Input
                id="event-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                disabled={savingEvent || submitting}
              />
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User hours section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">User Hours</Label>
                <p className="text-xs text-muted-foreground">
                  Search & select each user, then enter minutes. Add additional
                  rows as needed.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addNewSubmission}
                disabled={submitting || fetchingUsers}
                className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Row
              </Button>
            </div>

            {fetchingUsers ? (
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
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading users...
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
                        users={users}
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

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between border-t pt-4">
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
                onClick={() => setOpen(false)}
                disabled={submitting || savingEvent}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || fetchingUsers || savingEvent}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Logging...
                  </>
                ) : (
                  "Log Hours"
                )}
              </Button>
            </DialogFooter>
          </div>
        </form>
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
  users: User[];
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  const currentUser = users.find((u) => u.id === value);

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
                <span className="truncate" title={currentUser.name}>
                  {currentUser.name}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search users..." autoFocus />
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.name}
                  onSelect={() => {
                    onChange(user.id);
                    setOpen(false);
                  }}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      user.id === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate" title={user.name}>
                    {user.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
