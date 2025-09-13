import { ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { formatMinutes } from "@/lib/utils";
import { manualModifyOutreachHours } from "@/lib/db/hours";

import { BaseStates } from "@/lib/states";
import { UserData } from "@/lib/types/pocketbase";

import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";
import { Edit2 } from "lucide-react";

export default function EditUserDialog({
  userData,
  refreshFunc
}: {
  userData: UserData;
  refreshFunc?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newMinutes, setNewMinutes] = useState(userData.outreachMinutes);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const deltaMinutes = newMinutes - userData.outreachMinutes;

    console.log(userData);

    const state = await manualModifyOutreachHours(
      userData.expand?.user.id || "",
      deltaMinutes
    );

    switch (state) {
      case BaseStates.SUCCESS:
        toast.success(
          `${userData.expand?.user.name} now has ${formatMinutes(newMinutes)}`
        );
        setOpen(false);
        refreshFunc?.();
        break;

      case BaseStates.ERROR:
      default:
        toast.error(`Failed to update ${userData.expand?.user.name}'s hours`);
        break;
    }

    setLoading(false);
  };

  const onTimeInputChange = function (e: ChangeEvent<HTMLInputElement>) {
    setNewMinutes((curr) => {
      if (e.target.value === "") return 0;
      return parseInt(e.target.value) || curr;
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User Data</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            {/** display current user formatted hours */}
            <p className="text-xl">Current Logged Time:</p>
            <p className="g text-xl text-muted-foreground">
              {formatMinutes(userData.outreachMinutes)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="outreachMinutes">Outreach Minutes</Label>
            <Input
              id="outreachMinutes"
              type="number"
              value={newMinutes}
              onChange={onTimeInputChange}
            />
            <p className="g text-sm text-muted-foreground">
              New: {formatMinutes(newMinutes)}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
