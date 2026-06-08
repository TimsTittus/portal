"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { StatsCard } from "@/components/dashboard/stats-card";
import { EventCard } from "@/components/events/event-card";
import { Calendar, Trophy, Award, TrendingUp } from "lucide-react";

interface DashboardData {
  profile: {
    name: string;
    iecdId: string;
    totalPoints: number;
    department: string;
  } | null;
  events: Array<{
    id: string;
    title: string;
    eventType: string;
    venue: string | null;
    startDatetime: string;
    endDatetime: string;
    status: string | null;
    participationPoints: number | null;
  }>;
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData>({
    profile: null,
    events: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, eventsRes] = await Promise.all([
          fetch("/api/student/profile"),
          fetch("/api/events?status=published&limit=5"),
        ]);

        const profile = profileRes.ok ? await profileRes.json() : null;
        const eventsData = eventsRes.ok ? await eventsRes.json() : { events: [] };

        setData({ profile, events: eventsData.events || [] });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const name = data.profile?.name || session?.user?.name || "Student";
  const firstName = name.split(" ")[0];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-xl w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
          Hello {firstName}! 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">
          It&apos;s good to see you again. Here&apos;s your activity overview.
        </p>
      </div>

      {/* IEDC ID Badge */}
      {data.profile?.iecdId && (
        <div className="bg-[#1a1a2e] text-white rounded-2xl p-4 md:p-5 flex items-center justify-between shadow-lg shadow-gray-300/30">
          <div>
            <p className="text-xs text-white/60 font-medium">Your IEDC ID</p>
            <p className="text-lg md:text-xl font-bold tracking-wide mt-0.5">
              {data.profile.iecdId}
            </p>
            <p className="text-xs text-white/50 mt-1">
              {data.profile.department} Department
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Award className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatsCard
          label="Total Points"
          value={data.profile?.totalPoints || 0}
          icon={<TrendingUp />}
        />
        <StatsCard
          label="Events Available"
          value={data.events.length}
          icon={<Calendar />}
        />
        <StatsCard
          label="Rank"
          value="—"
          sublabel="Overall"
          icon={<Trophy />}
        />
        <StatsCard
          label="Certificates"
          value={0}
          icon={<Award />}
        />
      </div>

      {/* Upcoming Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-[#1a1a2e]">
            Upcoming Events
          </h2>
          <a
            href="/student/events"
            className="text-sm text-gray-500 hover:text-[#1a1a2e] font-medium transition-colors"
          >
            View all →
          </a>
        </div>

        {data.events.length > 0 ? (
          <div className="space-y-3">
            {data.events.map((event) => (
              <EventCard key={event.id} {...event} startDatetime={event.startDatetime} endDatetime={event.endDatetime} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No upcoming events</p>
            <p className="text-gray-400 text-sm mt-1">
              Check back soon for new events!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
