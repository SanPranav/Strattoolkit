"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronsUpDown, Pencil, Plus, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import Loader from "@/components/Loader";
import {
  createRBACRule,
  deleteRBACRule,
  fetchAllRBACRules,
  updateRBACRule
} from "@/lib/rbac/rbac";
import {
  Actions,
  Conditions,
  Resources,
  type Action,
  type Condition,
  type RBACRule,
  type RBACRuleInsert,
  type RBACRuleUpdate,
  type Resource,
  type UserRole
} from "@/lib/types/rbac";

const ROLE_OPTIONS: UserRole[] = ["admin", "member", "guest"];
const RESOURCE_OPTIONS = Resources;
const ACTION_OPTIONS = Actions;
const CONDITION_OPTIONS = Conditions;

const DEFAULT_RULE: RuleFormValues = {
  user_role: "member",
  resource: "activity_events",
  action: "view",
  condition: null
};

type RuleFormValues = {
  user_role: UserRole;
  resource: Resource;
  action: Action;
  condition: Condition;
};

function toFormValues(rule: RBACRule | null): RuleFormValues {
  if (!rule) return DEFAULT_RULE;
  return {
    user_role: rule.user_role as UserRole,
    resource: rule.resource as Resource,
    action: rule.action as Action,
    condition: (rule.condition as Condition) ?? null
  };
}

