import { useState, useEffect } from "react";
import { toast } from "sonner";
import { pb } from "@/lib/pbaseClient";
import { formatMinutes } from "@/lib/utils";
import type { pb_OutreachEventsItem, pb_UserColItem } from "@/lib/types";

import { Clock, Loader2, Plus, Trash2, User } from "lucide-react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface LogHoursDialogProps {
  event: pb_OutreachEventsItem;
  onHoursLogged: () => void;
}

interface UserSubmission {
  userId: string; // Optional for initial state
  minutes: number;
}

export default function LogHoursDialog({
  event,
  onHoursLogged
}: LogHoursDialogProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<pb_UserColItem[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [submissions, setSubmissions] = useState<UserSubmission[]>([
    {
      userId: "",
      minutes: 0
    }
  ]);

  // Fetch users when dialog opens
  useEffect(() => {
    if (!users.length && open) {
      fetchUsers();
    }
  }, [users, open]);

  const fetchUsers = async function () {
    setFetchingUsers(true);
    try {
      const response = await pb
        .collection("users")
        .getFullList<pb_UserColItem>({
          sort: "name"
        });

      const sorted = response.toSorted((a, b) => a.name.localeCompare(b.name));

      setUsers(sorted);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setFetchingUsers(false);
    }
  };

  const addNewSubmission = function () {
    setSubmissions((prev) => [
      ...prev,
      {
        userId: crypto.randomUUID(),
        minutes: 0
      }
    ]);
  };

  const removeSubmission = function (userId: string) {
    if (submissions.length > 1) {
      setSubmissions((prev) => prev.filter((sub) => sub.userId !== userId));
    } else {
      toast.error("At least one user submission is required");
    }
  };

  const updateSubmission = function <T extends keyof UserSubmission>(
    userId: string,
    field: T,
    value: UserSubmission[T]
  ) {
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.userId === userId ? { ...sub, [field]: value } : sub
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate submissions
    const validSubmissions = submissions.filter(
      (sub) => sub.userId && sub.minutes > 0
    );

    if (validSubmissions.length === 0) {
      toast.error("Please select at least one user and enter valid minutes");
      return;
    }

    // Check for duplicate users
    const userIds = validSubmissions.map((sub) => sub.userId);
    const uniqueUserIds = new Set(userIds);
    if (userIds.length !== uniqueUserIds.size) {
      toast.error("Cannot log hours for the same user multiple times");
      return;
    }

    setSubmitting(true);
    try {
      // Create all sessions
      const promises = validSubmissions.map((sub) =>
        pb.collection("OutreachSessions").create(
          {
            user: sub.userId,
            event: event.id,
            minutes: sub.minutes
          },
          {
            requestKey: null // dont autocancel
          }
        )
      );

      await Promise.all(promises);

      toast.success(
        `Hours logged successfully for ${validSubmissions.length} user${
          validSubmissions.length > 1 ? "s" : ""
        }`
      );

      // Reset form
      setSubmissions([]);
      addNewSubmission(); // Add one empty submission for convenience

      setOpen(false);
      onHoursLogged();
    } catch (error) {
      console.error("Error logging hours:", error);
      toast.error("Failed to log hours");
    } finally {
      setSubmitting(false);
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
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Hours for {event.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">User Hours</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addNewSubmission}
                disabled={submitting || fetchingUsers}
                className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            </div>

            {fetchingUsers ? (
              <div className="space-y-3">
                {[1].map((i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-16" />
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
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading users...
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((submission, index) => (
                  <div
                    key={submission.userId}
                    className="flex gap-3 items-start p-3 border rounded-lg bg-muted/20">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`user-${submission.userId}`}>User</Label>
                      <Select
                        value={submission.userId}
                        onValueChange={(value) =>
                          updateSubmission(submission.userId, "userId", value)
                        }
                        disabled={submitting}>
                        <SelectTrigger
                          id={`user-${submission.userId}`}
                          className="w-full">
                          <SelectValue placeholder="Select a user..." />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-32 space-y-2">
                      <Label htmlFor={`minutes-${submission.userId}`}>
                        Minutes
                        {submission.minutes > 0 && (
                          <span className="block text-xs text-muted-foreground">
                            ({formatMinutes(submission.minutes)})
                          </span>
                        )}
                      </Label>
                      <Input
                        id={`minutes-${submission.userId}`}
                        type="number"
                        value={submission.minutes || ""}
                        onChange={(e) =>
                          updateSubmission(
                            submission.userId,
                            "minutes",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="0"
                        min="0"
                        disabled={submitting}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubmission(submission.userId)}
                      disabled={submissions.length === 1 || submitting}
                      className="mt-6 h-10 w-10 p-0 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || fetchingUsers}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Logging...
                </>
              ) : (
                "Log Hours"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
