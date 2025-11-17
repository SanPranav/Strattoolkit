"use client";

import { useCallback, useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavbar } from "@/hooks/useNavbar";

import { ChevronUp } from "lucide-react";

const STORAGE_KEY = "navbarTipSeen";

export default function NavbarTip() {
  const [visible, setVisible] = useState(false);

  const { expanded, isDisabled } = useNavbar();
  const isMobile = useIsMobile();

  const markSeen = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Ignore storage errors (e.g. private browsing)
    }

    setVisible(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasSeen = window.localStorage.getItem(STORAGE_KEY);

    if (hasSeen || isDisabled) {
      setVisible(false);
      return;
    }

    const showTimer = window.setTimeout(() => setVisible(true), 600);
    const autoHideTimer = window.setTimeout(() => markSeen(), 12000);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(autoHideTimer);
    };
  }, [isDisabled, markSeen]);

  useEffect(() => {
    if (!visible) return;
    if (expanded) {
      markSeen();
    }
  }, [expanded, visible, markSeen]);

  if (!visible) return null;

  return (
    <div
      role="note"
      aria-label={
        isMobile
          ? "Tap the menu button to open navigation"
          : "Move your cursor to the top edge to reveal the navbar"
      }
      tabIndex={0}
      onClick={markSeen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === "Escape" || event.key === " ") {
          event.preventDefault();
          markSeen();
        }
      }}
      className="fixed left-1/2 -translate-x-1/2 z-40 select-none flex flex-col items-center gap-1 animate-in fade-in transition-all duration-[350ms] cursor-pointer focus:outline-none"
      style={{
        top: expanded ? "70px" : "10px"
      }}>
      <div className="h-px w-56 bg-gradient-to-r from-transparent via-primary/70 to-transparent animate-pulse" />
      <ChevronUp className="h-4 w-4 text-primary animate-bounce" />
      <span className="text-[10px] font-medium tracking-wide text-primary/80">
        {isMobile ? "Open the Nav Menu" : "Open the Navbar"}
      </span>
    </div>
  );
}
