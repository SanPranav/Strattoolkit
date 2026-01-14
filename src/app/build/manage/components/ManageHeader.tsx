"use client";

import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ManageHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-3">
        <Link href="/build">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Manage Build</h1>
          <p className="text-sm text-muted-foreground">
            Manage events, locations, groups, and tasks
          </p>
        </div>
      </div>
    </div>
  );
}
