"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { listUserData } from "@/lib/db/user";
import { useNavbar } from "@/hooks/useNavbar";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useIsMobile } from "@/hooks/use-mobile";
import { PBBrowser, recordToImageUrl } from "@/lib/pb";
import type { UserData, User, OutreachEvent } from "@/lib/types/pocketbase";
import { formatMinutes, getBadgeStatusStyles } from "@/lib/utils";
import { ErrorToString } from "@/lib/states";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import { OutreachTable } from "./OutreachTable";
import ActivityGraph from "./ActivityGraph";
import OutreachQuickManageCard from "@/app/outreach/OutreachQuickManageCard";

import { Users, Clock, TrendingUp, Calendar } from "lucide-react";

interface PaginatedResponse {
  items: UserData[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

type Props = {
  canManage?: boolean;
  userData: UserData;
  user: User;
  outreachMinutesCutoff: number;
  pageSize: number;
  initialUsers: PaginatedResponse | null;
  initialUsersError: string | null;
  quickManageEvents: OutreachEvent[];
  activityTimestamps: string[];
};

export default function OutreachPage({
  canManage = false,
  userData,
  user,
  outreachMinutesCutoff,
  pageSize,
  initialUsers,
  initialUsersError,
  quickManageEvents,
  activityTimestamps
}: Props) {
  const { setDefaultExpanded, setMobileNavbarSide } = useNavbar();
  const isHydrated = useIsHydrated();
  const isMobile = useIsMobile();

  const [pages, setPages] = useState<PaginatedResponse[]>(
    initialUsers ? [initialUsers] : []
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [listError, setListError] = useState<string | null>(
    initialUsersError
      ? ErrorToString[initialUsersError as keyof typeof ErrorToString] ??
          initialUsersError
      : null
  );

  const collectedUsers = useMemo(
    () => pages.flatMap((page) => page.items),
    [pages]
  );

  const totalItems = pages[0]?.totalItems ?? initialUsers?.totalItems ?? 0;
  const totalPages = pages[0]?.totalPages ?? initialUsers?.totalPages ?? 1;
  const hasMore =
    pages.length < totalPages && collectedUsers.length < totalItems;

  const bootstrapList = useCallback(async () => {
    setReloading(true);
    setListError(null);
    const [error, data] = await listUserData(
      1,
      pageSize,
      PBBrowser.getInstance()
    );

    if (error || !data) {
      const message = ErrorToString[error ?? "01x01"] ?? "PocketBase error";
      setListError(message);
      toast.error(`Failed to load outreach roster: ${message}`);
    } else {
      setPages([data]);
    }

    setReloading(false);
  }, [pageSize]);

  const loadNextPage = useCallback(async () => {
    if (!hasMore || loadingMore || !pages.length) return;
    const nextPage = pages.length + 1;
    setLoadingMore(true);
    const [error, data] = await listUserData(
      nextPage,
      pageSize,
      PBBrowser.getInstance()
    );

    if (error || !data) {
      const message = ErrorToString[error ?? "01x01"] ?? "PocketBase error";
      toast.error(`Failed to load page ${nextPage}: ${message}`);
    } else {
      setPages((prev) => [...prev, data]);
    }

    setLoadingMore(false);
  }, [hasMore, loadingMore, pages, pageSize]);

  const handleReload = useCallback(async () => {
    await bootstrapList();
  }, [bootstrapList]);

  useEffect(() => {
    setDefaultExpanded(false);
    setMobileNavbarSide("right");
  }, [setDefaultExpanded, setMobileNavbarSide]);

  useEffect(() => {
    if (isHydrated && !pages.length && !reloading && !initialUsers) {
      bootstrapList();
    }
  }, [bootstrapList, initialUsers, isHydrated, pages.length, reloading]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  const showInitialError = !reloading && !pages.length && listError;

  return (
    <div className="container mx-auto min-h-screen flex flex-col gap-4 px-3 sm:px-4 pt-3 pb-24">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 py-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-5 w-5 md:h-6 md:w-6" />
            <h1 className="text-2xl md:text-3xl font-bold truncate">
              Outreach Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground text-sm truncate">
            {canManage
              ? "Monitor progress and coordinate outreach events"
              : "Track outreach progress"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleReload()}
            disabled={reloading}>
            {reloading ? "Refreshing..." : "Refresh data"}
          </Button>
          {canManage && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/outreach/manage">Open Event Manager</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage
                  src={recordToImageUrl(user)?.toString()}
                  alt={user.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-800 to-purple-800 text-white text-sm font-semibold">
                  {user.name?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="font-semibold text-base md:text-lg truncate">
                  {userData.expand?.user?.name || "Unknown User"}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {userData.expand?.user?.email || "No email"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Your Progress
              </span>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-2xl md:text-3xl font-bold">
                  {formatMinutes(userData.outreachMinutes || 0)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Logged outreach time
                </div>
              </div>
              <Badge
                className={`${getBadgeStatusStyles(
                  userData.outreachMinutes || 0,
                  outreachMinutesCutoff,
                  outreachMinutesCutoff - 60 * 3
                )} text-xs md:text-sm px-2 md:px-3 py-1`}>
                {(userData.outreachMinutes || 0) >= outreachMinutesCutoff
                  ? "Complete"
                  : "In Progress"}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>
                  {Math.min(
                    100,
                    Math.round(
                      ((userData.outreachMinutes || 0) /
                        Math.max(outreachMinutesCutoff, 1)) *
                        100
                    )
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      ((userData.outreachMinutes || 0) /
                        Math.max(outreachMinutesCutoff, 1)) *
                        100
                    )}%`
                  }}
                />
              </div>
              {userData.outreachMinutes < outreachMinutesCutoff && (
                <div className="text-xs text-muted-foreground">
                  {formatMinutes(
                    Math.max(
                      outreachMinutesCutoff - (userData.outreachMinutes || 0),
                      0
                    )
                  )}
                  {" remaining"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="min-h-[220px]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Activity Overview
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="min-h-[180px] flex items-center justify-center">
              <ActivityGraph
                id={user.id}
                prefetchedDates={activityTimestamps}
              />
            </CardContent>
          </Card>

          <OutreachQuickManageCard
            canManage={canManage}
            events={quickManageEvents}
            onRosterReloadAction={handleReload}
          />
        </div>
      </div>

      <Separator className="w-full" />

      {showInitialError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {listError}
          <div className="mt-2">
            <Button size="sm" variant="outline" onClick={bootstrapList}>
              Try again
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0">
        {reloading && !collectedUsers.length ? (
          <div className="flex items-center justify-center py-20">
            <Loader />
          </div>
        ) : (
          <OutreachTable
            users={collectedUsers}
            totalItems={totalItems}
            canManage={canManage}
            isLoading={!collectedUsers.length && !!initialUsers && reloading}
            isLoadingMore={loadingMore}
            outreachMinutesCutoff={outreachMinutesCutoff}
            isMobile={isMobile}
            hasMore={hasMore}
            onLoadMoreAction={loadNextPage}
            onReloadAction={handleReload}
          />
        )}
      </div>
    </div>
  );
}
