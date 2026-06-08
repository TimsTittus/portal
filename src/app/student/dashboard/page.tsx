"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { EventCard } from "@/components/events/event-card";
import { Calendar, Trophy, Award, TrendingUp, Sparkles, LogOut, Layout } from "lucide-react";

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
      <div className="space-y-8 animate-pulse max-w-5xl">
        <div className="space-y-3">
          <div className="h-10 bg-[#EAE3D2]/50 rounded-2xl w-64" />
          <div className="h-4 bg-[#EAE3D2]/40 rounded-xl w-96" />
        </div>
        <div className="h-32 bg-[#EAE3D2]/40 rounded-[2rem] w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-[#EAE3D2]/40 rounded-3xl" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-8 bg-[#EAE3D2]/50 rounded-xl w-48" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-[#EAE3D2]/30 rounded-[1.5rem]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in duration-500">
      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-serif font-black text-[#1A1A2E] leading-tight">
            Hello {firstName}! 👋
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm md:text-base font-medium">
            It&apos;s great to see you. Here&apos;s your innovation portfolio summary.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#FAF6EE] border border-[#EAE3D2]/60 px-4 py-2 rounded-full text-xs font-semibold text-[#1A1A2E] w-fit">
          <Sparkles className="w-4 h-4 text-[#D8615C]" />
          IEDC Active Innovator
        </div>
      </div>

      {/* IEDC ID Badge Card */}
      {data.profile?.iecdId && (
        <div className="bg-[#1A1A2E] text-[#FBF5E8] rounded-[2rem] p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-[#1A1A2E] shadow-xl shadow-black/10 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500" />
          <div className="space-y-2 relative z-10">
            <p className="text-xs uppercase tracking-widest text-[#FBF5E8]/60 font-bold">Official IEDC ID</p>
            <p className="text-2xl md:text-3.5xl font-serif font-black tracking-wide">
              {data.profile.iecdId}
            </p>
            <p className="text-xs font-semibold text-[#FAF6EE]/75 bg-white/10 px-3 py-1 rounded-full w-fit">
              {data.profile.department} Department
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#FBF5E8] text-[#1A1A2E] flex items-center justify-center shrink-0 shadow-lg shadow-black/10 self-start sm:self-center">
            <Award className="w-7 h-7" />
          </div>
        </div>
      )}

      {/* Stats Cards Overhaul */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 - Blue */}
        <div className="bg-white rounded-[2rem] border border-[#EAE3D2]/70 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#EAE3D2] transition-all h-[150px]">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Points</span>
            <div className="w-8 h-8 rounded-xl bg-[#6EA2F8]/10 text-[#6EA2F8] flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-serif font-black text-[#1A1A2E] mt-2">
            {data.profile?.totalPoints || 0}
          </p>
        </div>

        {/* Stat 2 - Green */}
        <div className="bg-white rounded-[2rem] border border-[#EAE3D2]/70 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#EAE3D2] transition-all h-[150px]">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Events Available</span>
            <div className="w-8 h-8 rounded-xl bg-[#84C974]/10 text-[#84C974] flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-serif font-black text-[#1A1A2E] mt-2">
            {data.events.length}
          </p>
        </div>

        {/* Stat 3 - Coral */}
        <div className="bg-white rounded-[2rem] border border-[#EAE3D2]/70 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#EAE3D2] transition-all h-[150px]">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Your Rank</span>
            <div className="w-8 h-8 rounded-xl bg-[#D8615C]/10 text-[#D8615C] flex items-center justify-center">
              <Trophy className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-serif font-black text-[#1A1A2E] mt-2">
            —
          </p>
        </div>

        {/* Stat 4 - Dark */}
        <div className="bg-white rounded-[2rem] border border-[#EAE3D2]/70 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#EAE3D2] transition-all h-[150px]">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Certificates</span>
            <div className="w-8 h-8 rounded-xl bg-[#1A1A2E]/10 text-[#1A1A2E] flex items-center justify-center">
              <Award className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-serif font-black text-[#1A1A2E] mt-2">
            0
          </p>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-serif font-black text-[#1A1A2E]">
            Upcoming Events
          </h2>
          <a
            href="/student/events"
            className="text-xs md:text-sm text-[#D8615C] font-bold hover:underline transition-colors flex items-center gap-1"
          >
            View all events →
          </a>
        </div>

        {data.events.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {data.events.map((event) => (
              <EventCard
                key={event.id}
                {...event}
                startDatetime={event.startDatetime}
                endDatetime={event.endDatetime}
                className="bg-white rounded-[1.5rem] border border-[#EAE3D2]/70 p-5 shadow-sm hover:shadow-md hover:border-[#EAE3D2] transition-all"
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-[#EAE3D2]/60 p-10 text-center shadow-sm">
            <Calendar className="w-12 h-12 text-[#EAE3D2] mx-auto mb-4" />
            <p className="text-[#1A1A2E] font-serif font-bold text-lg">No upcoming events</p>
            <p className="text-gray-400 text-xs mt-1">
              Check back soon for new hackathons and workshops!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
