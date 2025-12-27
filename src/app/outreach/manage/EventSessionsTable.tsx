// React
import { useMemo, useState } from "react";

import { toast } from "sonner";
import { formatMinutes } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { deleteSession, updateSessionMinutes } from "@/lib/db/outreach";
import { logger } from "@/lib/logger";
import { formatDateTimeLA } from "@/lib/datetime";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

import { Clock, Trash2 } from "lucide-react";
import type {
  ActivityEvent,
  ActivitySession,
  OutreachEvent,
  OutreachSession
} from "@/lib/types/db";
import { UserInfo } from "@/components/UserInfo";

interface EventSessionsTableProps {
  event: ActivityEvent;
  sessions: ActivitySession[];
  onSessionDeleted: () => void;
  compact?: boolean;
}

export default function EventSessionsTable({
  event,
  sessions,
  onSessionDeleted,
  compact = false
}: EventSessionsTableProps) {
  const isMobile = useIsMobile();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkMinutes, setBulkMinutes] = useState<string>("");

  const sessionIds = useMemo(() => sessions.map((s) => s.id), [sessions]);
  const allSelected =
    sessionIds.length > 0 && selectedIds.size === sessionIds.length;
  const someSelected =
    selectedIds.size > 0 && selectedIds.size < sessionIds.length;

  const toggleSelected = (sessionId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) next.delete(sessionId);
      else next.add(sessionId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (prev.size === sessionIds.length) return new Set();
      return new Set(sessionIds);
    });
  };

  const handleUpdateMinutes = async (sessionId: number, minutes: number) => {
    setSavingIds((prev) => new Set(prev).add(sessionId));
    try {
      const [error] = await updateSessionMinutes(sessionId, minutes);
      if (error) throw new Error(error);
      toast.success("Minutes updated");
      onSessionDeleted();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(
        { sessionId, eventId: event.id, err: message },
        "Failed to update session minutes"
      );
      toast.error("Failed to update minutes");
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(sessionId);
        return next;
      });
    }
  };

  const handleBulkApply = async () => {
    const trimmed = bulkMinutes.trim();
    if (selectedIds.size === 0) return;
    if (trimmed.length === 0) {
      toast.error("Enter minutes to apply");
      return;
    }
    const nextMinutes = Number(trimmed);
    if (!Number.isFinite(nextMinutes) || nextMinutes < 0) {
      toast.error("Minutes must be a non-negative number");
      return;
    }

    const confirmed = confirm(
      `Apply ${nextMinutes} minutes to ${selectedIds.size} session(s)?`
    );
    if (!confirmed) return;

    const ids = Array.from(selectedIds);
    setSavingIds(new Set(ids));
    try {
      const results = await Promise.all(
        ids.map((id) => updateSessionMinutes(id, nextMinutes))
      );
      const firstError = results.map((r) => r[0]).find(Boolean);
      if (firstError) throw new Error(firstError);
      toast.success("Minutes applied");
      setSelectedIds(new Set());
      setBulkMinutes("");
      onSessionDeleted();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(
        { eventId: event.id, err: message },
        "Failed bulk-update session minutes"
      );
      toast.error("Failed to apply minutes");
    } finally {
      setSavingIds(new Set());
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    const confirmed = confirm("Are you sure you want to delete this session?");
    if (!confirmed) return;

    setDeletingId(sessionId);
    try {
      const [error] = await deleteSession(sessionId);

      if (error) {
        throw new Error(error ?? "Failed to delete session");
      }

      logger.warn(
        { sessionId, eventId: event.id },
        "Session deleted from table"
      );
      toast.success("Session deleted successfully");
      onSessionDeleted();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(
        { sessionId, eventId: event.id, err: message },
        "Failed to delete session"
      );
      toast.error("Failed to delete session");
    } finally {
      setDeletingId(null);
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No hours logged for this event yet</p>
      </div>
    );
  }

  const containerClasses = compact
    ? "flex flex-col gap-3 max-h-[60vh] overflow-y-auto"
    : "flex flex-col gap-3 h-full min-h-0";

  const tableWrapperClasses = compact
    ? "border rounded-md overflow-x-auto"
    : "overflow-y-auto border rounded-md overflow-x-auto";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="font-semibold">Logged Hours</h4>
        {!compact && (
          <div className="flex gap-2 items-center">
            <Input
              inputMode="numeric"
              placeholder="Bulk minutes"
              value={bulkMinutes}
              onChange={(e) => setBulkMinutes(e.target.value)}
              className="w-[140px]"
              disabled={selectedIds.size === 0}
            />
            <Button
              size="sm"
              onClick={handleBulkApply}
              disabled={selectedIds.size === 0 || savingIds.size > 0}>
              Apply to {selectedIds.size || 0}
            </Button>
          </div>
        )}
      </div>
      <div className={tableWrapperClasses}>
        <Table>
          <TableHeader>
            <TableRow>
              {!isMobile && !compact && (
                <TableHead className="w-[44px]">
                  <input
                    type="checkbox"
                    aria-label="Select all sessions"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead>User</TableHead>
              <TableHead>Time</TableHead>
              {!isMobile && <TableHead>Date Logged</TableHead>}
              {!isMobile && (
                <TableHead className="w-[100px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                {!isMobile && !compact && (
                  <TableCell>
                    <input
                      type="checkbox"
                      aria-label={`Select session ${session.id}`}
                      checked={selectedIds.has(session.id)}
                      onChange={() => toggleSelected(session.id)}
                      disabled={
                        savingIds.has(session.id) || deletingId === session.id
                      }
                    />
                  </TableCell>
                )}
                <TableCell>
                  <UserInfo userId={session.user_id} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">
                        Raw: {formatMinutes(session.minutes || 0)}
                      </Badge>
                      {event.minutes_cap !== null &&
                        event.minutes_cap !== undefined && (
                          <Badge variant="outline">
                            Credited:{" "}
                            {formatMinutes(
                              Math.min(session.minutes || 0, event.minutes_cap)
                            )}
                          </Badge>
                        )}
                    </div>
                    {!isMobile && !compact && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          const current = session.minutes ?? 0;
                          const value = prompt(
                            "Set minutes (non-negative number)",
                            String(current)
                          );
                          if (value == null) return;
                          const next = Number(value.trim());
                          if (!Number.isFinite(next) || next < 0) {
                            toast.error(
                              "Minutes must be a non-negative number"
                            );
                            return;
                          }
                          await handleUpdateMinutes(session.id, next);
                        }}
                        disabled={
                          savingIds.has(session.id) || deletingId === session.id
                        }>
                        Edit
                      </Button>
                    )}
                  </div>
                </TableCell>
                {!isMobile && (
                  <TableCell>{formatDateTimeLA(session.created_at)}</TableCell>
                )}
                {!isMobile && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSession(session.id)}
                      disabled={
                        deletingId === session.id || savingIds.has(session.id)
                      }>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
