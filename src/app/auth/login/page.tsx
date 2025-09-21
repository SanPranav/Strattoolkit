"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useNavbar } from "@/hooks/useNavbar";
import { loginEmailPass, loginOAuth } from "@/lib/auth";
import { BaseStates, SimpleLoginStates } from "@/lib/states";

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
import SkeletonLoginForm from "./SkeletonLoginForm";

export default function LoginForm() {
  const { setRenderOnlyHome, setDefaultShown } = useNavbar();

  const router = useRouter();
  const isHydrated = useIsHydrated();

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const redirectToHome = useCallback(() => {
    console.log("Redirecting ...");

    router.prefetch("/");

    setTimeout(() => {
      router.push("/");
      toast.dismiss();
    }, 300);
  }, [router]);

  const handleOAuth = async function (type: "discord" | "google") {
    toast.loading("Continue on the popup ...", {
      id: "oAuthLoader"
    });
    const state = await loginOAuth(type);

    switch (state) {
      case BaseStates.SUCCESS:
        toast.success("Login successful!", { id: "oAuthLoader" });
        redirectToHome();
        break;
      case BaseStates.ERROR:
      default:
        toast.error("Something went wrong :(", { id: "oAuthLoader" });
        break;
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = new FormData(e.currentTarget);
      let email = formData.get("email")?.toString();
      let password = formData.get("password")?.toString();

      console.log("Form submitted with:", { email, password });

      if (!email || !password) {
        toast.error("Email and password are required.");
        return;
      }

      setLoginData({
        email,
        password
      });

      toast.dismiss();
      toast.loading("Logging In ...", { id: "sLoader" });

      let state = SimpleLoginStates.ERR_UNKNOWN;
      state = await loginEmailPass(email, password);

      switch (state) {
        case SimpleLoginStates.SUCCESS:
          toast.success("Login successful!", { id: "sLoader" });
          redirectToHome();
          break;
        case SimpleLoginStates.ERR_EMAIL_NOT_PROVIDED:
          toast.error("Email is required.", { id: "sLoader" });
          break;
        case SimpleLoginStates.ERR_PASSWORD_NOT_PROVIDED:
          toast.error("Password is required.", { id: "sLoader" });
          break;
        case SimpleLoginStates.ERR_INVALID_EMAIL:
          toast.error("Please enter a valid email address.", { id: "sLoader" });
          break;
        case SimpleLoginStates.ERR_PASSWORD_TOO_SHORT:
          toast.error("Password must be at least 8 characters long.", {
            id: "sLoader"
          });
          break;
        case SimpleLoginStates.ERR_EMAIL_NOT_FOUND:
          toast.error("Email not found. Please check your email.", {
            id: "sLoader"
          });
          break;
        case SimpleLoginStates.ERR_INCORRECT_PASSWORD:
          toast.error("Incorrect password. Please try again.", {
            id: "sLoader"
          });
          break;
        case SimpleLoginStates.ERR_USER_USES_OAUTH:
          toast.error(
            "Hmm... It looks like you signed up using OAuth. Please use Google or Discord to login."
          );
          break;
        case SimpleLoginStates.ERR_UNKNOWN:
        default:
          toast.error("Something went wrong. Please try again later.", {
            id: "sLoader"
          });
          break;
      }
    },
    [loginData, redirectToHome]
  );

  useEffect(() => {
    setRenderOnlyHome(true);
    setDefaultShown(false);

    return () => {
      setRenderOnlyHome(false);
      setDefaultShown(true);
    };
  }, [handleSubmit, setDefaultShown, setRenderOnlyHome]);

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
                        <a
                          href="/auth/forgot"
                          className="ml-auto text-sm underline-offset-4 hover:underline text-muted-foreground hover:text-foreground">
                          Forgot your password?
                        </a>
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
                  <a
                    href="/auth/signup"
                    className="underline underline-offset-4 text-foreground hover:text-primary">
                    Sign Up
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
