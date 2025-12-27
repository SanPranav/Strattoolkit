import { Ban } from "lucide-react";

import { ErrorStateCard } from "@/components/ErrorStateCard";
import { sanitizeInternalPath } from "@/lib/utils";

type Props = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export default async function DisabledPage({ searchParams }: Props) {
  const { page } = await searchParams;

  const safePage = sanitizeInternalPath(page);
  const retryHref = safePage ?? "/";
  const titleContent = safePage ? (
    <>
      <span className="font-bold">{safePage}</span> Disabled
    </>
  ) : (
    "Page Disabled"
  );

  return (
    <ErrorStateCard
      icon={Ban}
      iconBackgroundClassName="bg-destructive/10"
      iconClassName="text-destructive"
      title={titleContent}
      description={
        <>
          <span className={safePage ? "font-bold" : ""}>
            {safePage ?? "This page"}
          </span>{" "}
          is unavailable. If you believe this is a mistake, please let us know.
        </>
      }
      retryHref={retryHref}
      retryLabel="Try Again"
      dividerLabel="Need assistance?"
    />
  );
}
