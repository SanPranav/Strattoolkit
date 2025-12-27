"use client";

import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type Props = {
  label?: string;
  className?: string;
};

export function RetryButton({ label = "Retry", className }: Props) {
  const router = useRouter();
  const combinedClassName = className ? `w-full ${className}` : "w-full";

  const handleRetry = () => {
    router.refresh();
  };

  return (
    <Button
      variant="outline"
      onClick={handleRetry}
      className={combinedClassName}>
      <RotateCcw className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}