function capitalize(str: string | null): string {
  if (!str) return "None";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function ConditionLabel({ condition }: { condition: Condition }) {
  if (condition === null) {
    return <span className="text-muted-foreground">—</span>;
  }
  return <span className="capitalize">{condition}</span>;
}

type AutocompleteProps<T extends string | null> = {
  label: string;
  placeholder?: string;
  value: T;
  options: readonly { label: string; value: T }[];
  onChange: (value: T) => void;
  disabled?: boolean;
};

function AutocompleteField<T extends string | null>({
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled
}: AutocompleteProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            className="w-full justify-between"
            disabled={disabled}>
            <span className="truncate">
              {selected ? selected.label : placeholder ?? "Select"}
            </span>
            <ChevronsUpDown className="h-4 w-4 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0" align="start">
          <Command>
            <CommandInput placeholder={placeholder ?? "Search..."} autoFocus />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={`${option.label}-${String(option.value)}`}
                    value={option.label}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}>
                    <span>{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

type RuleDialogProps = {
  mode: "create" | "edit";
  open: boolean;
  initialRule: RBACRule | null;
  onClose: () => void;
  onSubmit: (values: RuleFormValues) => Promise<void>;
  submitting: boolean;
};

function RuleDialog({
  mode,
  open,
  initialRule,
  onClose,
  onSubmit,
  submitting
}: RuleDialogProps) {
  const [values, setValues] = useState<RuleFormValues>(() =>
    toFormValues(initialRule)
  );

  useEffect(() => {
    if (open) {
      setValues(toFormValues(initialRule));
    }
  }, [initialRule, open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(values);
  };

  const roleOptions = useMemo(
    () =>
      ROLE_OPTIONS.map((role) => ({ label: capitalize(role), value: role })),
    []
  );
  const resourceOptions = useMemo(
    () =>
      RESOURCE_OPTIONS.map((resource) => ({
        label: capitalize(resource),
        value: resource
      })),
    []
  );
  const actionOptions = useMemo(
    () =>
      ACTION_OPTIONS.map((action) => ({
        label: capitalize(action),
        value: action
      })),
    []
  );
  const conditionOptions = useMemo(
    () =>
      CONDITION_OPTIONS.map((condition) => ({
        label: capitalize(condition),
        value: condition
      })),
    []
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (submitting) return;
        if (!nextOpen) onClose();
      }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add rule" : "Edit rule"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new RBAC rule."
              : "Update this RBAC rule."}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <AutocompleteField<UserRole>
            label="Role"
            value={values.user_role}
            onChange={(value) =>
              setValues((prev) => ({ ...prev, user_role: value }))
            }
            options={roleOptions}
          />
          <AutocompleteField<Resource>
            label="Resource"
            value={values.resource}
            onChange={(value) =>
              setValues((prev) => ({ ...prev, resource: value }))
            }
            options={resourceOptions}
          />
          <AutocompleteField<Action>
            label="Action"
            value={values.action}
            onChange={(value) =>
              setValues((prev) => ({ ...prev, action: value }))
            }
            options={actionOptions}
          />
          <AutocompleteField<Condition>
            label="Condition"
            value={values.condition}
            onChange={(value) =>
              setValues((prev) => ({ ...prev, condition: value }))
            }
            options={conditionOptions}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type DeleteDialogProps = {
  open: boolean;
  rule?: RBACRule;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  submitting: boolean;
};

function DeleteDialog({
  open,
  rule,
  onConfirm,
  onClose,
  submitting
}: DeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (submitting) return;
        if (!nextOpen) onClose();
      }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete rule</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will remove the rule permanently.
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm">
          {rule && (
            <p>
              <strong>Role:</strong> {rule.user_role} ·{" "}
              <strong>Resource:</strong> {rule.resource} ·{" "}
              <strong>Action:</strong> {rule.action} ·{" "}
              <strong>Condition:</strong> {rule.condition ?? "None"}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={submitting}>
            {submitting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type RuleCardProps = {
  rule: RBACRule;
  isDragging: boolean;
  canEdit: boolean;
  onDragStart: (id: number) => void;
  onDragEnd: () => void;
  onEdit: (rule: RBACRule) => void;
  onDelete: (rule: RBACRule) => void;
};

function RuleCard({
  rule,
  isDragging,
  canEdit,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete
}: RuleCardProps) {
  return (
    <Card
      className="border-border/70 bg-card/80 p-3 space-y-2 shadow-sm cursor-grab active:cursor-grabbing"
      draggable={canEdit}
      onDragStart={(event) => {
        event.dataTransfer.setData("rbac-rule-id", String(rule.id));
        onDragStart(rule.id);
      }}
      onDragEnd={onDragEnd}>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-sm font-semibold capitalize">
            {rule.resource} · {rule.action}
          </p>
          <p className="text-xs text-muted-foreground">
            Condition:{" "}
            <ConditionLabel condition={(rule.condition as Condition) ?? null} />
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(rule)}
            disabled={!canEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(rule)}
            disabled={!canEdit}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {isDragging && (
        <p className="text-[10px] text-muted-foreground">
          Drag to move to another role
        </p>
      )}
    </Card>
  );
}

type RoleColumnProps = {
  role: UserRole;
  rules: RBACRule[];
  draggingId: number | null;
  canEdit: boolean;
  onDragStart: (id: number) => void;
  onDragEnd: () => void;
  onDrop: (id: number) => void;
  onEdit: (rule: RBACRule) => void;
  onDelete: (rule: RBACRule) => void;
};

function RoleColumn({
  role,
  rules,
  draggingId,
  canEdit,
  onDragStart,
  onDragEnd,
  onDrop,
  onEdit,
  onDelete
}: RoleColumnProps) {
  return (
    <Card
      className="border-border/70 bg-card/50 p-4 flex flex-col gap-3"
      onDragOver={(event) => {
        if (!canEdit) return;
        event.preventDefault();
      }}
      onDrop={(event) => {
        if (!canEdit) return;
        event.preventDefault();
        const id = Number(event.dataTransfer.getData("rbac-rule-id"));
        if (!isNaN(id)) onDrop(id);
      }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Role
          </p>
          <p className="text-lg font-semibold capitalize">{role}</p>
        </div>
        <Badge variant="secondary">{rules.length} rules</Badge>
      </div>

      <div className="flex flex-col gap-2">
        {rules.map((rule) => (
          <RuleCard
            key={rule.id}
            rule={rule}
            isDragging={draggingId === rule.id}
            canEdit={canEdit}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        {rules.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No rules for this role.
          </p>
        )}
      </div>
    </Card>
  );
}

type RbacRulesPanelProps = {
  canEdit: boolean;
};

export function RBACRulesPanel({ canEdit }: RbacRulesPanelProps) {
  const queryClient = useQueryClient();
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [selectedRule, setSelectedRule] = useState<RBACRule | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);

  const { data: rules, isLoading } = useQuery({
    queryKey: ["rbac", "rules"],
    queryFn: fetchAllRBACRules
  });

  const createMutation = useMutation({
    mutationFn: async (values: RBACRuleInsert) => {
      const [error] = await createRBACRule(values);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      toast.success("Rule created");
      await queryClient.invalidateQueries({ queryKey: ["rbac", "rules"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create rule");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      values
    }: {
      id: number;
      values: RBACRuleUpdate;
    }) => {
      const [error] = await updateRBACRule(id, values);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      toast.success("Rule updated");
      await queryClient.invalidateQueries({ queryKey: ["rbac", "rules"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update rule");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const [error] = await deleteRBACRule(id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      toast.success("Rule deleted");
      await queryClient.invalidateQueries({ queryKey: ["rbac", "rules"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete rule");
    }
  });

  const closeDialog = useCallback(() => {
    setDialogMode(null);
    setSelectedRule(null);
  }, []);

  const openCreate = useCallback(() => {
    setSelectedRule(null);
    setDialogMode("create");
  }, []);

  const openEdit = useCallback((rule: RBACRule) => {
    setSelectedRule(rule);
    setDialogMode("edit");
  }, []);

  const openDeleteConfirm = useCallback((rule: RBACRule) => {
    setSelectedRule(rule);
    setShowDelete(true);
  }, []);

  const handleSubmit = async (values: RuleFormValues) => {
    if (dialogMode === "create") {
      await createMutation.mutateAsync(values as RBACRuleInsert);
    } else if (dialogMode === "edit" && selectedRule) {
      await updateMutation.mutateAsync({ id: selectedRule.id, values });
    }
    closeDialog();
  };

  const handleDelete = async () => {
    if (!selectedRule) return;
    await deleteMutation.mutateAsync(selectedRule.id);
    setShowDelete(false);
    setSelectedRule(null);
  };

  const handleMove = async (rule: RBACRule, targetRole: UserRole) => {
    if (!canEdit || rule.user_role === targetRole) return;
    setDraggingId(rule.id);
    try {
      await updateMutation.mutateAsync({
        id: rule.id,
        values: { user_role: targetRole }
      });
    } finally {
      setDraggingId(null);
    }
  };

  const totalRulesCount = useMemo(() => {
    if (!rules) return 0;
    return Object.values(rules).reduce(
      (sum, roleRules) => sum + (roleRules?.length ?? 0),
      0
    );
  }, [rules]);

  const getRulesForRole = useCallback(
    (role: UserRole): RBACRule[] => {
      return rules?.[role] ?? [];
    },
    [rules]
  );

  const getRuleById = useCallback(
    (id: number): RBACRule | null => {
      if (!rules) return null;
      for (const role of ROLE_OPTIONS) {
        const found = rules[role]?.find((rule) => rule.id === id);
        if (found) return found;
      }
      return null;
    },
    [rules]
  );

  return (
    <Card className="border-border/70 bg-card/60 p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">RBAC Rules</h2>
          <p className="text-muted-foreground text-sm">
            Move rules between roles or manage rule definitions.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!canEdit}>
          <Plus className="mr-2 h-4 w-4" /> Add rule
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader />
        </div>
      ) : totalRulesCount > 0 ? (
        <div className="grid gap-3 md:grid-cols-3">
          {ROLE_OPTIONS.map((role) => (
            <RoleColumn
              key={role}
              role={role}
              rules={getRulesForRole(role)}
              draggingId={draggingId}
              canEdit={canEdit}
              onDragStart={setDraggingId}
              onDragEnd={() => setDraggingId(null)}
              onDrop={(id) => {
                const droppedRule = getRuleById(id);
                if (droppedRule) handleMove(droppedRule, role);
              }}
              onEdit={openEdit}
              onDelete={openDeleteConfirm}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-32 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          <p>No RBAC rules found.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={openCreate}
            disabled={!canEdit}>
            Add your first rule
          </Button>
        </div>
      )}

      <RuleDialog
        mode={dialogMode === "create" ? "create" : "edit"}
        open={Boolean(dialogMode)}
        initialRule={dialogMode === "edit" ? selectedRule : null}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteDialog
        open={showDelete}
        rule={selectedRule ?? undefined}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setShowDelete(false);
            setSelectedRule(null);
          }
        }}
        onConfirm={handleDelete}
        submitting={deleteMutation.isPending}
      />
    </Card>
  );
}
