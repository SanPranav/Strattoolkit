"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  Rocket, 
  Cpu, 
  Wrench, 
  Trophy, 
  Database, 
  ShieldCheck,
  ChevronRight
} from "lucide-react";

const navigation = [
  {
    title: "Info Index",
    items: [
      { title: "Introduction", href: "/info", icon: BookOpen },
      { title: "Kickoff Guide", href: "/info/kickoff-guide", icon: Rocket },
    ],
  },
  {
    title: "Core concepts",
    items: [
      { title: "Strategic Design", href: "/info/kickoff-guide/strategic-design", icon: Cpu },
      { title: "Mechanism Design", href: "/info/kickoff-guide/mechanism-design", icon: Wrench },
      { title: "Build Season", href: "/info/kickoff-guide/build-season", icon: Rocket },
      { title: "Competition Season", href: "/info/kickoff-guide/competition-season", icon: Trophy },
      { title: "Scouting & Data", href: "/info/kickoff-guide/scouting-data", icon: Database },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "Strategy Overview", href: "/info/strategy", icon: BookOpen },
      { title: "Privacy & Policies", href: "/info/privacy", icon: ShieldCheck },
    ],
  },
];

interface InfoSidebarProps {
  /** When true, sidebar is not fixed (e.g. inside a sheet/drawer) */
  embedded?: boolean;
}

export function InfoSidebar({ embedded }: InfoSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "shrink-0 border-r border-sidebar-border bg-sidebar/50 overflow-y-auto",
        embedded ? "w-full border-r-0" : "fixed left-0 top-0 h-screen w-64"
      )}
    >
      <nav className="p-4 space-y-6">
        {navigation.map((section) => (
          <div key={section.title}>
            <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1">{item.title}</span>
                      {isActive && <ChevronRight className="w-4 h-4" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

