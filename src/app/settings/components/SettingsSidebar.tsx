"use client";

import { SettingsIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { SettingsTabId, settingsTabs } from "../tabsConfig";

interface SettingsSidebarProps {
  activeTab: SettingsTabId;
  onTabChange: (id: SettingsTabId) => void;
}

export function SettingsSidebar({
  activeTab,
  onTabChange
}: SettingsSidebarProps) {
  return (
    <aside className="w-full max-w-full md:w-64 md:max-w-xs">
      <div className="mb-4 flex items-center justify-between gap-2 md:hidden">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Settings</span>
        </div>
        <SidebarTrigger>
          <Button variant="outline" size="sm">
            Open menu
          </Button>
        </SidebarTrigger>
      </div>

      <div className="mb-4 md:hidden">
        <Tabs
          value={activeTab}
          onValueChange={(value) => onTabChange(value as SettingsTabId)}>
          <TabsList className="w-full justify-start">
            {settingsTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn("px-3 py-1 text-xs sm:text-sm")}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="hidden md:block">
        <Sidebar
          variant="inset"
          collapsible="icon"
          className="border-border bg-card/40">
          <SidebarHeader className="px-3 py-4">
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium leading-none">Settings</p>
                <p className="text-muted-foreground text-xs">
                  Manage your account preferences
                </p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>General</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {settingsTabs.map((tab) => (
                    <SidebarMenuItem key={tab.id}>
                      <SidebarMenuButton
                        isActive={activeTab === tab.id}
                        onClick={() => onTabChange(tab.id)}>
                        <span>{tab.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </div>
    </aside>
  );
}
