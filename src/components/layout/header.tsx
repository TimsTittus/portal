"use client";

import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";

export function Header() {
  const { data: session } = useSession();
  const name = session?.user?.name || "User";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-30">
      {/* Search */}
      <div className="hidden md:flex items-center relative w-full max-w-sm">
        <Search className="absolute left-3 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search events, students..."
          className="pl-10 bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-gray-200 rounded-xl h-10"
        />
      </div>

      {/* Mobile title */}
      <div className="md:hidden">
        <h1 className="text-lg font-semibold text-[#1a1a2e]">IEDC Portal</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <Avatar className="h-9 w-9 bg-[#1a1a2e] cursor-pointer">
          <AvatarFallback className="bg-[#1a1a2e] text-white text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
