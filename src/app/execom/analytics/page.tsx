"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Users, Calendar, UserCheck, FolderOpen, TrendingUp, BarChart3 } from "lucide-react";

interface AnalyticsData {
  totalStudents: number;
  totalEvents: number;
  totalRegistrations: number;
  totalAttendance: number;
  pendingProjects: number;
  totalUsers: number;
  departmentBreakdown: Array<{ department: string; count: number }>;
}

export default function ExecomAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/analytics/overview");
        if (res.ok) {
          setData(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-xl w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
          Analytics Dashboard
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Overview of the IEDC portal
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <StatsCard
          label="Total Students"
          value={data?.totalStudents || 0}
          icon={<Users />}
        />
        <StatsCard
          label="Total Events"
          value={data?.totalEvents || 0}
          icon={<Calendar />}
        />
        <StatsCard
          label="Registrations"
          value={data?.totalRegistrations || 0}
          icon={<UserCheck />}
        />
        <StatsCard
          label="Attendance"
          value={data?.totalAttendance || 0}
          icon={<TrendingUp />}
        />
        <StatsCard
          label="Pending Projects"
          value={data?.pendingProjects || 0}
          icon={<FolderOpen />}
        />
        <StatsCard
          label="Total Users"
          value={data?.totalUsers || 0}
          icon={<BarChart3 />}
        />
      </div>

      {/* Department breakdown */}
      {data?.departmentBreakdown && data.departmentBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-[#1a1a2e] mb-4">
            Students by Department
          </h2>
          <div className="space-y-3">
            {data.departmentBreakdown.map((dept) => {
              const percentage =
                data.totalStudents > 0
                  ? Math.round((dept.count / data.totalStudents) * 100)
                  : 0;
              return (
                <div key={dept.department} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-[#1a1a2e] w-12">
                    {dept.department}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-[#1a1a2e] h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-16 text-right tabular-nums">
                    {dept.count} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
