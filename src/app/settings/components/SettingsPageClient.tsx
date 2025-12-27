"use client";

import { useEffect, useMemo, useState } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNavbar } from "@/hooks/useNavbar";

import { ProfileSettings } from "./ProfileSettings";
import { SettingsSidebar } from "./SettingsSidebar";
import { SettingsTabId, settingsTabs } from "../tabsConfig";
import { RBACSettings } from "./RBACSettings";

export function SettingsPageClient() {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("profile");
  const { setDefaultExpanded, resetNavbar } = useNavbar();

  useEffect(() => {
    setDefaultExpanded(false);

    return () => {
      resetNavbar();
    };
  }, [setDefaultExpanded, resetNavbar]);

  const activeTabConfig = useMemo(
    () => settingsTabs.find((tab) => tab.id === activeTab),
    [activeTab]
  );

  return (
    <SidebarProvider className="bg-background">
      <SidebarInset className="px-4 py-6 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <section className="flex-1">
            <header className="mb-4">
              <h1 className="text-2xl font-semibold tracking-tight">
                {activeTabConfig?.label ?? "Settings"}
              </h1>
              {activeTabConfig?.description && (
                <p className="text-muted-foreground mt-1 text-sm">
                  {activeTabConfig.description}
                </p>
              )}
            </header>
            <Separator className="mb-4" />
            <ScrollArea className="h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] pr-2">
              {activeTab === "profile" && <ProfileSettings />}
              {activeTab === "rbac" && <RBACSettings />}
            </ScrollArea>
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
