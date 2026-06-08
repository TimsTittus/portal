"use client";

import { Sidebar, coordinatorNavItems } from "@/components/layout/sidebar";
import { MobileNav, coordinatorMobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";

export default function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar items={coordinatorNavItems} role="coordinator" />
      <div className="md:ml-[72px] lg:ml-[240px] flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
      <MobileNav items={coordinatorMobileNav} />
    </div>
  );
}
