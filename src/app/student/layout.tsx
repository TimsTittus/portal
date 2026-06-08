"use client";

import { Sidebar, studentNavItems } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
