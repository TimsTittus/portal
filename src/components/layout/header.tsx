"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, Menu, X, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

  const name = session?.user?.name || "User";
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
        {items.length > 0 && (
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden p-2 rounded-xl hover:bg-[#EAE3D2]/50 text-[#1A1A2E] transition-colors shrink-0 mr-2"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}

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
          <button className="relative p-2 rounded-xl hover:bg-[#EAE3D2]/50 text-[#1A1A2E] transition-colors">
            <Bell className="w-5 h-5 text-gray-700" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <Avatar className="h-9 w-9 bg-[#1A1A2E] cursor-pointer ring-2 ring-[#1A1A2E]/10">
            <AvatarFallback className="bg-[#1A1A2E] text-[#FBF5E8] text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Side Panel Drawer for Mobile */}
      {items.length > 0 && (
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

              {/* Drawer Nav links */}
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
      )}
    </>
  );
}