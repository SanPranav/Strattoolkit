"use client";

import { useEffect, useCallback, Suspense } from "react";
import useSWRInfinite from "swr/infinite";
import Link from "next/link";

import { pb, recordToImageUrl } from "@/lib/pbaseClient";
import { useNavbar } from "@/hooks/useNavbar";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useIsMobile } from "@/hooks/use-mobile";
import type { pb_UserDataItem } from "@/lib/types";

import { formatMinutes, getBadgeStatusStyles } from "@/lib/utils";

import { Users, Clock, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OutreachTable } from "./OutreachTable";
import Loading from "./loading";
import Loader from "@/components/Loader";
import ActivityGraph from "./ActivityGraph";
import { Button } from "@/components/ui/button";

// Import the activity graph component
// import OutreachActivityGraph from "./OutreachActivityGraph";

const PAGE_SIZE = 15;

interface PaginatedResponse {
  items: pb_UserDataItem[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

type Props = {
  isAdmin?: boolean;
  userData?: pb_UserDataItem;
  outreachMinutesCutoff: number;
};

const fetcher = async (url: string): Promise<PaginatedResponse> => {
  const [, page] = url.split("?page=");
  const pageNum = parseInt(page) || 1;

  const response = await pb
    .collection("UserData")
    .getList<pb_UserDataItem>(pageNum, PAGE_SIZE, {
      expand: "user"
    });

  return response;
};

const getKey = (
  pageIndex: number,
  previousPageData: PaginatedResponse | null
) => {
  if (previousPageData && !previousPageData.items.length) return null;
  return `?page=${pageIndex + 1}`;
};

export default function OutreachPage({
  isAdmin = false,
  userData,
  outreachMinutesCutoff
}: Props) {
  const { setDefaultShown } = useNavbar();
  const isHydrated = useIsHydrated();
  const isMobile = useIsMobile();

  const { data, error, size, setSize, isValidating, mutate } =
    useSWRInfinite<PaginatedResponse>(getKey, fetcher, {
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    });

  const allUsers = data ? data.flatMap((page) => page.items) : [];
  const totalItems = data?.[0]?.totalItems || 0;
  const hasMore = allUsers.length < totalItems;
  const isLoading = !data && !error;
  const isLoadingMore = isValidating && data && data.length > 0;

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      setSize(size + 1);
    }
  }, [hasMore, isLoadingMore, setSize, size]);

  const handleUpdate = useCallback(() => {
    mutate();
  }, [mutate]);

  const refetchData = useCallback(() => {
    mutate();
  }, [mutate]);

  useEffect(() => {
    setDefaultShown(false);
  }, [setDefaultShown]);

  useEffect(() => {
    loadMore();
  });

  useEffect(() => {
    if (isHydrated && !hasMore && !isLoadingMore) {
    }
  });

  if (!isHydrated)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );

  if (error) {
    console.error("Error loading outreach data:", error);
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
      className={`container mx-auto h-screen flex flex-col ${
        isMobile ? "pt-4 px-4 pb-20" : "pt-3"
      }`}>
      {/* Header */}
      <div className="flex-shrink-0 mb-4 justify-between flex items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className={`${isMobile ? "h-5 w-5" : "h-6 w-6"}`} />
            <h1 className={`${isMobile ? "text-2xl" : "text-3xl"} font-bold`}>
              Outreach Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            {isAdmin
              ? "Manage and view user outreach data"
              : "View outreach data"}
          </p>
        </div>

        {isAdmin && (
          <Button variant="outline" asChild>
            <Link href="/outreach/manage">Manage Events</Link>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div
        className={`${
          isMobile ? "flex flex-col gap-3" : "flex gap-4"
        } mb-4 flex-shrink-0`}>
        {/* Enhanced User Hours Card */}
        <Card className={`${isMobile ? "w-full" : "w-80"}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage
                    src={recordToImageUrl(userData?.expand?.user)?.toString()}
                    alt={userData?.expand?.user.name}
                    className="rounded-full object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-800 to-purple-800 text-white text-sm font-semibold rounded-full flex items-center justify-center h-full w-full">
                    {userData?.expand?.user.name?.charAt(0).toUpperCase() ||
                      "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-lg truncate">
                  {userData?.expand?.user.name || "Unknown User"}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {userData?.expand?.user.email || "No email"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {userData?.outreachMinutes ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Your Progress
                  </span>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-3xl font-bold">
                      {formatMinutes(userData.outreachMinutes)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Total completed
                    </div>
                  </div>
                  <Badge
                    className={`${getBadgeStatusStyles(
                      userData.outreachMinutes,
                      outreachMinutesCutoff,
                      outreachMinutesCutoff - 60 * 3
                    )} text-sm px-3 py-1`}>
                    {userData.outreachMinutes >= outreachMinutesCutoff
                      ? "Complete"
                      : "In Progress"}
                  </Badge>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>
                      {Math.round(
                        (userData.outreachMinutes / outreachMinutesCutoff) * 100
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
                          (userData.outreachMinutes / outreachMinutesCutoff) *
                            100
                        )}%`
                      }}></div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {userData.outreachMinutes < outreachMinutesCutoff && (
                      <>
                        {formatMinutes(
                          outreachMinutesCutoff - userData.outreachMinutes
                        )}{" "}
                        remaining
                      </>
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

        {/* Activity Graph Card - Replaces the Loader */}
        {!isMobile && (
          <Card className="grow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Activity Overview
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>{" "}
            <CardContent className="pt-2 size-full flex justify-center items-center">
              <Suspense fallback={<Loader />}>
                <ActivityGraph id="" />
              </Suspense>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator className="w-full mb-5" />

      {/* Table Container - Takes remaining space */}
      <div className="flex-1 min-h-0">
        <OutreachTable
          allUsers={allUsers}
          isAdmin={isAdmin}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore || false}
          onUpdate={handleUpdate}
          outreachMinutesCutoff={outreachMinutesCutoff}
          isMobile={isMobile}
          refetchData={refetchData}
        />
      </div>
    </div>
  );
}
