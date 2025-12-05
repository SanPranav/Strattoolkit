"use client";

// React / Hooks
import { useEffect, useCallback, useMemo, Suspense } from "react";
import useSWRInfinite from "swr/infinite";
import Link from "next/link";
import { useNavbar } from "@/hooks/useNavbar";
import { useIsMounted } from "@/hooks/useIsHydrated";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/hooks/useUser";
import { hasPermission } from "@/lib/permissions";
import { formatMinutes, getBadgeStatusStyles } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import { OutreachTable } from "./OutreachTable";
import ActivityGraph from "./ActivityGraph";

import { Users, Clock, TrendingUp, Calendar } from "lucide-react";
import type { User, UserData } from "@/lib/types/db";
import { fetchUserDataPaginated } from "@/lib/db/user";
import { getProfileImageUrl } from "@/lib/supabase/supabase";
import { logger } from "@/lib/logger";

const PAGE_SIZE = 15;

interface PaginatedResponse {
  items: UserData[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

type Props = {
  outreachMinutesCutoff: number;
};

const fetcher = async (url: string): Promise<PaginatedResponse> => {
  const [, page] = url.split("?page=");
  const pageNum = parseInt(page) || 1;
  const data = await fetchUserDataPaginated(pageNum, PAGE_SIZE);

  if (!data) {
    throw new Error("Failed to load outreach data");
  }

  return data as PaginatedResponse;
};

const getKey = (
  pageIndex: number,
  previousPageData: PaginatedResponse | null
) => {
  if (previousPageData && !previousPageData.items.length) return null;
  return `?page=${pageIndex + 1}`;
};

export default function OutreachPage({ outreachMinutesCutoff }: Props) {
  const { setDefaultExpanded, setMobileNavbarSide } = useNavbar();
  const isHydrated = useIsMounted();
  const isMobile = useIsMobile();
  const { user: authUser } = useUser();

  const { data, error, size, setSize, isValidating, mutate } =
    useSWRInfinite<PaginatedResponse>(getKey, fetcher, {
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    });

  const allUsers = data ? data.flatMap((page) => page.items) : [];
  const currentUserData = authUser;
  const activityUserId = authUser?.id ?? null;
  const canManage = hasPermission(
    currentUserData?.role ?? null,
    "outreach:manage"
  );
  const currentMinutes = currentUserData?.outreach_minutes ?? 0;
  const profileName =
    currentUserData?.name ??
    currentUserData?.user_metadata?.full_name ??
    "Unknown User";
  const profileEmail =
    currentUserData?.email ?? currentUserData?.email ?? "No email";
  const profileAvatar =
    currentUserData?.avatar_url ??
    getProfileImageUrl(currentUserData) ??
    undefined;
  const progressPercent = outreachMinutesCutoff
    ? Math.min(100, Math.round((currentMinutes / outreachMinutesCutoff) * 100))
    : 0;
  const minutesRemaining = Math.max(0, outreachMinutesCutoff - currentMinutes);
  const totalItems = data?.[0]?.totalItems || 0;
  const hasMore = allUsers.length < totalItems;
  const isLoading = !data && !error;
  const isLoadingMore = isValidating && data && data.length > 0;

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      setSize(size + 1);
    }
  }, [hasMore, isLoadingMore, setSize, size]);

  const refetchData = useCallback(() => {
    mutate();
  }, [mutate]);

  useEffect(() => {
    setDefaultExpanded(false);
    setMobileNavbarSide("right");
  }, [setDefaultExpanded, setMobileNavbarSide]);
  if (!isHydrated)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );

  if (error) {
    logger.error("Error loading outreach data:", error);
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Error Loading Data
          </h2>
          <p className="text-muted-foreground">
            Failed to load outreach data. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`container mx-auto min-h-screen flex flex-col gap-3 px-3 sm:px-4 pt-3 pb-24`}>
      {/* Header */}
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
              ? "Manage and view user outreach data"
              : "View outreach data"}
          </p>
        </div>

        {canManage && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/outreach/manage">Manage Events</Link>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div
        className={`grid grid-cols-1 md:grid-cols-[22rem_1fr] gap-3 md:gap-4`}>
        {/* Enhanced User Hours Card */}
        <Card className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <Avatar className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0">
                  <AvatarImage
                    src={profileAvatar}
                    alt={profileName}
                    className="rounded-full object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-800 to-purple-800 text-white text-sm font-semibold rounded-full flex items-center justify-center h-full w-full">
                    {profileName.charAt(0).toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base md:text-lg truncate">
                  {profileName}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {profileEmail}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {currentUserData ? (
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
                    <div className="text-xs text-muted-foreground mt-1">
                      Total completed
                    </div>
                  </div>
                  <Badge
                    className={`${getBadgeStatusStyles(
                      currentMinutes,
                      outreachMinutesCutoff,
                      outreachMinutesCutoff - 60 * 3
                    )} text-xs md:text-sm px-2 md:px-3 py-1`}>
                    {currentMinutes >= outreachMinutesCutoff
                      ? "Complete"
                      : "In Progress"}
                  </Badge>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${progressPercent}%`
                      }}></div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {outreachMinutesCutoff > 0 ? (
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

        {/* Activity Graph Card - Hidden on mobile to keep layout clean */}
        {!isMobile && (
          <Card className="grow">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Activity Overview
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="size-full flex justify-center items-center grow-0">
              <Suspense fallback={<Loader />}>
                {activityUserId ? <ActivityGraph id={activityUserId} /> : null}
              </Suspense>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator className="w-full" />

      {/* Table Container - Takes remaining space */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <OutreachTable
          allUsers={allUsers}
          canManage={canManage}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore || false}
          outreachMinutesCutoff={outreachMinutesCutoff}
          isMobile={isMobile}
          refetchData={refetchData}
          onLoadMore={loadMore}
          hasMore={hasMore}
        />
      </div>
    </div>
  );
}
