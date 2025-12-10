import { Search } from "lucide-react";

import { ErrorStateCard } from "@/components/ErrorStateCard";

export default function NotFound() {
  return (
    <ErrorStateCard
      icon={Search}
      iconBackgroundClassName="bg-amber-500/10"
      iconClassName="text-amber-500"
      title="Page Not Found"
      description={
        <>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </>
      }
      errorCode="404"
    />
  );
}
