"use client";

import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavbar } from "@/hooks/useNavbar";

import { ChevronUp } from "lucide-react";

const STORAGE_KEY = "navbarTipSeen";

export default function NavbarTip() {
  const [visible, setVisible] = useState(false);
  const [delayComplete, setDelayComplete] = useState(false);

  const { expanded, isDisabled } = useNavbar();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasSeen = localStorage.getItem(STORAGE_KEY);

    if (!hasSeen && !isDisabled) {
      setVisible(true);
      const timer = setTimeout(() => setDelayComplete(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isDisabled]);

  return (
    visible && (
      <div
        role="note"
        aria-label={
          isMobile
            ? "Tap the menu button to open navigation"
            : "Move your cursor to the top edge to reveal the navbar"
        }
        className="fixed left-1/2 -translate-x-1/2 z-40 select-none flex flex-col items-center gap-1 animate-in fade-in transition-all duration-[350ms]"
        style={{
          top: expanded ? "70px" : "10px"
        }}>
        <div className="h-px w-56 bg-gradient-to-r from-transparent via-primary/70 to-transparent animate-pulse" />
        <ChevronUp className="h-4 w-4 text-primary animate-bounce" />
        <span className="text-[10px] font-medium tracking-wide text-primary/80">
          {isMobile ? "Open the Nav Menu" : "Open the Navbar"}
        </span>
      </div>
    )
  );
}
