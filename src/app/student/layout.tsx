"use client";

import { Sidebar, studentNavItems } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useSession } from "@/lib/auth-client";
import { usePathname } from "next/navigation";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  // If there is no session and they are on the event detail page, render a clean guest layout
  const isEventDetail = pathname.match(/^\/student\/events\/[a-zA-Z0-9-]+$/);
  const showNav = session || !isEventDetail;

  if (!showNav) {
    return (
      <div className="min-h-screen bg-[#FBF5E8] text-[#1A1A2E]">
        <main className="max-w-4xl mx-auto p-4 md:p-8 pb-12">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF5E8] text-[#1A1A2E]">
      <Sidebar items={studentNavItems} role="student" />
      <div className="md:ml-[72px] lg:ml-[240px] flex flex-col min-h-screen">
        <Header items={studentNavItems} role="student" />
        <main className="flex-1 p-4 md:p-8 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
