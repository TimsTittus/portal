"use client";

import { Sidebar, execomNavItems } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function ExecomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar items={execomNavItems} role="execom" />
      <div className="md:ml-[72px] lg:ml-[240px] flex flex-col min-h-screen">
        <Header items={execomNavItems} role="execom" />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}