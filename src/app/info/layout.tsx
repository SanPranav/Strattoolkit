import React from "react";
import { NavbarServerConfig } from "@/components/NavbarServerConfig";
import { InfoLayoutClient } from "@/components/info/InfoLayoutClient";

export const metadata = {
  title: "Info",
};

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <NavbarServerConfig />

      <InfoLayoutClient>
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="max-w-5xl w-full">
            {children}
          </div>
        </div>
      </InfoLayoutClient>
    </div>
  );
}
