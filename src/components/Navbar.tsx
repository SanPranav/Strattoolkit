"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";
import { useIsMounted } from "@/hooks/useIsHydrated";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavbar } from "@/hooks/useNavbar";
import { logout } from "@/lib/supabase/auth";

import {
  User as UserIcon,
  Clock,
  Menu,
  SearchCode,
  LogOut,
  BookOpen
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";

import { Separator } from "@/components/ui/separator";
import type { FullUserData, User } from "@/lib/types/db";
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
  msg: "Going to Settings",
  func: () => {
    toast.warning("Under Construction");
    return false;
  }
};

const LOGIN_ITEM: NavItem = {
  icon: <UserIcon className="h-5 w-5" />,
  label: "Log In",
  url: "/auth/login",
  msg: "Going to Login"
};

const NAV_ITEMS: NavItem[] = [
  {
    showInMinimal: true,
    icon: <UserIcon className="h-5 w-5" />,
    label: "Home",
    url: "/",
    msg: ""
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    label: "Kickoff Guide",
    url: "/info/kickoff-guide",
    msg: "Opening Kickoff Guide"
  },
  {
    icon: <SearchCode className="h-5 w-5" />,
    label: "Scouting",
    url: "/scouting",
    msg: "Lets go scout!",
    func: () => {
      toast.warning("Under Construction");
      return false;
    }
  },
  {
    icon: <Clock className="h-5 w-5" />,
    label: "Outreach",
    url: "/outreach",
    msg: "Going to the Outreach Sheet"
  }
  // {
  //   icon: <Settings className="h-5 w-5" />,
  //   label: "Admin",
  //   url: "/admin",
  //   msg: "Going to Admin"
  // }
];

const AUTHED_ITEMS: NavItem[] = [
  {
    showInMinimal: true,
    icon: <LogOut className="h-5 w-5" />,
    label: "Sign Out",
    url: "/",
    msg: "Signing Out",
    func: () => {
      logout();
      return false;
    }
  }
];

export type NavItems = typeof NAV_ITEMS;

type ChildProps = {
  user: FullUserData | null;
  navItems: typeof NAV_ITEMS;
  onNavigate: (url: { url: string; msg?: string }) => void;
} & ReturnType<typeof useNavbar>;

export default function Navbar({ }) {
  const router = useRouter();

  const { isSmallScreen, hasTouch } = useIsMobile(true);
  const state = useNavbar();
  const isHydrated = useIsMounted();

  const { user } = useUser();

  if (!isHydrated) return null; //<NavbarSkeleton navItems={allItems} />;

  const navItems = state.renderMinimal
    ? NAV_ITEMS.filter((item) => item.showInMinimal)
    : NAV_ITEMS;

  const onNavigate = function ({
    url,
    msg,
    func = () => true
  }: {
    url: string;
    msg?: string;
    func?: () => boolean;
  }) {
    if (!func()) return;

    toast(`${msg}`);
    router.replace(url);
  };

  if (state.isDisabled) return;

  return isSmallScreen ? (
    <Mobile {...state} {...{ navItems, user, onNavigate }} />
  ) : (
    <Desktop {...state} {...{ navItems, user, onNavigate }} />
  );
}

