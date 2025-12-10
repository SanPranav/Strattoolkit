import { Lock } from "lucide-react";

import { ErrorStateCard } from "@/components/ErrorStateCard";
import ServerToaster from "@/components/ServerToaster";
import { sanitizeInternalPath } from "@/lib/utils";

type Props = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export default async function Unauthorized({ searchParams }: Props) {
  const { page, message } = await searchParams;

  const safePage = sanitizeInternalPath(page);
  const retryHref = buildLoginURL(safePage);
  const highlightedPage = safePage ?? "this page";

  return (
    <>
      {message && <ServerToaster message={message} type="error" />}
      <ErrorStateCard
        icon={Lock}
        iconBackgroundClassName="bg-destructive/10"
        iconClassName="text-destructive"
        title="Access Denied"
        description={
          <>
            You don&apos;t have the necessary permissions to access{" "}
            <span className={safePage ? "font-bold" : ""}>
              {highlightedPage}
            </span>
            .
            <br />
            Please contact an administrator if you believe this is an error.
          </>
        }
        errorCode="403"
        retryHref={retryHref}
        retryLabel="Login & Retry"
        dividerLabel="Need access?"
      />
    </>
  );
}

const buildLoginURL = (redirect?: string) => {
  const url = new URL("/auth/login", "http://example.com");

  if (redirect) {
    url.searchParams.set("redirect", redirect);
  }

  return url.pathname + url.search;
};
