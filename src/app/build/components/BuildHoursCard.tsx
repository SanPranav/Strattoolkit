"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, Hammer } from "lucide-react";
import { formatMinutes } from "@/lib/utils";
import type { FullUserData, ActivitySummary } from "@/lib/types/db";

type BuildHoursCardProps = {
  userData: FullUserData | null;
  buildSummary: ActivitySummary | null;
};

export function BuildHoursCard({
  userData,
  buildSummary
}: BuildHoursCardProps) {
  const totalMinutes = buildSummary?.user_credited_minutes ?? 0;
  const sessionCount = buildSummary?.session_count ?? 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <Avatar className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0">
              <AvatarImage
                src={userData?.avatar_url ?? ""}
                alt={userData?.user_name || "Unknown User"}
                className="rounded-full object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-orange-600 to-amber-600 text-white text-sm font-semibold rounded-full flex items-center justify-center h-full w-full">
                {userData?.user_name?.charAt(0).toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base md:text-lg truncate">
              {userData?.user_name || "Unknown User"}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {userData?.email || "No Email"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {userData ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Build Hours
              </span>
              <Hammer className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-2xl md:text-3xl font-bold">
                  {formatMinutes(totalMinutes)}
                </div>
              </div>
              <Badge className="bg-orange-500/20 text-orange-500 text-xs md:text-sm px-2 md:px-3 py-1">
                {sessionCount} {sessionCount === 1 ? "session" : "sessions"}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {totalMinutes > 0
                  ? `Average ${formatMinutes(
                      Math.round(totalMinutes / Math.max(sessionCount, 1))
                    )} per session`
                  : "No sessions logged yet"}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            Please log in to view your build hours
          </div>
        )}
      </CardContent>
    </Card>
  );
}
