"use client";

import React, { useState, useEffect } from "react";
import { PBBrowser } from "@/lib/pb";
import { fetchUserSessionEventDates } from "@/lib/db/outreach";
import { ShortMonths } from "@/lib/utils";
import { ErrorToString } from "@/lib/states";

import { BarChart, Bar, XAxis, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";

type ChartData = {
  month: keyof typeof ShortMonths;
  events: number;
}[];

type OutreachActivityGraphProps = {
  id: string;
};

const PRE_FORMATTED_DATA = {
  Jan: 0,
  Feb: 0,
  Mar: 0,
  Apr: 0,
  May: 0,
  Jun: 0,
  Jul: 0,
  Aug: 0,
  Sep: 0,
  Oct: 0,
  Nov: 0,
  Dec: 0
};

export default function ActivityGraph({ id }: OutreachActivityGraphProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [chartData, setChartData] = useState<ChartData>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    avgSessionsPerMonth: 0,
    peakMonth: ""
  });

  const processTimestamps = function (timestamps: string[]): ChartData {
    const data = { ...PRE_FORMATTED_DATA }; // copy to avoid mutation across calls
    const monthKeys = Object.keys(ShortMonths) as (keyof typeof ShortMonths)[];
    for (const timestamp of timestamps) {
      const date = new Date(timestamp);
      const monthKey = monthKeys[date.getMonth()];
      data[monthKey] += 1;
    }

    return Object.entries(data).map(([month, events]) => ({
      month,
      events
    })) as ChartData;
  };

  useEffect(() => {
    (async () => {
      const [error, timestamps] = await fetchUserSessionEventDates(
        id,
        PBBrowser.getInstance()
      );

      if (error || !timestamps) {
        console.error(
          "Failed to fetch outreach activity",
          error ? ErrorToString[error] ?? error : "No data"
        );
        setChartData([]);
        return;
      }

      const data = processTimestamps(timestamps);

      setChartData(data);
    })();
  }, [id]);

  useEffect(() => {
    if (chartData.length) {
      const totalSessions = chartData.reduce(
        (sum, data) => sum + data.events,
        0
      );
      const avgSessionsPerMonth = Math.round(totalSessions / chartData.length);
      const peakMonth = chartData.reduce((prev, current) =>
        current.events > prev.events ? current : prev
      ).month;

      setStats({
        totalSessions,
        avgSessionsPerMonth,
        peakMonth
      });
    }
  }, [chartData]);

  const chartConfig: ChartConfig = {
    events: {
      label: "Events",
      color: "var(--chart-1)"
    }
  };

  return (
    <div className="size-full flex flex-col bg-transparent">
      <div className="mb-2">
        <h3 className="text-sm font-medium">Timeline</h3>
      </div>
      <div className="w-full h-28">
        {!chartData.length ? (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
            No activity yet
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              onMouseLeave={() => setActiveIndex(null)}>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="url(#activity-pattern-dots)"
              />
              <defs>
                <pattern
                  id="activity-pattern-dots"
                  x="0"
                  y="0"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse">
                  <circle
                    className="dark:text-muted/40 text-muted"
                    cx="2"
                    cy="2"
                    r="1"
                    fill="currentColor"
                  />
                </pattern>
              </defs>
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                height={18}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="events"
                radius={3}
                fill="var(--color-events, var(--chart-1))">
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    className="transition-[fill-opacity,stroke] duration-200"
                    fillOpacity={
                      activeIndex === null
                        ? 1
                        : activeIndex === index
                        ? 1
                        : 0.35
                    }
                    stroke={
                      activeIndex === index
                        ? "var(--color-events, var(--chart-1))"
                        : ""
                    }
                    onMouseEnter={() => setActiveIndex(index)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4 text-center border-t pt-3 mt-4">
        <div>
          <div className="text-lg font-bold">{stats.totalSessions}</div>
          <div className="text-xs text-muted-foreground">Total Sessions</div>
        </div>
        <div>
          <div className="text-lg font-bold">{stats.avgSessionsPerMonth}</div>
          <div className="text-xs text-muted-foreground">Avg/Month</div>
        </div>
        <div>
          <div className="text-lg font-bold">{stats.peakMonth}</div>
          <div className="text-xs text-muted-foreground">Peak Month</div>
        </div>
      </div>
    </div>
  );
}
