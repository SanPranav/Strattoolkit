"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ListTodo,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  ChevronRight,
  Loader2
} from "lucide-react";
import { submitTaskForReview, reviewTask } from "@/lib/db/build";
import type { BuildTask } from "@/lib/types/db";
import { cn } from "@/lib/utils";

type TaskListProps = {
  tasks: BuildTask[];
  isLoading: boolean;
  canManage: boolean;
  canSubmit: boolean;
  userId: string;
  onTaskChange: () => void;
};

const STATUS_CONFIG: Record<
  BuildTask["status"],
  {
    label: string;
    icon: typeof CheckCircle2;
    className: string;
    bgClassName: string;
  }
> = {
  to_do: {
    label: "To Do",
    icon: ListTodo,
    className: "text-blue-500",
    bgClassName: "bg-blue-500/20 text-blue-500"
  },
  in_review: {
    label: "In Review",
    icon: Clock,
    className: "text-amber-500",
    bgClassName: "bg-amber-500/20 text-amber-500"
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "text-red-500",
    bgClassName: "bg-red-500/20 text-red-500"
  },
  complete: {
    label: "Complete",
    icon: CheckCircle2,
    className: "text-green-500",
    bgClassName: "bg-green-500/20 text-green-500"
  }
};

export function TaskList({
  tasks,
  isLoading,
  canManage,
  canSubmit,
  userId,
  onTaskChange
}: TaskListProps) {
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Group tasks by status
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {} as Record<BuildTask["status"], BuildTask[]>);

  const handleSubmitForReview = async (taskId: number) => {
    setActionLoading(taskId);

    const [error] = await submitTaskForReview(taskId, userId);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Task submitted for review");
      onTaskChange();
    }

    setActionLoading(null);
  };

  const handleReviewTask = async (
    taskId: number,
    decision: "complete" | "rejected",
    notes?: string
  ) => {
    setActionLoading(taskId);

    const [error] = await reviewTask(taskId, userId, decision, notes);

    if (error) {
      toast.error(error);
    } else {
      toast.success(
        decision === "complete" ? "Task marked as complete" : "Task rejected"
      );
      onTaskChange();
    }

    setActionLoading(null);
  };

  const renderTask = (task: BuildTask) => {
    const config = STATUS_CONFIG[task.status];
    const StatusIcon = config.icon;
    const isExpanded = expandedTaskId === task.id;
    const isActionLoading = actionLoading === task.id;
    // Task can be submitted for review if: user has submit permission AND task is in to_do or rejected status
    const canCheckOff = canSubmit && (task.status === "to_do" || task.status === "rejected");

    return (
      <div
        key={task.id}
        className={cn(
          "border rounded-lg p-3 transition-all",
          isExpanded && "bg-muted/30"
        )}>
        <div
          className="flex items-start gap-3 cursor-pointer"
          onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}>
          {/* Checkbox for submitting task for review - min 44px touch target */}
          {canCheckOff && (
            <div
              className="flex items-center justify-center min-w-[44px] min-h-[44px] -m-2"
              onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={false}
                disabled={isActionLoading}
                onCheckedChange={() => handleSubmitForReview(task.id)}
                className="h-5 w-5"
              />
            </div>
          )}
          {!canCheckOff && (
            <StatusIcon
              className={cn("h-5 w-5 mt-0.5 flex-shrink-0", config.className)}
            />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">
                {task.task_name}
              </span>
              <Badge className={cn("text-xs", config.bgClassName)}>
                {config.label}
              </Badge>
            </div>

            {task.due_date && (
              <div className="text-xs text-muted-foreground mt-1">
                Due: {new Date(task.due_date).toLocaleDateString()}
              </div>
            )}
          </div>

          <ChevronRight
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isExpanded && "rotate-90"
            )}
          />
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t space-y-3">
            {task.description && (
              <p className="text-sm text-muted-foreground">
                {task.description}
              </p>
            )}

            {task.rejection_reason && (
              <div className="bg-muted/50 rounded-md p-2 text-xs">
                <strong>Rejection reason:</strong> {task.rejection_reason}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {/* Submit for review action (requires build_tasks:submit permission) */}
              {canSubmit &&
                (task.status === "to_do" || task.status === "rejected") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubmitForReview(task.id);
                    }}
                    disabled={isActionLoading}>
                    {isActionLoading ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Send className="h-3 w-3 mr-1" />
                    )}
                    Submit for Review
                  </Button>
                )}

              {/* Review actions (requires build_tasks:manage permission) */}
              {canManage && task.status === "in_review" && (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReviewTask(task.id, "complete");
                    }}
                    disabled={isActionLoading}>
                    {isActionLoading ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    )}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReviewTask(task.id, "rejected");
                    }}
                    disabled={isActionLoading}>
                    {isActionLoading ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusOrder: BuildTask["status"][] = [
    "in_review",
    "to_do",
    "rejected",
    "complete"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <ListTodo className="h-4 w-4" />
          Tasks
          {tasks.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {tasks.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <ListTodo className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks assigned to your groups</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {statusOrder.map((status) => {
                const statusTasks = groupedTasks[status];
                if (!statusTasks || statusTasks.length === 0) return null;

                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {STATUS_CONFIG[status].label}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {statusTasks.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {statusTasks.map(renderTask)}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
