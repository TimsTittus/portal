"use client";

import { StatsCard } from "@/components/dashboard/stats-card";
import { Calendar, Users, TrendingUp } from "lucide-react";

export default function CoordinatorAnalyticsPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
          Analytics
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Track your event performance
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatsCard label="Events Created" value={0} icon={<Calendar />} />
        <StatsCard label="Total Registrations" value={0} icon={<Users />} />
        <StatsCard label="Attendance Rate" value="—" icon={<TrendingUp />} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
        <p className="text-gray-500 font-medium">
          Create events to see analytics
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Data will appear once you start managing events
        </p>
      </div>
    </div>
  );
}
