import { ErrorStateCard } from "@/components/ErrorStateCard";
import ServerToaster from "@/components/ServerToaster";
import { isValidPathname, sanitizePathname } from "@/lib/utils";
import { OctagonAlert } from "lucide-react";

export default async function ErrorPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { next, message } = await searchParams;

  const nextPage = sanitizePathname(next ?? "/");
  const highlightedPage = nextPage ?? "this page";

  return (
    <>
      {message && (
        <ServerToaster message={message} type="error" duration={10000} />
      )}
      <ErrorStateCard
        icon={OctagonAlert}
        iconBackgroundClassName="bg-destructive/10"
        iconClassName="text-destructive"
        title="Error"
        description={
          <>
            Something went wrong while trying to access{" "}
            <span className={nextPage ? "font-bold" : ""}>
              {highlightedPage}
            </span>
            .
            {message && (
              <>
                <br />
                <span className="font-mono text-sm text-destructive">
                  {message}
                </span>
              </>
            )}
          </>
        }
      />
    </>
  );
}
