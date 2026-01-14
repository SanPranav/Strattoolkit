"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Square,
  MapPin,
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useUserLocation, formatDistance } from "@/hooks/useUserLocation";
import { startBuildSession, stopBuildSession } from "@/lib/db/build";
import type { BuildSession } from "@/lib/types/db";
import { formatMinutes } from "@/lib/utils";

type ActiveSessionCardProps = {
  userId: string;
  activeSession: BuildSession | null;
  isLoading: boolean;
  onSessionChange: () => void;
};

export function ActiveSessionCard({
  userId,
  activeSession,
  isLoading,
  onSessionChange
}: ActiveSessionCardProps) {
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const {
    isAtValidLocation,
    validLocation,
    nearestLocation,
    loading: locationLoading,
    error: locationError,
    getCurrentPosition,
    startWatching,
    stopWatching
  } = useUserLocation();

  // Calculate elapsed time for active session
  useEffect(() => {
    if (!activeSession) {
      setElapsedTime(0);
      return;
    }

    const startTime = new Date(activeSession.started_at).getTime();

    const updateElapsed = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000 / 60); // minutes
      setElapsedTime(elapsed);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [activeSession]);

  // Start watching location when component mounts
  useEffect(() => {
    // Only start watching if no active session (need to know if user can start)
    if (!activeSession) {
      startWatching();
    }

    return () => stopWatching();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartSession = async () => {
    if (!userId) return;

    setIsStarting(true);

    // First validate location
    const validLoc = await getCurrentPosition();

    if (!validLoc) {
      toast.error("You must be at a valid build location to start a session");
      setIsStarting(false);
      return;
    }

    const [error, session] = await startBuildSession(userId, validLoc.id);

    if (error) {
      toast.error(error);
    } else {
      toast.success(
        "Session started! Don't forget to check out when you leave."
      );
      onSessionChange();
    }

    setIsStarting(false);
  };

  const handleStopSession = async () => {
    if (!activeSession) return;

    setIsStopping(true);

    const [error] = await stopBuildSession(activeSession.id);

    if (error) {
      toast.error(error);
    } else {
      toast.success(`Session ended. You logged ${formatMinutes(elapsedTime)}.`);
      onSessionChange();
    }

    setIsStopping(false);
  };

  // Determine what to show
  const hasActiveSession = !!activeSession;
  const canStartSession = isAtValidLocation && !hasActiveSession;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Session Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Location</span>
          {locationLoading ? (
            <Badge variant="secondary">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Checking...
            </Badge>
          ) : locationError ? (
            <Badge variant="destructive">
              <AlertCircle className="h-3 w-3 mr-1" />
              Error
            </Badge>
          ) : isAtValidLocation ? (
            <Badge className="bg-green-500/20 text-green-500">
              <MapPin className="h-3 w-3 mr-1" />
              On-site
            </Badge>
          ) : (
            <Badge variant="secondary">
              <MapPin className="h-3 w-3 mr-1" />
              Not on-site
            </Badge>
          )}
        </div>

        {validLocation && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
            <MapPin className="h-3 w-3 inline mr-1" />
            {validLocation.location_name}
          </div>
        )}

        {!isAtValidLocation && nearestLocation && !locationLoading && (
          <div className="text-xs text-muted-foreground bg-amber-500/10 rounded-md p-2 border border-amber-500/20">
            <AlertCircle className="h-3 w-3 inline mr-1 text-amber-500" />
            Nearest location: {nearestLocation.location.location_name} (
            {formatDistance(nearestLocation.distance)} away)
          </div>
        )}

        {locationError && (
          <div className="text-xs text-destructive bg-destructive/10 rounded-md p-2">
            {locationError}
          </div>
        )}

        {/* Active Session Display */}
        {hasActiveSession && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Session</span>
              <div className="flex items-center gap-1 text-primary">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-bold">
                  {formatMinutes(elapsedTime)}
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Started at{" "}
              {new Date(activeSession.started_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </div>
          </div>
        )}

        {/* Action Button */}
        {hasActiveSession ? (
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleStopSession}
            disabled={isStopping}>
            {isStopping ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Stopping...
              </>
            ) : (
              <>
                <Square className="h-4 w-4 mr-2" />
                Stop Session
              </>
            )}
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={handleStartSession}
            disabled={!canStartSession || isStarting || locationLoading}>
            {isStarting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : locationLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking Location...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Logging
              </>
            )}
          </Button>
        )}

        {!isAtValidLocation && !hasActiveSession && !locationLoading && (
          <p className="text-xs text-center text-muted-foreground">
            You must be at a valid build location to start logging hours.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
