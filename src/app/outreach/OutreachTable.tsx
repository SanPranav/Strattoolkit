"use client";

import { useEffect, useState } from "react";

import { pb, recordToImageUrl } from "@/lib/pbaseClient";
import type { UserData } from "@/lib/types/pocketbase";
import { formatMinutes, formatPbDate, getBadgeStatusStyles } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
// Removed ScrollArea to prevent nested scrolling / clipping
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EditUserDialog from "./EditUserDialog";

type OutreachTableProps = {
  allUsers: UserData[];
  isAdmin: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  onUpdate: () => void;
  outreachMinutesCutoff: number;
  isMobile?: boolean;
  refetchData?: () => void; // Function to refetch data after edits
};

const SortedTableHeads = [
  {
    key: "user",
    name: "User",
    info: "`(${allUsers.length})`",
    descending: "Z > A",
    ascending: "A > Z",
    noSort: "",
    isSortable: true
  },
  {
    key: "outreachMinutes",
    name: "Logged Time",
    ascending: "Low > High",
    descending: "High > Low",
    noSort: "",
    isSortable: true
  },
  {
    key: "lastOutreachEvent",
    name: "Last Outreach Event",
    ascending: "Old > New",
    descending: "New > Old",
    noSort: "",
    isSortable: true
  }
];

