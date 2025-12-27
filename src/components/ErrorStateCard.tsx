import Link from "next/link";
import { ReactNode } from "react";
import { Home, MessageCircle, RotateCcw, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";
import { RetryButton } from "@/components/RetryButton";

type ErrorStateCardProps = {
  icon: LucideIcon;
  iconBackgroundClassName?: string;
  iconClassName?: string;
  title: ReactNode;
  description: ReactNode;
  errorCode?: string | number;
  retryHref?: string;
  retryLabel?: string;
  goHomeHref?: string;
  goHomeLabel?: string;
  contactLabel?: string;
  contactButtonId?: string;
  dividerLabel?: string;
};

export function ErrorStateCard({
  icon: Icon,
  iconBackgroundClassName = "bg-primary/10",
  iconClassName = "text-primary",
  title,
  description,
  errorCode,
  retryHref,
  retryLabel,
  goHomeHref = "/",
  goHomeLabel = "Go Home",
  contactLabel = "Contact Support",
  contactButtonId = "ph-feedback-survey",
  dividerLabel = "Need help?"
}: ErrorStateCardProps) {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Card className="bg-card/80 backdrop-blur-xl border border-border shadow-2xl">
          <CardHeader className="text-center">
            <div
              className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${iconBackgroundClassName}`}>
              <Icon className={`h-10 w-10 ${iconClassName}`} />
            </div>
            <CardTitle className="text-2xl text-foreground">{title}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {retryHref ? (
                <Button variant="outline" asChild className="w-full">
                  <Link href={retryHref}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {retryLabel ?? "Retry"}
                  </Link>
                </Button>
              ) : (
                <RetryButton label={retryLabel} />
              )}
              <Button
                variant="outline"
                asChild
                className="w-full !bg-primary/20 text-primary">
                <Link href={goHomeHref}>
                  <Home className="h-4 w-4 mr-2" />
                  {goHomeLabel}
                </Link>
              </Button>
              <BackButton />
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  {dividerLabel}
                </span>
              </div>
              <Button
                id={contactButtonId}
                variant="outline"
                asChild
                className="w-full">
                <div>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {contactLabel}
                </div>
              </Button>
            </div>
            {errorCode ? (
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Error Code:{" "}
                  <span className="font-mono text-foreground">{errorCode}</span>
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
