"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HorizontalScrollSectionProps {
  children: React.ReactNode;
  className?: string;
  showControls?: boolean;
}

export function HorizontalScrollSection({ 
  children, 
  className,
  showControls = false 
}: HorizontalScrollSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    const scrollElement = scrollRef.current;
    
    if (!container || !scrollElement) return;

    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    // Only tie vertical scroll to horizontal on desktop (non-touch); on phone let user swipe
    const isTouchOrNarrow = () => {
      if (typeof window === "undefined") return true;
      return window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
    };

    const handleVerticalScroll = () => {
      if (isScrolling || isTouchOrNarrow()) return;
      
      const containerRect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const containerTop = containerRect.top;
      const containerBottom = containerRect.bottom;
      
      // Check if container is in viewport
      if (containerTop < windowHeight && containerBottom > 0) {
        // Calculate scroll progress (0 to 1)
        const scrollProgress = Math.max(0, Math.min(1, 
          (windowHeight - containerTop) / (windowHeight + containerRect.height)
        ));
        
        // Calculate horizontal scroll position
        const maxScroll = scrollElement.scrollWidth - scrollElement.clientWidth;
        const targetScroll = scrollProgress * maxScroll;
        
        isScrolling = true;
        scrollElement.scrollTo({
          left: targetScroll,
          behavior: 'smooth'
        });
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isScrolling = false;
        }, 100);
      }
    };

    const checkScrollability = () => {
      if (scrollElement) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollElement;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    window.addEventListener("scroll", handleVerticalScroll, { passive: true });
    window.addEventListener("resize", checkScrollability);
    
    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScrollability);
    }

    checkScrollability();

    return () => {
      window.removeEventListener("scroll", handleVerticalScroll);
      window.removeEventListener("resize", checkScrollability);
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", checkScrollability);
      }
      clearTimeout(scrollTimeout);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {showControls && canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-card/80 backdrop-blur border border-border flex items-center justify-center hover:bg-card transition-all shadow-lg"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-horizontal scrollbar-hide gap-8 pb-8 scroll-smooth"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {children}
      </div>

      {showControls && canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-card/80 backdrop-blur border border-border flex items-center justify-center hover:bg-card transition-all shadow-lg"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
