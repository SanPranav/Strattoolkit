"use client";

import { useCallback, useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/useUser";

function getInitials(name: string) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(
    0
  )}`.toUpperCase();
}

export function ProfileSettings() {
  const [formData, setFormData] = useState({
    name: "Optix Member",
    email: ""
  });

  const { user, isLoading } = useUser();

  const handleReset = useCallback(() => {
    if (!isLoading && user) {
      setFormData({
        name: user.user_name ?? "Unknown",
        email: user.email ?? ""
      });
      return;
    }

    setFormData({
      name: "Unknown",
      email: ""
    });
  }, [isLoading, user]);

  useEffect(() => {
    handleReset();
  }, [handleReset]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // UI-only for now – this is where an API call would go.
    // eslint-disable-next-line no-console
    console.log("Profile settings submitted", { user });
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/60 p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border">
              <AvatarImage
                src={user ? user?.user_metadata?.avatar_url : undefined}
                alt="User Avatar"
              />
              <AvatarFallback>{getInitials(formData.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold leading-none">
                {user?.user_name ?? "Unknown"}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                This information will be visible to your team in the toolkit.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" type="button">
            Change avatar
          </Button>
        </div>
      </Card>

      <Card className="border-border/70 bg-card/60 p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(event) =>
                  setFormData({ ...formData, name: event.target.value })
                }
                autoComplete="name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData({ ...formData, email: event.target.value })
                }
                autoComplete="email"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={user?.role ?? "Unknown"} disabled />
            </div>
          </div>

          <Separator />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-xs sm:text-sm">
              Changes are only stored in your browser for now. We&apos;ll wire
              this to your real account data later.
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
