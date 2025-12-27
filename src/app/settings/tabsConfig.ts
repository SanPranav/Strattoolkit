export type SettingsTabId = "profile" | "rbac";

export interface SettingsTabConfig {
  id: SettingsTabId;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export const settingsTabs: SettingsTabConfig[] = [
  {
    id: "profile",
    label: "Profile",
    description: "Manage your personal information and avatar"
  },
  {
    id: "rbac",
    label: "RBAC",
    description: "Manage role-based access control rules"
  }
];
