import type { NavItems } from "../Navbar";
import { Button } from "../ui/button";

import { Skeleton } from "../ui/skeleton";

export default function NavbarSkeleton({ navItems }: { navItems: NavItems }) {
  return (
    <div
      className={`fixed top-2 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out translate-y-0`}>
      <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl px-6 py-3 transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-between space-x-8 transition-all duration-300 ease-in-out">
          <nav className="flex items-center space-x-2 transition-all duration-300 ease-in-out">
            {navItems.map((item: NavItems[number], index: number) => (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out opacity-100 w-24.5"
                key={index}>
                <Skeleton></Skeleton>
              </Button>
            ))}
          </nav>

          <div className="flex items-center space-x-3 pl-6 border-l border-border">
            <div className="flex flex-col items-start">
              <Skeleton className="h-5 w-24 mb-1"></Skeleton>
              <Skeleton className="h-4 w-16"></Skeleton>
            </div>
            <Skeleton className="h-8 w-8 rounded-full"></Skeleton>
          </div>
        </div>
      </div>
    </div>
  );
}
