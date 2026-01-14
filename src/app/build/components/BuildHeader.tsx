"use client";

import Link from "next/link";
import { Hammer, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

type BuildHeaderProps = {
  canManage: boolean;
};

export function BuildHeader({ canManage }: BuildHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Hammer className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Build Hours</h1>
          <p className="text-sm text-muted-foreground">
            Track your build session hours
          </p>
        </div>
      </div>

      {canManage && (
        <Link href="/build/manage">
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Manage
          </Button>
        </Link>
      )}
    </div>
  );
}
