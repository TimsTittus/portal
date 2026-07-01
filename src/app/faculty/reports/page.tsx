"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { EventCard } from "@/components/events/event-card";
import {
  Users,
  Calendar,
  UserCheck,
  TrendingUp,
  FolderOpen,
  CheckCircle,
} from "lucide-react";

interface EventData {
  id: string;
  title: string;
  eventType: string;
  venue: string | null;
  startDatetime: string;
  endDatetime: string;
  status: string | null;
  participationPoints: number | null;
}

interface ReportsData {
  totalStudents: number;
  totalEvents: number;
  totalRegistrations: number;
  totalAttendance: number;
  pendingProjects: number;
  approvedProjects: number;
  departmentBreakdown: Array<{ department: string; count: number }>;
  recentEvents: EventData[];
}

export default function FacultyReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/faculty/reports");
        if (res.ok) {
          setData(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-xl w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
          Faculty Reports
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          IEDC activity overview and performance metrics
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
          label="Approved Projects"
          value={data?.approvedProjects || 0}
          icon={<CheckCircle />}
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
                      className="bg-[#1a1a2e] h-full rounded-full transition-all duration-200"
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

      {/* Recent events */}
      <div>
        <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4">
          Recent Events
        </h2>
        {data?.recentEvents && data.recentEvents.length > 0 ? (
          <div className="space-y-3">
            {data.recentEvents.map((event) => (
              <EventCard
                key={event.id}
                {...event}
                linkPrefix="/faculty/events"
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-500 font-medium">No events yet</p>
          </div>
        )}
      </div>
    </div>
  );
}