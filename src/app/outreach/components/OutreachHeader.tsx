"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

type OutreachHeaderProps = {
  canManage: boolean;
};

export function OutreachHeader({ canManage }: OutreachHeaderProps) {
  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 py-2">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Users className="h-5 w-5 md:h-6 md:w-6" />
          <h1 className="text-2xl md:text-3xl font-bold truncate">
            Outreach Dashboard
          </h1>
        </div>
        <p className="text-muted-foreground text-sm truncate">
          {canManage ? "Manage and view user outreach data" : "View outreach data"}
        </p>
      </div>

      {canManage && (
        <Button variant="outline" size="sm" asChild>
          <Link href="/outreach/manage">Manage Events</Link>
        </Button>
      )}
    </div>
  );
}

