"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  ListTodo,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar
} from "lucide-react";
import {
  createBuildTask,
  updateBuildTask,
  deleteBuildTask,
  reviewTask
} from "@/lib/db/build";
import type { BuildTaskWithUsers } from "@/lib/db/build";
import type { BuildGroup } from "@/lib/types/db";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { DateTimePicker } from "@/components/DateTimePicker";
import { parseISODateTime, toISOFromPickerDate } from "@/lib/datetime";

type TasksTabProps = {
  tasks: BuildTaskWithUsers[];
  groups: BuildGroup[];
  isLoading: boolean;
  userId: string;
  onRefresh: () => void;
};

type TaskFormData = {
  task_name: string;
  description: string;
  group_id: string;
  due_date: Date | undefined;
};

const defaultFormData: TaskFormData = {
  task_name: "",
  description: "",
  group_id: "",
  due_date: undefined
};

const STATUS_CONFIG: Record<
  BuildTaskWithUsers["status"],
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  to_do: {
    label: "To Do",
    className: "bg-blue-500/20 text-blue-500",
    icon: ListTodo
  },
  in_review: {
    label: "In Review",
    className: "bg-amber-500/20 text-amber-500",
    icon: Clock
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-500/20 text-red-500",
    icon: XCircle
  },
  complete: {
    label: "Complete",
    className: "bg-green-500/20 text-green-500",
    icon: CheckCircle2
  }
};

