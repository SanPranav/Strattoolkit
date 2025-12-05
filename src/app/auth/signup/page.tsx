"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useIsMounted } from "@/hooks/useIsHydrated";
import { useNavbar } from "@/hooks/useNavbar";
import { loginOAuth, signupEmailPass } from "@/lib/supabase/auth";
import { BaseStates, SignupStates, stateToMessage } from "@/lib/types/states";
import { logger } from "@/lib/logger";

import Image from "next/image";
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
import SkeletonSignupForm from "./SkeletonSignupForm";
import Link from "next/link";
import { safeParseSearchParams } from "@/lib/utils";

export default function SignupForm() {
  const [redirectRoute, setRedirectRoute] = useState("/");

  const { doMinimalRendering, setDefaultExpanded } = useNavbar();
  const router = useRouter();
  const isHydrated = useIsMounted();

  useEffect(() => {
    const params = safeParseSearchParams(window.location.search);
    const redirect = params?.get("redirect");

    if (redirect?.startsWith("/") && !redirect.startsWith("//")) {
      setRedirectRoute(redirect);
    }
  }, []);

  const runRedirect = useCallback(() => {
    toast.dismiss();
    router.push(redirectRoute);
  }, [router, redirectRoute]);

  const handleOAuth = async function (type: "discord" | "google") {
    toast.loading("Continue on the popup ...", { id: "oAuthLoader" });

    const state = await loginOAuth(type);

    switch (state) {
      case BaseStates.SUCCESS:
        toast.success("Login successful!", { id: "oAuthLoader" });
        logger.info({ provider: type }, "OAuth signup/login successful");
        runRedirect();
        break;
      case BaseStates.ERROR:
      default:
        toast.error("Something went wrong :(", { id: "oAuthLoader" });
        logger.error({ provider: type }, "OAuth signup/login failed");
        break;
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = new FormData(e.currentTarget);
      let name = formData.get("name")?.toString();
      let email = formData.get("email")?.toString();
      const password1 = formData.get("password1")?.toString();
      const password2 = formData.get("password2")?.toString();

      if (!name || !email || !password1 || !password2) {
        toast.error("Please fill in all fields.");
        return;
      }

      name = name.trim();
      email = email.trim();
      toast.success("Login successful!", { id: "aLoader" });
      logger.info({ email }, "Password signup successful");

      let state = SignupStates.ERR_UNKNOWN;
      state = await signupEmailPass(email, password1, password2, name);

      switch (state) {
        case SignupStates.SUCCESS:
          toast.success("Login successful!", { id: "aLoader" });
          logger.info({ email }, "Password login successful");
          runRedirect();
          break;
        default:
          toast.error(stateToMessage(state), {
            id: "aLoader"
          });
          break;
      }
    },
    [runRedirect]
  );

  useEffect(() => {
    doMinimalRendering(true);
    setDefaultExpanded(false);

    return () => {
      doMinimalRendering(false);
      setDefaultExpanded(true);
    };
  }, [setDefaultExpanded, doMinimalRendering]);

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-6">
          <Card className="bg-card/80 backdrop-blur-xl border border-border shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-foreground">
                Create an Account
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
                      <div className="flex items-center">
                        <Label htmlFor="name" className="text-foreground">
                          Display Name
                        </Label>
                      </div>
                      <Input
                        name="name"
                        type="text"
                        className="bg-input border-border text-foreground"
                        autoCorrect="off"
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="email" className="text-foreground">
                        Email
                      </Label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="m@example.com"
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                        autoComplete="email"
                      />
                    </div>
                    <div className="grid gap-3">
                      <div className="flex items-center">
                        <Label htmlFor="password1" className="text-foreground">
                          Password
                        </Label>
                      </div>
                      <PasswordBlock
                        name="password1"
                        className="bg-input border-border text-foreground"
                        autoComplete="new-password"
                        autoCorrect="off"
                      />
                    </div>
                    <div className="grid gap-3">
                      <div className="flex items-center">
                        <Label htmlFor="password2" className="text-foreground">
                          Confirm Password
                        </Label>
                      </div>
                      <PasswordBlock
                        name="password2"
                        className="bg-input border-border text-foreground"
                        autoComplete="new-password"
                        autoCorrect="off"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Sign Up
                    </Button>
                  </form>
                ) : (
                  <SkeletonSignupForm />
                )}
                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="underline underline-offset-4 text-foreground hover:text-primary">
                    Log In
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
