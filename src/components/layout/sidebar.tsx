"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Trophy,
  FolderOpen,
  Award,
  User,
  QrCode,
  Lightbulb,
  Settings,
  BarChart3,
  Users,
  ScanLine,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  items: NavItem[];
  role: string;
}

export function Sidebar({ items, role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/auth/login");
            router.refresh();
          },
        },
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-[72px] lg:w-[240px] bg-[#1a1a2e] text-white min-h-screen fixed left-0 top-0 z-40 transition-all duration-300">
      {/* Logo */}
      <div className="flex items-center justify-center lg:justify-start gap-3 px-4 py-6 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
          <span className="text-[#1a1a2e] font-bold text-lg">I.</span>
        </div>
        <span className="hidden lg:block text-lg font-semibold tracking-tight">
          IEDC Portal
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 lg:px-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                "hover:bg-white/10",
                isActive
                  ? "bg-white text-[#1a1a2e] shadow-lg shadow-white/10"
                  : "text-white/70 hover:text-white"
              )}
            >
              <span className="shrink-0 [&>svg]:w-5 [&>svg]:h-5">{item.icon}</span>
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-2 lg:px-3 pb-4 space-y-1 border-t border-white/10 pt-4">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="hidden lg:block">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

// Pre-built nav configs for each role
export const studentNavItems: NavItem[] = [
  { label: "Dashboard", href: "/student/dashboard", icon: <LayoutDashboard /> },
  { label: "Events", href: "/student/events", icon: <Calendar /> },
  { label: "Leaderboard", href: "/student/leaderboard", icon: <Trophy /> },
  { label: "Badges", href: "/student/badges", icon: <Shield /> },
  { label: "Projects", href: "/student/projects", icon: <FolderOpen /> },
  { label: "Certificates", href: "/student/certificates", icon: <Award /> },
  { label: "Profile", href: "/student/profile", icon: <User /> },
];

export const coordinatorNavItems: NavItem[] = [
  { label: "Events", href: "/coordinator/events", icon: <Calendar /> },
  { label: "QR Scanner", href: "/coordinator/scan", icon: <ScanLine /> },
  { label: "Analytics", href: "/coordinator/analytics", icon: <BarChart3 /> },
];

export const execomNavItems: NavItem[] = [
  { label: "Analytics", href: "/execom/analytics", icon: <BarChart3 /> },
  { label: "Users", href: "/execom/users", icon: <Users /> },
  { label: "Events", href: "/execom/events", icon: <Calendar /> },
  { label: "Projects", href: "/execom/projects", icon: <FolderOpen /> },
  { label: "Settings", href: "/execom/settings", icon: <Settings /> },
];

export const facultyNavItems: NavItem[] = [
  { label: "Reports", href: "/faculty/reports", icon: <BarChart3 /> },
  { label: "Events", href: "/faculty/events", icon: <Calendar /> },
  { label: "Projects", href: "/faculty/projects", icon: <FolderOpen /> },
];