export function TasksTab({
  tasks,
  groups,
  isLoading,
  userId,
  onRefresh
}: TasksTabProps) {
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<BuildTaskWithUsers | null>(
    null
  );
  const [formData, setFormData] = useState<TaskFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Review dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingTask, setReviewingTask] = useState<BuildTaskWithUsers | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  const handleOpenCreate = () => {
    setEditingTask(null);
    setFormData(defaultFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (task: BuildTaskWithUsers) => {
    setEditingTask(task);
    setFormData({
      task_name: task.task_name,
      description: task.description || "",
      group_id: task.assigned_group_id?.toString() || "",
      due_date: parseISODateTime(task.due_date)
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.task_name || !formData.group_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      task_name: formData.task_name,
      description: formData.description || null,
      assigned_group_id: parseInt(formData.group_id),
      due_date: formData.due_date
        ? toISOFromPickerDate(formData.due_date)
        : null,
      created_by: userId,
      status: "to_do" as const
    };

    if (editingTask) {
      const [error] = await updateBuildTask(editingTask.id, payload);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Task updated");
        setIsDialogOpen(false);
        onRefresh();
      }
    } else {
      const [error] = await createBuildTask(payload);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Task created");
        setIsDialogOpen(false);
        onRefresh();
      }
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (taskId: number) => {
    setDeletingId(taskId);

    const [error] = await deleteBuildTask(taskId);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Task deleted");
      onRefresh();
    }

    setDeletingId(null);
  };

  const handleOpenReview = (task: BuildTaskWithUsers) => {
    setReviewingTask(task);
    setRejectionReason("");
    setReviewDialogOpen(true);
  };

  const handleReviewSubmit = async (decision: "complete" | "rejected") => {
    if (!reviewingTask) return;

    if (decision === "rejected" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setIsReviewing(true);

    const [error] = await reviewTask(
      reviewingTask.id,
      userId,
      decision,
      decision === "rejected" ? rejectionReason : undefined
    );

    if (error) {
      toast.error(error);
    } else {
      toast.success(
        decision === "complete" ? "Task approved" : "Task rejected"
      );
      setReviewDialogOpen(false);
      onRefresh();
    }

    setIsReviewing(false);
  };

  const getGroupName = (groupId: number | null) => {
    if (!groupId) return "Unassigned";
    return groups.find((g) => g.id === groupId)?.group_name || "Unknown";
  };

  // Group tasks by assigned_group_id and sort groups alphabetically
  const sortedGroups = [...groups].sort((a, b) =>
    a.group_name.localeCompare(b.group_name)
  );

  const tasksByGroup = sortedGroups.map((group) => ({
    group,
    tasks: tasks.filter((t) => t.assigned_group_id === group.id)
  }));

  // Count tasks in review
  const inReviewCount = tasks.filter((t) => t.status === "in_review").length;
  const inReviewTasks = tasks.filter((t) => t.status === "in_review");

  const renderTaskCard = (task: BuildTaskWithUsers) => {
    const config = STATUS_CONFIG[task.status];
    const StatusIcon = config.icon;

    return (
      <div
        key={task.id}
        className="border rounded-lg p-3 bg-card hover:bg-muted/30 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <StatusIcon
              className={cn(
                "h-4 w-4 mt-0.5 flex-shrink-0",
                config.className.replace("bg-", "text-").split(" ")[1]
              )}
            />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm line-clamp-2">
                {task.task_name}
              </span>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>
          <Badge className={cn("text-xs flex-shrink-0", config.className)}>
            {config.label}
          </Badge>
        </div>

        {/* Task metadata */}
        <div className="mt-2 space-y-1">
          {task.due_date && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(task.due_date).toLocaleDateString()}
            </div>
          )}
          {task.status === "in_review" && task.completed_by_name && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              Submitted by: {task.completed_by_name}
            </div>
          )}
          {(task.status === "complete" || task.status === "rejected") &&
            task.reviewed_by_name && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                Reviewed by: {task.reviewed_by_name}
              </div>
            )}
          {task.rejection_reason && (
            <div className="bg-red-500/10 rounded p-2 mt-2 text-xs">
              <strong>Rejection:</strong> {task.rejection_reason}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 mt-3 pt-2 border-t">
          {task.status === "in_review" && (
            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px] flex-1"
              onClick={() => handleOpenReview(task)}>
              <Clock className="h-4 w-4 mr-1" />
              Review
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="min-h-[44px] min-w-[44px]"
            onClick={() => handleOpenEdit(task)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="min-h-[44px] min-w-[44px]"
            onClick={() => handleDelete(task.id)}
            disabled={deletingId === task.id}>
            {deletingId === task.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 text-destructive" />
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            Build Tasks
          </CardTitle>
          {inReviewCount > 0 && (
            <Badge className="bg-amber-500/20 text-amber-500">
              {inReviewCount} pending review
            </Badge>
          )}
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="min-h-[44px]"
              onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTask ? "Edit Task" : "Create Task"}
              </DialogTitle>
              <DialogDescription>
                {editingTask
                  ? "Update the task details below."
                  : "Create a new task and assign it to a group."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="task_name">Task Name *</Label>
                <Input
                  id="task_name"
                  value={formData.task_name}
                  onChange={(e) =>
                    setFormData({ ...formData, task_name: e.target.value })
                  }
                  placeholder="e.g., Build drivetrain prototype"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Detailed description..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="group_id">Assign to Group *</Label>
                <Select
                  value={formData.group_id}
                  onValueChange={(v) =>
                    setFormData({ ...formData, group_id: v })
                  }>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue placeholder="Select a group..." />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.group_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Due Date (optional)</Label>
                <DateTimePicker
                  value={formData.due_date}
                  onChange={(date) =>
                    setFormData({ ...formData, due_date: date })
                  }
                  placeholder="Select due date..."
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                className="min-h-[44px]"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                className="min-h-[44px]"
                onClick={handleSubmit}
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : editingTask ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No tasks created yet.
          </div>
        ) : isMobile ? (
          /* Mobile: Collapsible Accordions */
          <Accordion
            type="multiple"
            defaultValue={sortedGroups.map((g) => g.id.toString())}
            className="space-y-2">
            {tasksByGroup.map(({ group, tasks: groupTasks }) => (
              <AccordionItem
                key={group.id}
                value={group.id.toString()}
                className="border rounded-lg px-3">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{group.group_name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {groupTasks.length}
                    </Badge>
                    {groupTasks.filter((t) => t.status === "in_review").length >
                      0 && (
                      <Badge className="bg-amber-500/20 text-amber-500 text-xs">
                        {
                          groupTasks.filter((t) => t.status === "in_review")
                            .length
                        }{" "}
                        review
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {groupTasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      No tasks
                    </p>
                  ) : (
                    <div className="space-y-2 pb-2">
                      {groupTasks.map(renderTaskCard)}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          /* Desktop: Horizontal Scrollable Kanban Columns */
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4 min-w-max">
              {tasksByGroup.map(({ group, tasks: groupTasks }) => (
                <div
                  key={group.id}
                  className="w-[300px] flex-shrink-0 border rounded-lg bg-muted/30">
                  <div className="p-3 border-b bg-muted/50 rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {group.group_name}
                      </span>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {groupTasks.length}
                        </Badge>
                        {groupTasks.filter((t) => t.status === "in_review")
                          .length > 0 && (
                          <Badge className="bg-amber-500/20 text-amber-500 text-xs">
                            {
                              groupTasks.filter((t) => t.status === "in_review")
                                .length
                            }
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <ScrollArea className="h-[400px]">
                    <div className="p-2 space-y-2">
                      {groupTasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No tasks
                        </p>
                      ) : (
                        groupTasks.map(renderTaskCard)
                      )}
                    </div>
                  </ScrollArea>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Pending Reviews Section */}
        {inReviewTasks.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Pending Reviews ({inReviewTasks.length})
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {inReviewTasks.map((task) => (
                <div
                  key={task.id}
                  className="border rounded-lg p-3 bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer"
                  onClick={() => handleOpenReview(task)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm line-clamp-1">
                        {task.task_name}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getGroupName(task.assigned_group_id)}
                      </p>
                      {task.completed_by_name && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <User className="h-3 w-3" />
                          {task.completed_by_name}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="min-h-[36px]">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Review Task Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Task</DialogTitle>
            <DialogDescription>
              Review this task submission and approve or reject it.
            </DialogDescription>
          </DialogHeader>

          {reviewingTask && (
            <div className="space-y-4 py-4">
              <div>
                <h4 className="font-medium">{reviewingTask.task_name}</h4>
                {reviewingTask.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {reviewingTask.description}
                  </p>
                )}
              </div>

              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Group:</span>
                  <span>{getGroupName(reviewingTask.assigned_group_id)}</span>
                </div>
                {reviewingTask.completed_by_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Submitted by:</span>
                    <span>{reviewingTask.completed_by_name}</span>
                  </div>
                )}
                {reviewingTask.due_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Due:</span>
                    <span>
                      {new Date(reviewingTask.due_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rejection_reason">
                  Rejection Reason (required if rejecting)
                </Label>
                <Textarea
                  id="rejection_reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this task is being rejected..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="min-h-[44px]"
              onClick={() => setReviewDialogOpen(false)}
              disabled={isReviewing}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="min-h-[44px]"
              onClick={() => handleReviewSubmit("rejected")}
              disabled={isReviewing || !rejectionReason.trim()}>
              {isReviewing ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-1" />
              )}
              Reject
            </Button>
            <Button
              className="min-h-[44px]"
              onClick={() => handleReviewSubmit("complete")}
              disabled={isReviewing}>
              {isReviewing ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-1" />
              )}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
