"use client";

import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp } from "lucide-react";
import ActivityGraph from "./ActivityGraph";
import Loader from "@/components/Loader";

type ActivityOverviewCardProps = {
  userId: string | null;
};

export function ActivityOverviewCard({ userId }: ActivityOverviewCardProps) {
  if (!userId) return null;

  return (
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
          <ActivityGraph id={userId} />
        </Suspense>
      </CardContent>
    </Card>
  );
}

