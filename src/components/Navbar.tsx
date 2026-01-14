"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavbar } from "@/hooks/useNavbar";
import { logout } from "@/lib/supabase/auth";

import {
  User as UserIcon,
  Clock,
  Menu,
  SearchCode,
  LogOut,
  Hammer
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";

import { Separator } from "@/components/ui/separator";
import type { FullUserData } from "@/lib/types/db";
import { getProfileImageUrl } from "@/lib/supabase/supabase";

type NavItem = {
  showInMinimal?: boolean;
  icon?: React.ReactNode;
  label: string;
  url: string;
  msg?: string;
  func?: () => boolean;
};

const USER_ITEM: NavItem = {
  showInMinimal: true,
  label: "Settings",
  url: "/settings",
  msg: "Opening settings"
};

const LOGIN_ITEM: NavItem = {
  icon: <UserIcon className="h-5 w-5" />,
  label: "Log In",
  url: "/auth/login",
  msg: "Going to login"
};

const NAV_ITEMS: NavItem[] = [
  {
    showInMinimal: true,
    icon: <UserIcon className="h-5 w-5" />,
    label: "Home",
    url: "/"
  },
  {
    icon: <SearchCode className="h-5 w-5" />,
    label: "Scouting",
    url: "/scouting",
    msg: "Scouting is under construction",
    func: () => {
      toast.warning("Scouting is under construction");
      return false;
    }
  },
  {
    icon: <Hammer className="h-5 w-5" />,
    label: "Build",
    url: "/build",
    msg: "its hammertime!"
  },
  {
    icon: <Clock className="h-5 w-5" />,
    label: "Outreach",
    url: "/outreach",
    msg: "ew outreach :("
  }
];

const AUTHED_ITEMS: NavItem[] = [
  {
    showInMinimal: true,
    icon: <LogOut className="h-5 w-5" />,
    label: "Sign Out",
    url: "/",
    msg: "Signing out",
    func: () => {
      logout();
      return false;
    }
  }
];

export type NavItems = typeof NAV_ITEMS;

type NavigateArgs = { url: string; msg?: string; func?: () => boolean };

type SharedProps = {
  user: FullUserData | null;
  navItems: typeof NAV_ITEMS;
  onNavigate: (args: NavigateArgs) => void;
} & ReturnType<typeof useNavbar>;

export default function Navbar() {
  const router = useRouter();

  const { isSmallScreen } = useIsMobile(true);
  const navbar = useNavbar();
  const isMounted = useIsMounted();
  const { user } = useUser();

  const navItems = useMemo(
    () =>
      navbar.variant === "minimal"
        ? NAV_ITEMS.filter((item) => item.showInMinimal)
        : NAV_ITEMS,
    [navbar.variant]
  );

  const onNavigate = ({ url, msg, func = () => true }: NavigateArgs) => {
    if (!func()) return;

    if (msg) toast(msg);
    router.replace(url);
  };

  if (!isMounted || navbar.disabled) return null;

  return (
    <>
      {isSmallScreen ? (
        <MobileNavbar
          {...navbar}
          navItems={navItems}
          user={user || null}
          onNavigate={onNavigate}
        />
      ) : (
        <DesktopNavbar
          {...navbar}
          navItems={navItems}
          user={user || null}
          onNavigate={onNavigate}
        />
      )}
      {isSmallScreen ? <div className="h-16 md:hidden" aria-hidden /> : null}
    </>
  );
}

function MobileNavbar({
  navItems,
  user,
  onNavigate,
  setExpanded
}: SharedProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setExpanded(true);
  }, [setExpanded]);

  const handleNavigation = (item: NavigateArgs) => {
    setIsOpen(false);
    onNavigate(item);
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <div className="fixed inset-x-0 top-0 z-50 border-b border-border bg-card/95 backdrop-blur-xl shadow-sm">
        <div className="flex h-16 items-center justify-between px-4">
          <ProfilePill user={user} />
          <div className="absolute left-1/2 transform -translate-x-1/2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Optix Toolkit
          </div>
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg border border-border bg-muted/40 hover:bg-muted/80">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DrawerTrigger>
        </div>
      </div>

      <DrawerContent className="max-h-[82vh]">
        <DrawerHeader className="pb-2 text-left">
          <DrawerTitle className="text-lg font-semibold text-foreground">
            Navigation
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-4">
          <div className="flex items-center space-x-3 rounded-xl border border-border bg-muted/50 px-3 py-3 shadow-inner">
            <UserBlock user={user} size={"lg"} />
          </div>

          <NavList items={navItems} onSelect={handleNavigation} />

          <Separator className="my-3" />

          {user ? (
            <NavList items={AUTHED_ITEMS} onSelect={handleNavigation} />
          ) : (
            <Button
              variant="default"
              className="w-full justify-start text-left h-12"
              onClick={() => handleNavigation(LOGIN_ITEM)}>
              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Log In</span>
              </div>
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function DesktopNavbar({
  navItems,
  user,
  onNavigate,
  setExpanded,
  defaultExpanded
}: SharedProps) {
  const [isVisible, setIsVisible] = useState(true);
  const navbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setExpanded(isVisible);
  }, [isVisible, setExpanded]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < 100);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const deadband = 12;
      const currentScrollY = window.scrollY;
      const rect = navbarRef.current?.getBoundingClientRect();
      if (!rect) return;

      const withinBounds =
        e.clientY > rect.top - deadband &&
        e.clientY < rect.bottom + deadband &&
        e.clientX > rect.left &&
        e.clientX < rect.right;

      if (withinBounds) {
        setIsVisible(true);
      } else if (currentScrollY >= 100 || !defaultExpanded) {
        setIsVisible(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    if (defaultExpanded) {
      window.addEventListener("scroll", handleScroll);
      handleScroll();
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [defaultExpanded]);

  useEffect(() => {
    setIsVisible(defaultExpanded);
  }, [defaultExpanded]);

  return (
    <div
      ref={navbarRef}
      data-navbar-root
      className={`fixed top-2 left-1/2 z-50 w-max -translate-x-1/2 transform transition-all duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}>
      <div className="rounded-2xl border border-border bg-card/85 px-6 py-3 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between space-x-8">
          <nav className="flex items-center space-x-2">
            <NavList items={navItems} onSelect={onNavigate} inline />
            {user ? (
              <NavList items={AUTHED_ITEMS} onSelect={onNavigate} inline />
            ) : null}
            {user ? (
              <div className="flex items-center space-x-3 border-l border-border pl-5 ml-3">
                <Link
                  href={USER_ITEM.url}
                  className="group flex items-center space-x-3 text-muted-foreground transition-colors hover:text-foreground">
                  <UserBlock user={user} size={"md"} />
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3 border-l border-border pl-6 ml-3">
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={onNavigate.bind(null, LOGIN_ITEM)}>
                  <UserIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Log In</span>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}

function NavList({
  items,
  onSelect,
  inline = false
}: {
  items: NavItem[];
  onSelect: (args: NavigateArgs) => void;
  inline?: boolean;
}) {
  return (
    <div className={inline ? "flex items-center space-x-2" : "space-y-2"}>
      {items.map((item) => (
        <Button
          key={item.label}
          variant={inline ? "ghost" : "ghost"}
          size={inline ? "sm" : "default"}
          className={
            inline
              ? "flex items-center space-x-2 text-muted-foreground hover:text-foreground"
              : "w-full justify-start text-left h-12 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }
          onClick={() =>
            onSelect({ url: item.url, msg: item.msg, func: item.func })
          }>
          <div className={inline ? "h-4 w-4" : "h-5 w-5"}>{item.icon}</div>
          <span
            className={inline ? "text-sm font-medium" : "text-sm font-medium"}>
            {item.label}
          </span>
        </Button>
      ))}
    </div>
  );
}

function UserBlock({
  user,
  size
}: {
  user: FullUserData | null;
  size: "sm" | "md" | "lg";
}) {
  if (!user) return null;

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14"
  };

  return (
    <>
      <Avatar className={`${sizeClasses[size]}`}>
        <AvatarImage
          src={getProfileImageUrl(user)}
          alt={user.user_name || "Unknown Name"}
          className="rounded-full"
        />
        <AvatarFallback className="bg-muted text-muted-foreground text-base rounded-full flex items-center justify-center h-full w-full">
          {(user.user_name || "U").charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm text-foreground">
          {user.user_name || "Unknown User"}
        </span>
        <span className="text-sm text-muted-foreground">
          {user?.user_role
            ? user.user_role.charAt(0).toUpperCase() + user.user_role.slice(1)
            : "? Role ?"}
        </span>
      </div>
    </>
  );
}

function ProfilePill({ user }: { user: FullUserData | null }) {
  if (user) {
    return (
      <Link href={USER_ITEM.url}>
        <Avatar className="h-9 w-9">
          <AvatarImage
            src={getProfileImageUrl(user)}
            alt={user.user_name || "Unknown Name"}
            className="rounded-full"
          />
          <AvatarFallback className="bg-muted text-muted-foreground text-sm rounded-full flex items-center justify-center h-full w-full">
            {(user.user_name || "U").charAt(0)}
          </AvatarFallback>
        </Avatar>
      </Link>
    );
  }

  return (
    <Link
      href={LOGIN_ITEM.url}
      className="inline-flex items-center space-x-2 rounded-full border border-border bg-muted/40 px-3 py-2 text-sm shadow-sm transition-colors hover:bg-muted/80">
      <Avatar className="h-9 w-9">
        <AvatarFallback className="bg-muted text-muted-foreground text-sm rounded-full flex items-center justify-center h-full w-full">
          <UserIcon className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <span className="hidden text-sm font-medium text-foreground sm:inline">
        Log In
      </span>
    </Link>
  );
}
