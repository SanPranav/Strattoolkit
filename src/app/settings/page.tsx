"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, RefreshCcw } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import FlagsTab from "./FlagsTab";
import type { FeatureFlags, FullUserData } from "@/lib/types/db";
import type { Tables } from "@/lib/types/supabase";
import UserAvatar from "@/components/UserAvatar";
import { useUser } from "@/hooks/useUser";
import { getSBBrowserClient } from "@/lib/supabase/sbClient";
import { useIsMounted } from "@/hooks/useIsHydrated";
import { useNavbar } from "@/hooks/useNavbar";

type FeatureFlagRow = Tables<"FeatureFlags">;

export default function SettingsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const supabase = useMemo(() => getSBBrowserClient(), []);
  const isAdmin = user?.role === "admin";

  const [flags, setFlags] = useState<FeatureFlags[]>([]);
  const [isFlagsLoading, setIsFlagsLoading] = useState(false);
  const [flagError, setFlagError] = useState<string | null>(null);

  const { setMobileNavbarSide } = useNavbar();
  const isMounted = useIsMounted();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setMobileNavbarSide("right");
  }, [setMobileNavbarSide]);

  const loadFlags = useCallback(async () => {
    if (!isAdmin) {
      setFlags([]);
      setFlagError(null);
      setIsFlagsLoading(false);
      return;
    }

    if (!isMounted) return;

    setIsFlagsLoading(true);
    setFlagError(null);

    const { data, error } = await supabase
      .from("FeatureFlags")
      .select("*")
      .order("name", { ascending: true });

    if (!isMountedRef.current) return;

    if (error || !data) {
      setFlags([]);
      setFlagError(
        `Failed to fetch flags (${error?.message ?? "Unknown error"})`
      );
      setIsFlagsLoading(false);
      return;
    }

    setFlags(data.map((row) => mapRowToFlagRecord(row)));
    setIsFlagsLoading(false);
  }, [isAdmin, isMounted, supabase]);

  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  const showFlagsTab = Boolean(isAdmin);

  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-0">
      <header className="space-y-3">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Account
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Review personal details and, if you&apos;re an admin, manage feature
          flags in one spot.
        </p>
      </header>

      <Tabs defaultValue="user" className="space-y-6">
        <TabsList className="w-fit">
          <TabsTrigger value="user">Profile</TabsTrigger>
          {showFlagsTab && (
            <TabsTrigger value="flags">Feature Flags</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="user">
          <UserDetailsCard user={user} isLoading={isUserLoading} />
        </TabsContent>

        {showFlagsTab && (
          <TabsContent value="flags">
            <FlagsPanel
              flags={flags}
              isLoading={isFlagsLoading}
              error={flagError}
              onRetry={loadFlags}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

type UserDetailsCardProps = {
  user: FullUserData | null;
  isLoading: boolean;
};

function UserDetailsCard({ user, isLoading }: UserDetailsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User details</CardTitle>
          <CardDescription>
            We&apos;re loading your profile information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>No user session detected</CardTitle>
          <CardDescription>
            Sign in to see account details and personalized settings.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const displayName = user.name ?? user.email ?? "Unknown";
  const email = user.email ?? "No email available";

  return (
    <Card>
      <CardHeader>
        <CardTitle>User details</CardTitle>
        <CardDescription>
          Account controls and profile preferences will live here soon.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <UserAvatar
            name={displayName}
            avatarUrl={user.avatar_url}
            className="h-12 w-12"
          />
          <div className="space-y-1">
            <p className="font-medium text-base">{displayName}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
          <Badge variant="outline" className="ml-auto">
            {formatRole(user.role)}
          </Badge>
        </div>

        <dl className="grid gap-4 pt-4 text-sm md:grid-cols-3">
          <div className="rounded-lg border bg-muted/20 p-4">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Outreach minutes
            </dt>
            <dd className="text-lg font-semibold">
              {user.outreach_minutes ?? 0}
            </dd>
          </div>
          <div className="rounded-lg border bg-muted/20 p-4">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Outreach events
            </dt>
            <dd className="text-lg font-semibold">
              {user.outreach_events ?? 0}
            </dd>
          </div>
          <div className="rounded-lg border bg-muted/20 p-4">
            <dt className="text-lg uppercase tracking-wide text-muted-foreground">
              User ID
            </dt>
            <dd className="text-sm wrap-break-word">{user.id ?? "—"}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

type FlagsPanelProps = {
  flags: FeatureFlags[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
};

function FlagsPanel({ flags, isLoading, error, onRetry }: FlagsPanelProps) {
  if (isLoading) {
    return (
      <Card className="border-dashed bg-muted/30">
        <CardHeader>
          <CardTitle>Loading flags</CardTitle>
          <CardDescription>
            Fetching the latest feature flag configuration.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          <span>Please wait…</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/40 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">
            Unable to load flags
          </CardTitle>
          <CardDescription className="text-destructive/90">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="gap-2">
            <RefreshCcw className="h-4 w-4" /> Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <FlagsTab initialFlags={flags} />;
}

function mapRowToFlagRecord(row: FeatureFlagRow): FeatureFlags {
  return {
    id: row.id ?? 0,
    name: (row.name ?? "") as FeatureFlags["name"],
    flag: (row.flag as FeatureFlags["flag"]) ?? false
  };
}

function formatRole(role?: FullUserData["role"]) {
  if (!role) return "Member";
  return role.charAt(0).toUpperCase() + role.slice(1);
}