// Main OutreachTable component
export function OutreachTable({
  allUsers,
  isAdmin,
  isLoading,
  isLoadingMore,
  outreachMinutesCutoff,
  isMobile = false,
  refetchData
}: OutreachTableProps) {
  const [sortedUsers, setSortedUsers] = useState(allUsers);

  const [sortConfig, setSortConfig] = useState({
    key: "user",
    direction: "ascending"
  });

  useEffect(() => {
    const sortUsers = (users: UserData[], config: typeof sortConfig) => {
      return [...users].sort((a, b) => {
        let aValue, bValue;

        switch (config.key) {
          case "user":
            aValue = a.expand?.user?.name || "";
            bValue = b.expand?.user?.name || "";
            break;
          case "outreachMinutes":
            aValue = a.outreachMinutes || 0;
            bValue = b.outreachMinutes || 0;
            break;
          case "lastOutreachEvent":
            aValue = new Date(a.lastOutreachEvent).getTime();
            bValue = new Date(b.lastOutreachEvent).getTime();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return config.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return config.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    };
    setSortedUsers(sortUsers(allUsers, sortConfig));
  }, [allUsers, sortConfig]);

  // Mobile Card Layout (avoid nested scroll; parent provides vertical scrolling)
  if (isMobile) {
    return (
      <div className="w-full">
        <div className="space-y-3">
          {/* Sort Controls for Mobile */}
          <div className="flex gap-2 p-2 bg-muted/50 rounded-lg">
            <Button
              variant={sortConfig.key === "user" ? "default" : "outline"}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => {
                setSortConfig((prev) => ({
                  key: "user",
                  direction:
                    prev.key === "user" && prev.direction === "ascending"
                      ? "descending"
                      : "ascending"
                }));
              }}>
              Name{" "}
              {sortConfig.key === "user" &&
                (sortConfig.direction === "ascending" ? "↑" : "↓")}
            </Button>
            <Button
              variant={
                sortConfig.key === "outreachMinutes" ? "default" : "outline"
              }
              size="sm"
              className="flex-1 text-xs"
              onClick={() => {
                setSortConfig((prev) => ({
                  key: "outreachMinutes",
                  direction:
                    prev.key === "outreachMinutes" &&
                    prev.direction === "ascending"
                      ? "descending"
                      : "ascending"
                }));
              }}>
              Hours{" "}
              {sortConfig.key === "outreachMinutes" &&
                (sortConfig.direction === "ascending" ? "↑" : "↓")}
            </Button>
            <Button
              variant={
                sortConfig.key === "lastOutreachEvent" ? "default" : "outline"
              }
              size="sm"
              className="flex-1 text-xs"
              onClick={() => {
                setSortConfig((prev) => ({
                  key: "lastOutreachEvent",
                  direction:
                    prev.key === "lastOutreachEvent" &&
                    prev.direction === "ascending"
                      ? "descending"
                      : "ascending"
                }));
              }}>
              Event Date{" "}
              {sortConfig.key === "lastOutreachEvent" &&
                (sortConfig.direction === "ascending" ? "↑" : "↓")}
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Loading...
              </div>
            </div>
          ) : allUsers.length === 0 ? (
            <div className="text-center py-8">No user data found</div>
          ) : (
            sortedUsers.map((userData) => (
              <Card key={userData.id} className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage
                          src={recordToImageUrl(
                            userData.expand?.user
                          )?.toString()}
                          alt={userData.expand?.user.name}
                          className="rounded-full"
                        />
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs rounded-full flex items-center justify-center h-full w-full">
                          {userData.expand?.user.name.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">
                          {userData.expand?.user?.name || "Unknown"}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {userData.expand?.user?.email}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatPbDate(userData.lastOutreachEvent) || "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <Badge
                        className={`${getBadgeStatusStyles(
                          userData.outreachMinutes,
                          outreachMinutesCutoff,
                          outreachMinutesCutoff - 60 * 3
                        )} text-sm`}>
                        {formatMinutes(userData.outreachMinutes)}
                      </Badge>
                      {isAdmin && <EditUserDialog userData={userData} />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          {isLoadingMore && (
            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Loading more...
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop Table Layout (enable horizontal scroll to avoid clipped cells)
  return (
    <div className="relative w-full h-full overflow-x-auto">
      <Table className="w-full min-w-[780px]">
        <TableHeader>
          <TableRow>
            {SortedTableHeads.map((head) => (
              <TableHead
                key={head.key}
                className={`cursor-pointer relative ${
                  head.key === "user"
                    ? "min-w-[18rem]"
                    : head.key === "outreachMinutes"
                    ? "min-w-[10rem]"
                    : "min-w-[12rem]"
                }`}
                onClick={() => {
                  setSortConfig((prev) => {
                    const newDirection =
                      prev.key === head.key && prev.direction === "ascending"
                        ? "descending"
                        : "ascending";
                    return { key: head.key, direction: newDirection } as any;
                  });
                }}>
                <div className="flex items-center justify-baseline gap-5">
                  <span>
                    {head.name}{" "}
                    <span className="text-muted-foreground">
                      {eval(head.info || "")}
                    </span>
                  </span>
                  <div className="w-20">
                    {sortConfig.key === head.key && (
                      <Badge className="text-xs">
                        {sortConfig.direction === "ascending"
                          ? head.ascending
                          : head.descending}
                      </Badge>
                    )}
                  </div>
                </div>
              </TableHead>
            ))}
            {isAdmin && <TableHead className="min-w-[8rem]">Manage</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-8">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Loading...
                </div>
              </TableCell>
            </TableRow>
          ) : allUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-8">
                No user data found
              </TableCell>
            </TableRow>
          ) : (
            sortedUsers.map((userData) => (
              <TableRow key={userData.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar>
                      <AvatarImage
                        src={recordToImageUrl(
                          userData.expand?.user
                        )?.toString()}
                        alt={userData.expand?.user.name}
                        className="rounded-full"
                      />
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs rounded-full flex items-center justify-center h-full w-full">
                        {userData.expand?.user.name.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {userData.expand?.user?.name || "Unknown"}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {userData.expand?.user?.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`${getBadgeStatusStyles(
                      userData.outreachMinutes,
                      outreachMinutesCutoff,
                      outreachMinutesCutoff - 60 * 3
                    )} text-sm md:text-base`}>
                    {formatMinutes(userData.outreachMinutes)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatPbDate(userData.lastOutreachEvent) || "N/A"}
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <EditUserDialog
                      userData={userData}
                      refreshFunc={refetchData}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
          {isLoadingMore && (
            <TableRow>
              <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Loading more...
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
