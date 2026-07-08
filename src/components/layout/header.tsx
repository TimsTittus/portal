"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, Menu, X, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface HeaderProps {
  items?: NavItem[];
  role?: string;
}

export function Header({ items = [], role = "user" }: HeaderProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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

  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
    <>
      <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-[#FBF5E8]/80 backdrop-blur-xl border-b border-[#EAE3D2]/40 sticky top-0 z-30">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden p-2 rounded-xl hover:bg-[#EAE3D2]/50 text-[#1A1A2E] transition-colors shrink-0 mr-2"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center relative w-full max-w-sm">
          <Search className="absolute left-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search events, students..."
            className="pl-10 bg-[#FAF6EE]/60 border border-[#EAE3D2]/50 focus-visible:ring-1 focus-visible:ring-[#1A1A2E] rounded-xl h-10"
          />
        </div>

        {/* Mobile title */}
        <div className="md:hidden flex-1 text-left">
          <h1 className="text-lg font-serif font-black text-[#1A1A2E] tracking-tight">IEDC Portal</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Points display (Desktop/Mobile) */}
          {points !== null && (
            <div className="bg-[#1A1A2E] text-[#FBF5E8] px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5 border border-[#1A1A2E]/10 shrink-0">
              <span className="opacity-90">✨</span>
              <span>{points} pts</span>
            </div>
          )}

          {/* Execom role display (Desktop/Mobile) */}
          {roleDisplay && (
            <div className="bg-[#D8615C] text-white px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-sm border border-[#D8615C]/15 shrink-0">
              👑 {roleDisplay}
            </div>
          )}

          <button className="relative p-2 rounded-xl hover:bg-[#EAE3D2]/50 text-[#1A1A2E] transition-colors shrink-0">
            <Bell className="w-5 h-5 text-gray-700" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <Link href={`/${role === "user" ? "student" : role}/profile`} className="shrink-0">
            <Avatar className="h-9 w-9 bg-[#1A1A2E] cursor-pointer ring-2 ring-[#1A1A2E]/10">
              {session?.user?.image && (
                <AvatarImage src={session.user.image} alt={name} className="object-cover" />
              )}
              <AvatarFallback className="bg-[#1A1A2E] text-[#FBF5E8] text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      {/* Side Panel Drawer for Mobile */}
      <>
        {/* Backdrop */}
        <div
          className={cn(
            "fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300",
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setIsOpen(false)}
        />

        {/* Drawer */}
        <div
          className={cn(
            "fixed top-0 left-0 bottom-0 w-[280px] bg-[#1A1A2E] text-white p-6 z-50 md:hidden flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="space-y-6">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FBF5E8] flex items-center justify-center shrink-0">
                  <span className="text-[#1A1A2E] font-serif font-bold text-base">I.</span>
                </div>
                <span className="text-base font-serif font-bold tracking-tight text-white">
                  IEDC Portal
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Drawer User Card */}
            {session?.user && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 mb-4">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-white/10">
                  {session.user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={session.user.image} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-xs font-bold">
                      {initials}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate text-white leading-tight">{name}</p>
                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    {roleDisplay && (
                      <span className="text-[10px] font-black text-[#D8615C] bg-[#D8615C]/10 px-1 py-0.2 rounded border border-[#D8615C]/20 uppercase tracking-wide">
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

            {/* Drawer Nav links */}
            {items.length > 0 && (
              <nav className="space-y-1">
                {items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-[#FBF5E8] text-[#1A1A2E] shadow-lg shadow-white/5"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      )}
                    >
                      <span className="shrink-0 [&>svg]:w-5 [&>svg]:h-5">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="border-t border-white/10 pt-4">
            <button
              onClick={() => {
                setIsOpen(false);
                handleSignOut();
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200 w-full"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </>
    </>
  );
}