"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
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
  Users,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  UserPlus,
  UserMinus,
  ChevronsUpDown,
  ArrowRight,
  GripVertical
} from "lucide-react";
import {
  createBuildGroup,
  updateBuildGroup,
  deleteBuildGroup,
  fetchGroupUsers,
  updateUserBuildGroup
} from "@/lib/db/build";
import { BUILD, USER } from "@/lib/types/queryKeys";
import type { BuildGroup, UserData } from "@/lib/types/db";
import { getAllUsers } from "@/lib/db/server";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type GroupsTabProps = {
  groups: BuildGroup[];
  isLoading: boolean;
  onRefresh: () => void;
};

type GroupFormData = {
  group_name: string;
  description: string;
};

const defaultFormData: GroupFormData = {
  group_name: "",
  description: ""
};

export function GroupsTab({ groups, isLoading, onRefresh }: GroupsTabProps) {
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<BuildGroup | null>(null);
  const [formData, setFormData] = useState<GroupFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // User management states
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [selectedGroupForAdd, setSelectedGroupForAdd] =
    useState<BuildGroup | null>(null);
  const [userSelectOpen, setUserSelectOpen] = useState(false);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);

  // Drag state
  const [draggedUser, setDraggedUser] = useState<UserData | null>(
    null
  );
  const [dragOverGroupId, setDragOverGroupId] = useState<number | null>(null);

  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "remove" | "move";
    user: UserData | null;
    sourceGroupId?: number | null;
    targetGroupId?: number | null;
  }>({ open: false, type: "remove", user: null });
  const [isConfirming, setIsConfirming] = useState(false);

  // Fetch all users with their group info
  const {
    data: allUsers,
    refetch: refetchUsers,
    isLoading: isUsersLoading
  } = useQuery({
    queryKey: USER.ALL_USERS,
    queryFn: async () => {
      const [error, users] = await getAllUsers();
      if (error) throw new Error(error);
      return users;
    }
  });

  // Sort groups alphabetically
  const sortedGroups = [...groups].sort((a, b) =>
    a.group_name.localeCompare(b.group_name)
  );

  // Group users by their build_group
  const usersByGroup = sortedGroups.map((group) => ({
    group,
    users: (allUsers || []).filter((u) => u.build_group === group.id)
  }));

  // Users without a group
  const unassignedUsers = (allUsers || []).filter((u) => u.build_group === null);

  const handleOpenCreate = () => {
    setEditingGroup(null);
    setFormData(defaultFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (group: BuildGroup) => {
    setEditingGroup(group);
    setFormData({
      group_name: group.group_name,
      description: group.description || ""
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.group_name) {
      toast.error("Please enter a group name");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      group_name: formData.group_name,
      description: formData.description || null
    };

    if (editingGroup) {
      const [error] = await updateBuildGroup(editingGroup.id, payload);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Group updated");
        setIsDialogOpen(false);
        onRefresh();
      }
    } else {
      const [error] = await createBuildGroup(payload);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Group created");
        setIsDialogOpen(false);
        onRefresh();
      }
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (groupId: number) => {
    setDeletingId(groupId);

    const [error] = await deleteBuildGroup(groupId);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Group deleted");
      onRefresh();
      refetchUsers();
    }

    setDeletingId(null);
  };

  const handleOpenAddUser = (group: BuildGroup) => {
    setSelectedGroupForAdd(group);
    setAddUserDialogOpen(true);
  };

  const handleAddUser = async (user: UserData) => {
    if (!selectedGroupForAdd) return;

    // If user is already in another group, show move confirmation
    if (user.build_group !== null) {
      setConfirmDialog({
        open: true,
        type: "move",
        user,
        sourceGroupId: user.build_group,
        targetGroupId: selectedGroupForAdd.id
      });
      setUserSelectOpen(false);
      setAddUserDialogOpen(false);
      return;
    }

    setAddingUserId(user.user_id);

    const [error] = await updateUserBuildGroup(
      user.user_id,
      selectedGroupForAdd.id
    );

    if (error) {
      toast.error(error);
    } else {
      toast.success(`${user.user_name || "User"} added to group`);
      refetchUsers();
    }

    setAddingUserId(null);
    setUserSelectOpen(false);
  };

  const handleRemoveUser = (user: UserData) => {
    setConfirmDialog({
      open: true,
      type: "remove",
      user,
      sourceGroupId: user.build_group
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.user) return;

    setIsConfirming(true);

    if (confirmDialog.type === "remove") {
      const [error] = await updateUserBuildGroup(
        confirmDialog.user.user_id,
        null
      );

      if (error) {
        toast.error(error);
      } else {
        toast.success(
          `${confirmDialog.user.user_name || "User"} removed from group`
        );
        refetchUsers();
      }
    } else if (confirmDialog.type === "move" && confirmDialog.targetGroupId) {
      const [error] = await updateUserBuildGroup(
        confirmDialog.user.user_id,
        confirmDialog.targetGroupId
      );

      if (error) {
        toast.error(error);
      } else {
        const targetGroup = groups.find(
          (g) => g.id === confirmDialog.targetGroupId
        );
        toast.success(
          `${confirmDialog.user.user_name || "User"} moved to ${
            targetGroup?.group_name || "group"
          }`
        );
        refetchUsers();
      }
    }

    setIsConfirming(false);
    setConfirmDialog({ open: false, type: "remove", user: null });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, user: UserData) => {
    setDraggedUser(user);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, groupId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverGroupId(groupId);
  };

  const handleDragLeave = () => {
    setDragOverGroupId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetGroupId: number) => {
    e.preventDefault();
    setDragOverGroupId(null);

    if (!draggedUser || draggedUser.build_group === targetGroupId) {
      setDraggedUser(null);
      return;
    }

    // Show confirmation for move
    setConfirmDialog({
      open: true,
      type: "move",
      user: draggedUser,
      sourceGroupId: draggedUser.build_group,
      targetGroupId
    });

    setDraggedUser(null);
  };

  const handleDragEnd = () => {
    setDraggedUser(null);
    setDragOverGroupId(null);
  };

  const getSourceGroupName = (groupId: number | null) => {
    if (groupId === null) return "Unassigned";
    return groups.find((g) => g.id === groupId)?.group_name || "Unknown";
  };

  // Users available to add (not in the selected group)
  const availableUsers =
    allUsers?.filter((user) => user.build_group !== selectedGroupForAdd?.id) ||
    [];

  const renderUserCard = (
    user: UserData,
    groupId: number | null,
    draggable = true
  ) => (
    <div
      key={user.user_id}
      draggable={draggable}
      onDragStart={(e) => handleDragStart(e, user)}
      onDragEnd={handleDragEnd}
      className={cn(
        "flex items-center justify-between p-2 rounded-md bg-muted/50 cursor-move min-h-[44px]",
        draggedUser?.user_id === user.user_id && "opacity-50"
      )}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {draggable && <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
        <span className="text-sm truncate">{user.user_name || "Unknown"}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="min-h-[44px] min-w-[44px] flex-shrink-0"
        onClick={() => handleRemoveUser(user)}>
        <UserMinus className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );

  const renderGroupCard = (group: BuildGroup, users: UserData[]) => (
    <div
      key={group.id}
      className={cn(
        "w-[280px] flex-shrink-0 border rounded-lg transition-colors",
        dragOverGroupId === group.id && "border-primary bg-primary/5"
      )}
      onDragOver={(e) => handleDragOver(e, group.id)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, group.id)}>
      <div className="p-3 border-b bg-muted/50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{group.group_name}</span>
            <Badge variant="secondary" className="text-xs">
              {users.length}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleOpenAddUser(group)}>
              <UserPlus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleOpenEdit(group)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleDelete(group.id)}
              disabled={deletingId === group.id}>
              {deletingId === group.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 text-destructive" />
              )}
            </Button>
          </div>
        </div>
        {group.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {group.description}
          </p>
        )}
      </div>
      <ScrollArea className="h-[300px]">
        <div className="p-2 space-y-2">
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No members
            </p>
          ) : (
            users.map((user) => renderUserCard(user, group.id))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Users className="h-4 w-4" />
          Build Groups
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="min-h-[44px]"
              onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-1" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingGroup ? "Edit Group" : "Create Group"}
              </DialogTitle>
              <DialogDescription>
                {editingGroup
                  ? "Update the group details below."
                  : "Create a new group. Tasks can be assigned to groups."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="group_name">Group Name *</Label>
                <Input
                  id="group_name"
                  value={formData.group_name}
                  onChange={(e) =>
                    setFormData({ ...formData, group_name: e.target.value })
                  }
                  placeholder="e.g., Mechanical Team"
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
                  placeholder="Optional description..."
                  rows={3}
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
                ) : editingGroup ? (
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
        {isLoading || isUsersLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No groups created yet. Create one to assign tasks.
          </div>
        ) : isMobile ? (
          /* Mobile: Collapsible Accordions */
          <Accordion
            type="multiple"
            defaultValue={sortedGroups.map((g) => g.id.toString())}
            className="space-y-2">
            {usersByGroup.map(({ group, users }) => (
              <AccordionItem
                key={group.id}
                value={group.id.toString()}
                className="border rounded-lg px-3">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-medium">{group.group_name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {users.length} members
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pb-2 space-y-2">
                    {group.description && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {group.description}
                      </p>
                    )}
                    <div className="flex gap-2 mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[44px] flex-1"
                        onClick={() => handleOpenAddUser(group)}>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add Member
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[44px]"
                        onClick={() => handleOpenEdit(group)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[44px]"
                        onClick={() => handleDelete(group.id)}
                        disabled={deletingId === group.id}>
                        {deletingId === group.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                    {users.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">
                        No members
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {users.map((user) => renderUserCard(user, group.id, false))}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          /* Desktop: Horizontal Scrollable Kanban Columns */
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4 min-w-max">
              {usersByGroup.map(({ group, users }) =>
                renderGroupCard(group, users)
              )}
            </div>
          </ScrollArea>
        )}

        {/* Unassigned users section */}
        {unassignedUsers.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Unassigned Members ({unassignedUsers.length})
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {unassignedUsers.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <span className="text-sm">{user.user_name || "Unknown"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Add User Dialog */}
      <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Member to {selectedGroupForAdd?.group_name}</DialogTitle>
            <DialogDescription>
              Select a user to add to this group
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Popover open={userSelectOpen} onOpenChange={setUserSelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between min-h-[44px]"
                  disabled={addingUserId !== null}>
                  <span className="truncate text-muted-foreground">
                    Select a user to add...
                  </span>
                  <ChevronsUpDown className="h-4 w-4 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search users..." autoFocus />
                  <CommandList>
                    <CommandEmpty>No users found.</CommandEmpty>
                    <CommandGroup>
                      {availableUsers.map((user) => (
                        <CommandItem
                          key={user.user_id}
                          value={user.user_name || user.user_id}
                          onSelect={() => handleAddUser(user)}
                          className="flex items-center justify-between min-h-[44px]">
                          <span>{user.user_name || "Unknown"}</span>
                          {user.build_group !== null && (
                            <span className="text-xs text-muted-foreground">
                              ({getSourceGroupName(user.build_group)})
                            </span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="min-h-[44px]"
              onClick={() => setAddUserDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open)
            setConfirmDialog({ open: false, type: "remove", user: null });
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.type === "remove"
                ? "Remove from Group"
                : "Move to Different Group"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.type === "remove" ? (
                <>
                  Are you sure you want to remove{" "}
                  <strong>
                    {confirmDialog.user?.user_name || "this user"}
                  </strong>{" "}
                  from{" "}
                  <strong>
                    {getSourceGroupName(confirmDialog.sourceGroupId ?? null)}
                  </strong>
                  ?
                </>
              ) : (
                <>
                  <strong>
                    {confirmDialog.user?.user_name || "This user"}
                  </strong>{" "}
                  is currently in{" "}
                  <strong>
                    {getSourceGroupName(confirmDialog.sourceGroupId ?? null)}
                  </strong>
                  .
                  <div className="flex items-center gap-2 mt-2 text-foreground">
                    <span>
                      {getSourceGroupName(confirmDialog.sourceGroupId ?? null)}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                    <span>
                      {
                        groups.find((g) => g.id === confirmDialog.targetGroupId)
                          ?.group_name
                      }
                    </span>
                  </div>
                  <p className="mt-2">
                    Do you want to move them to the new group?
                  </p>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="min-h-[44px]"
              onClick={() =>
                setConfirmDialog({ open: false, type: "remove", user: null })
              }
              disabled={isConfirming}>
              Cancel
            </Button>
            <Button
              variant={
                confirmDialog.type === "remove" ? "destructive" : "default"
              }
              className="min-h-[44px]"
              onClick={handleConfirmAction}
              disabled={isConfirming}>
              {isConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  {confirmDialog.type === "remove"
                    ? "Removing..."
                    : "Moving..."}
                </>
              ) : confirmDialog.type === "remove" ? (
                "Remove"
              ) : (
                "Move"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
