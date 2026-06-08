"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Trophy,
  User,
  FolderOpen,
  ScanLine,
  BarChart3,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function MobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  // Show max 5 items on mobile
  const visibleItems = items.slice(0, 5);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around px-2 py-1 safe-bottom">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 min-w-[56px]",
                isActive
                  ? "text-[#1a1a2e]"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <span
                className={cn(
                  "p-1.5 rounded-xl transition-all duration-200 [&>svg]:w-5 [&>svg]:h-5",
                  isActive && "bg-[#1a1a2e] text-white"
                )}
              >
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Pre-built mobile nav configs
export const studentMobileNav: NavItem[] = [
  { label: "Home", href: "/student/dashboard", icon: <LayoutDashboard /> },
  { label: "Events", href: "/student/events", icon: <Calendar /> },
  { label: "Rank", href: "/student/leaderboard", icon: <Trophy /> },
  { label: "Projects", href: "/student/projects", icon: <FolderOpen /> },
  { label: "Profile", href: "/student/profile", icon: <User /> },
];

export const coordinatorMobileNav: NavItem[] = [
  { label: "Events", href: "/coordinator/events", icon: <Calendar /> },
  { label: "Scan", href: "/coordinator/scan", icon: <ScanLine /> },
  { label: "Stats", href: "/coordinator/analytics", icon: <BarChart3 /> },
];
