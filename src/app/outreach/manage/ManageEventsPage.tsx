"use client";

import { useEffect } from "react";

import { useNavbar } from "@/hooks/useNavbar";
import { useIsMounted } from "@/hooks/useIsHydrated";

import Loader from "@/components/Loader";
import ManageEventsContent from "./ManageEventsContent";

export default function ManageEventsPage() {
  const { setDefaultExpanded, resetNavbar } = useNavbar();
  const isHydrated = useIsMounted();

  useEffect(() => {
    setDefaultExpanded(false);

    return () => {
      resetNavbar();
    };
  }, [setDefaultExpanded, resetNavbar]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  return <ManageEventsContent variant="page" />;
}
