"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { InfoSidebar } from "@/components/info/InfoSidebar";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

const DESKTOP_BREAKPOINT = 768;

export function InfoLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const pathname = usePathname();

  // Only show desktop sidebar at md and up; never render it on mobile
  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Close mobile sidebar when route changes (user tapped a link)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar - only rendered on desktop, never on mobile */}
      {isDesktop === true && (
        <aside className="w-64 shrink-0 border-r border-border">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <InfoSidebar />
          </div>
        </aside>
      )}

      {/* Mobile info menu button - only on small screens, on every info page (show when not desktop, including before hydration) */}
      {isDesktop !== true && (
        <div className="fixed top-20 left-4 z-40">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="h-10 w-10 rounded-lg border-border bg-background/95 backdrop-blur shadow-md"
            aria-label="Open info menu"
          >
            <Info className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Mobile sidebar sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="w-[min(280px,85vw)] p-0 flex flex-col border-r border-border"
        >
          <SheetTitle className="sr-only">Info navigation</SheetTitle>
          <div className="pt-14 pb-4 overflow-y-auto flex-1">
            <InfoSidebar embedded />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content - add top/left padding on mobile for menu button */}
      <div
        className={cn(
          "flex-1 min-w-0",
          isDesktop !== true && "pt-20 pl-14",
          isDesktop === true && "pt-0 pl-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}
