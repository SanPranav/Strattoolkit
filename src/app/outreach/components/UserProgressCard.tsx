"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { formatMinutes, getBadgeStatusStyles } from "@/lib/utils";
import type { FullUserData } from "@/lib/types/db";

export function UserProgressCard({
  userData,
  outreachMinutesThreshold
}: {
  userData: FullUserData | null;
  outreachMinutesThreshold: number;
}) {
  const currentMinutes = userData?.minutes ?? 0;
  const totalRawMinutes = userData?.user_credited_minutes ?? 0;
  const progressPercent = outreachMinutesThreshold
    ? Math.min(
        1000,
        Math.round((currentMinutes / outreachMinutesThreshold) * 100)
      )
    : 0;
  const minutesRemaining = Math.max(
    0,
    outreachMinutesThreshold - currentMinutes
  );

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
              <AvatarFallback className="bg-gradient-to-br from-blue-800 to-purple-800 text-white text-sm font-semibold rounded-full flex items-center justify-center h-full w-full">
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
                Your Progress
              </span>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-2xl md:text-3xl font-bold">
                  {formatMinutes(currentMinutes)}
                </div>
              </div>
              <Badge
                className={`${getBadgeStatusStyles(
                  currentMinutes,
                  outreachMinutesThreshold,
                  outreachMinutesThreshold - 60 * 3
                )} text-xs md:text-sm px-2 md:px-3 py-1`}>
                {currentMinutes >= outreachMinutesThreshold
                  ? "Complete"
                  : "In Progress"}
              </Badge>
            </div>

            {typeof totalRawMinutes === "number" && (
              <div className="text-xs text-muted-foreground">
                Raw Minutes Logged: {formatMinutes(totalRawMinutes)}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, progressPercent)}%`
                  }}></div>
              </div>
              <div className="text-xs text-muted-foreground">
                {outreachMinutesThreshold > 0 ? (
                  <>{formatMinutes(minutesRemaining)} remaining</>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No outreach data yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
