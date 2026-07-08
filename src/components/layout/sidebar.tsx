"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Trophy,
  FolderOpen,
  Award,
  User,
  Settings,
  BarChart3,
  Users,
  ScanLine,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "@/lib/auth-client";

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
  const { data: session } = useSession();

  const [points, setPoints] = useState<number | null>(null);

  const name = session?.user?.name || "User";
  const userRole = ((session?.user as Record<string, unknown>)?.role as string) || role;
  const execomRoles = [
    "ceo", "cto", "to", "cfo", "fo", "cco", "co", "cio", "io", "cmo", "mo", "coo", "oo", "cso", "so", "cvo", "vo", "cwit", "wit"
  ];
  const isExecom = execomRoles.includes(userRole || "");
  const roleDisplay = isExecom ? (userRole || "").toUpperCase() : "";

  useEffect(() => {
    if (session?.user && (userRole === "student" || isExecom)) {
      fetch("/api/student/profile")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.totalPoints === "number") {
            setPoints(data.totalPoints);
          }
        })
        .catch((err) => console.error("Error loading points:", err));
    }
  }, [session, userRole, isExecom]);

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
      <div className="px-2 lg:px-3 pb-4 space-y-2 border-t border-white/10 pt-4">
        {/* User profile section inside sidebar (Desktop only) */}
        {session?.user && (
          <div className="hidden lg:flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 mb-1.5">
            <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-white/10">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-xs font-bold">
                  {name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate text-white leading-tight">{name}</p>
              <div className="flex flex-wrap items-center gap-1 mt-1">
                {roleDisplay && (
                  <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 px-1 py-0.2 rounded border border-amber-400/20 uppercase tracking-wide">
                    {roleDisplay}
                  </span>
                )}
                {points !== null && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1 py-0.2 rounded border border-emerald-400/20">
                    ✨ {points} pts
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

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