"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useNavbar } from "@/hooks/useNavbar";
import { loginEmailPass, loginOAuth } from "@/lib/supabase/auth";
import { BaseStates, LoginStates, stateToMessage } from "@/lib/types/states";
import { logger } from "@/lib/logger";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordBlock from "../PasswordBlock";
import SkeletonLoginForm from "./SkeletonLoginForm";
import { sanitizePathname } from "@/lib/utils";

export default function LoginForm() {
  const router = useRouter();
  const { setVariant, setDefaultExpanded, resetNavbar } = useNavbar();
  const isHydrated = useIsMounted();
  const searchParams = useSearchParams();

  const redirectUrl = sanitizePathname(searchParams.get("next") || "/");

  const handleOAuth = async function (type: "discord" | "google") {
    toast.loading("Continue on the popup ...", {
      id: "loginOAuthToast"
    });

    const state = await loginOAuth(type, redirectUrl);

    switch (state) {
      case BaseStates.SUCCESS:
        toast.success("Login successful!", { id: "loginOAuthToast" });
        logger.info({ provider: type }, "OAuth login successful");
        break;
      case BaseStates.ERROR:
      default:
        toast.error("Something went wrong :(", { id: "loginOAuthToast" });
        logger.error({ provider: type }, "OAuth login failed");
        break;
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      toast.loading("Logging In ...", { id: "loginEmailPassToast" });

      const formData = new FormData(e.currentTarget);
      const email = formData.get("email")?.toString();
      const password = formData.get("password")?.toString();

      if (!email || !password) {
        toast.error("Email and password are required.", {
          id: "loginEmailPassToast"
        });
        return;
      }

      const state = await loginEmailPass(email, password);

      switch (state) {
        case LoginStates.SUCCESS:
          toast.success("Login successful!", { id: "loginEmailPassToast" });
          logger.info({ email }, "Password login successful");
          router.push(redirectUrl);
          break;
        default:
          toast.error(stateToMessage(state), {
            id: "loginEmailPassToast"
          });
          break;
      }
    },
    []
  );

  useEffect(() => {
    setVariant("minimal");
    setDefaultExpanded(false);

    return () => {
      resetNavbar();
    };
  }, [setDefaultExpanded, setVariant, resetNavbar]);

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-6">
          <Card className="bg-card/80 backdrop-blur-xl border border-border shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-foreground">
                Welcome back
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Use your Google or Discord account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleOAuth.bind(null, "google")}>
                    <Image
                      src="/google.svg"
                      alt="Google Logo"
                      className="mr-2"
                      width={16}
                      height={16}
                    />
                    Continue with Google
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleOAuth.bind(null, "discord")}>
                    <Image
                      src="/discord.svg"
                      alt="Discord Logo"
                      className="mr-2"
                      width={16}
                      height={16}
                    />
                    Continue with Discord
                  </Button>
                </div>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </div>
                {isHydrated ? (
                  <form className="grid gap-6" onSubmit={handleSubmit}>
                    <div className="grid gap-3">
                      <Label htmlFor="email" className="text-foreground">
                        Email
                      </Label>
                      <Input
                        name="email"
                        type="text"
                        placeholder="m@example.com"
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                        autoComplete="email"
                      />
                    </div>
                    <div className="grid gap-3">
                      <div className="flex items-center">
                        <Label htmlFor="password" className="text-foreground">
                          Password
                        </Label>
                        <Link
                          href="/auth/forgot"
                          className="ml-auto text-sm underline-offset-4 hover:underline text-muted-foreground hover:text-foreground">
                          Forgot your password?
                        </Link>
                      </div>
                      <PasswordBlock
                        name="password"
                        className="bg-input border-border text-foreground"
                        autoComplete="current-password"
                        autoCorrect="off"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Login
                    </Button>
                  </form>
                ) : (
                  <SkeletonLoginForm />
                )}
                <div className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="underline underline-offset-4 text-foreground hover:text-primary">
                    Sign Up
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