function Mobile({
  navItems,
  user,
  mobileNavbarSide,
  onNavigate,
  setExpanded
}: ChildProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setExpanded(isOpen);
  }, [isOpen, setExpanded]);

  const handleNavigation = (item: {
    url: string;
    msg?: string;
    func?: () => boolean;
  }) => {
    setIsOpen(false);
    onNavigate(item);
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={
            `fixed top-4 z-50 h-10 w-10 rounded-lg shadow-lg bg-card/95 backdrop-blur-xl border border-border hover:bg-muted` +
            (mobileNavbarSide === "left" ? " left-4" : " right-4")
          }>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle hidden>Navigation</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-4">
          {/* User Section */}
          {user ? (
            <div className="flex items-center space-x-3 pb-4 border-b border-border">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={getProfileImageUrl(user)}
                  alt={user?.name || "Unknown Name"}
                  className="rounded-full"
                />
                <AvatarFallback className="bg-muted text-muted-foreground text-base rounded-full flex items-center justify-center h-full w-full">
                  {(user?.name || "U").charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-base font-medium text-foreground">
                  {user?.user_metadata?.name || "Unknown User"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {user?.role
                    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                    : "? Role ?"}
                </span>
              </div>
            </div>
          ) : null}

          {/* Navigation Items */}
          <div className="space-y-1">
            {navItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-left h-12 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                onClick={() =>
                  handleNavigation({
                    url: item.url,
                    msg: item.msg,
                    func: item.func
                  })
                }>
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </Button>
            ))}

            <Separator className="my-4" />

            {user ? (
              AUTHED_ITEMS.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left h-12 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  onClick={() =>
                    handleNavigation({
                      url: item.url,
                      msg: item?.msg,
                      func: item?.func
                    })
                  }>
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                </Button>
              ))
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
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function Desktop({
  navItems,
  user,
  onNavigate,
  setExpanded,
  defaultExpanded: defaultToShown
}: ChildProps) {
  const [isVisible, setIsVisible] = useState(true);
  const navbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setExpanded(isVisible);
  }, [isVisible, setExpanded]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY >= 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const DEADBAND = 10;

      const currentScrollY = window.scrollY;
      const rect = navbarRef.current?.getBoundingClientRect();

      if (!rect) return;

      if (
        e.clientY > rect.top - DEADBAND &&
        e.clientY < rect.bottom + DEADBAND &&
        e.clientX > rect.left &&
        e.clientX < rect.right
      ) {
        setIsVisible(true);
      } else if (currentScrollY >= 100 || !defaultToShown) {
        setIsVisible(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    if (defaultToShown) {
      window.addEventListener("scroll", handleScroll);
      handleScroll();
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [defaultToShown, navbarRef, setIsVisible]);

  useEffect(() => {
    setIsVisible(defaultToShown);
  }, [defaultToShown]);

  return (
    <div
      ref={navbarRef}
      data-navbar-root
      className={`fixed top-2 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out w-max ${isVisible ? "translate-y-0" : "-translate-y-full"
        }`}>
      <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl px-6 py-3 transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-between space-x-8 transition-all duration-300 ease-in-out">
          <nav className="flex items-center space-x-2 transition-all duration-300 ease-in-out">
            {navItems.map((item, index) => (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out opacity-100"
                key={index}
                onClick={onNavigate.bind(null, {
                  url: item.url,
                  msg: item.msg,
                  func: item.func
                })}>
                <div className="size-4 transition-all duration-300 ease-in-out">
                  {item.icon}
                </div>
                <span className="text-sm font-medium transition-all duration-300 ease-in-out">
                  {item.label}
                </span>
              </Button>
            ))}

            {user &&
              AUTHED_ITEMS.map((item, index) => (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out opacity-100"
                  key={index}
                  onClick={onNavigate.bind(null, {
                    url: item.url,
                    msg: item.msg,
                    func: item.func
                  })}>
                  <div className="size-4 transition-all duration-300 ease-in-out">
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium transition-all duration-300 ease-in-out">
                    {item.label}
                  </span>
                </Button>
              ))}

            {user ? (
              <div className="flex items-center space-x-3 pl-6 ml-2 border-l border-border">
                <Link
                  href={USER_ITEM.url}
                  className="flex items-center space-x-3 text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out opacity-100 group">
                  <div className="hidden flex-col items-start md:flex">
                    <span className="text-sm font-medium text-foreground underline transition-all duration-200 ease-in-out decoration-transparent group-hover:decoration-current">
                      {user?.name || "Unknown Name"}
                    </span>
                    <span className="text-sm font-sm text-muted-foreground">
                      {user?.role
                        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                        : "? Role ?"}
                    </span>
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={getProfileImageUrl(user)}
                      alt={user?.name || "Unknown Name"}
                      className="rounded-full"
                    />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs rounded-full flex items-center justify-center h-full w-full">
                      {(user?.name || "U").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3 pl-7 ml-2 border-l border-border">
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center space-x-3"
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
