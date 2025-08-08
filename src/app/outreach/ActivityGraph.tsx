"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { pb } from "@/lib/pbaseClient";
import type { pb_OutreachSessionsColItem } from "@/lib/types";

const MONTHS = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12
} as Record<string, number>;

interface ActivityDataPoint {
  month: string;
  year: number;
  events: number;
}

interface OutreachActivityGraphProps {
  id: string;
}

export default function ActivityGraph({ id }: OutreachActivityGraphProps) {
  const [timestamps, setTimestamps] = useState<string[]>();
  const [activityData, setActivityData] = useState<ActivityDataPoint[]>([]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function fetchUserEventDates() {
      try {
        const sessions = await pb
          .collection("OutreachSessions")
          .getFullList<pb_OutreachSessionsColItem>({
            filter: `user="${id}"`,
            expand: "event"
          });

        const dates = sessions
          .map((s) => s.expand?.event?.date)
          .filter(Boolean) as string[];

        if (!cancelled) setTimestamps(dates);
      } catch (err) {
        console.error("Failed to fetch outreach sessions for user", err);
        if (!cancelled) setTimestamps([]);
      }
    }

    fetchUserEventDates();

    return () => {
      cancelled = true;
    };
  }, [id, setTimestamps]);

  useEffect(() => {
    if (!timestamps || timestamps.length === 0) return;
    let tempActivityData: { [key: string]: number } = {};

    timestamps.forEach((timestamp) => {
      const date = new Date(timestamp);

      const year = date.getFullYear();
      const month = date.toLocaleString("en-US", {
        month: "short"
      });

      const key = `${year} ${month}`;

      tempActivityData[key] = tempActivityData[key]
        ? tempActivityData[key] + 1
        : 1;
    });

    let formattedData = Object.entries(tempActivityData).map(
      ([key, events]) => {
        const [year, month] = key.split(" ");
        return {
          month,
          year: parseInt(year),
          events
        };
      }
    );

    //sort by year and month
    formattedData.sort((a, b) => {
      if (a.year === b.year) {
        return MONTHS[a.month] - MONTHS[b.month];
      }
      return a.year - b.year;
    });

    setActivityData(formattedData);
  }, [timestamps, setActivityData]);

  const totalSessions = timestamps?.length || 0;
  const avgSessionsPerMonth = activityData.length
    ? (
        activityData.reduce((acc, curr) => acc + curr.events, 0) /
        activityData.length
      ).toFixed(1)
    : 0;
  const peakMonth = activityData.length
    ? activityData.toSorted((a, b) => b.events - a.events)[0].month
    : "?";
  const GraphDot = function () {
    return <div></div>;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3 backdrop-blur-sm">
          <div className="space-y-1">
            <p className="text-sm font-medium text-card-foreground">
              {data.month} {data.year}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">{data.events}</span>
              {data.events === 1 ? "event" : "events"}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="size-full flex flex-col bg-transparent">
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-1">Activity Timeline</h3>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={activityData}>
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="linear"
            dataKey="events"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="transparent"
            dot={{ r: 2, stroke: "var(--primary)" }}
            activeDot={{ r: 3, stroke: "var(--primary)" }}
            className="transition-all duration-300 ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-4 text-center border-t border-gray-200 pt-4 mt-4">
        <div>
          <div className="text-lg font-bol">{totalSessions}</div>
          <div className="text-xs">Total Sessions</div>
        </div>
        <div>
          <div className="text-lg font-bol">{avgSessionsPerMonth}</div>
          <div className="text-xs">Avg/Month</div>
        </div>
        <div>
          <div className="text-lg font-bol">{peakMonth}</div>
          <div className="text-xs">Peak Month</div>
        </div>
      </div>
    </div>
  );
}
