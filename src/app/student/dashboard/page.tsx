"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { EventCard } from "@/components/events/event-card";
import { BadgeShowcase } from "@/components/badges/badge-showcase";
import {
  Calendar, Trophy, Award, TrendingUp, Sparkles, LogOut, Layout,
  ChevronDown, Zap, Users, Wrench, Lightbulb, Star, Gift, Clock,
} from "lucide-react";

interface PointsEntry {
  activityType: string;
  points: number;
  referenceType: string | null;
  awardedAt: string;
  note: string | null;
}

const ACTIVITY_META: Record<string, { label: string; icon: typeof Zap; color: string; bg: string }> = {
  event_participation: { label: "Event Participation", icon: Calendar, color: "text-[#6EA2F8]", bg: "bg-[#6EA2F8]/10" },
  event_volunteer: { label: "Volunteering", icon: Users, color: "text-[#84C974]", bg: "bg-[#84C974]/10" },
  event_coordinator: { label: "Coordinating", icon: Layout, color: "text-[#A78BFA]", bg: "bg-[#A78BFA]/10" },
  project_submission: { label: "Project Submission", icon: Wrench, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
  competition_winner: { label: "Competition Win", icon: Trophy, color: "text-[#D8615C]", bg: "bg-[#D8615C]/10" },
  workshop_completion: { label: "Workshop Completed", icon: Award, color: "text-[#EC4899]", bg: "bg-[#EC4899]/10" },
  startup_idea: { label: "Startup Idea", icon: Lightbulb, color: "text-[#F97316]", bg: "bg-[#F97316]/10" },
  manual_award: { label: "Manual Award", icon: Gift, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" },
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

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

  // Points history state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<PointsEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFetched, setHistoryFetched] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleHistory = useCallback(async () => {
    const willOpen = !historyOpen;
    setHistoryOpen(willOpen);
    if (willOpen && !historyFetched) {
      setHistoryLoading(true);
      try {
        const res = await fetch("/api/points/history?limit=15");
        if (res.ok) {
          const { history } = await res.json();
          setHistoryEntries(history || []);
        }
      } catch (e) {
        console.error("Failed to load points history", e);
      } finally {
        setHistoryLoading(false);
        setHistoryFetched(true);
      }
    }
  }, [historyOpen, historyFetched]);

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
    <div className="space-y-8 max-w-5xl">
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
        <Link
          href="/student/profile"
          className="bg-[#1A1A2E] text-[#FBF5E8] rounded-[2rem] p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-[#1A1A2E] shadow-xl shadow-black/10 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group cursor-pointer w-full block"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-200" />
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
        </Link>
      )}

      {/* Stats Cards Overhaul */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 - Blue */}
        <Link
          href="/student/profile"
          className="bg-white rounded-[2rem] border border-[#EAE3D2]/70 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#EAE3D2] transition-all h-[150px] cursor-pointer group"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Points</span>
            <div className="w-8 h-8 rounded-xl bg-[#6EA2F8]/10 text-[#6EA2F8] flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-serif font-black text-[#1A1A2E] mt-2">
            {data.profile?.totalPoints || 0}
          </p>
        </Link>

        {/* Stat 2 - Green */}
        <Link
          href="/student/events"
          className="bg-white rounded-[2rem] border border-[#EAE3D2]/70 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#EAE3D2] transition-all h-[150px] cursor-pointer group"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Events Available</span>
            <div className="w-8 h-8 rounded-xl bg-[#84C974]/10 text-[#84C974] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-serif font-black text-[#1A1A2E] mt-2">
            {data.events.length}
          </p>
        </Link>

        {/* Stat 3 - Coral */}
        <Link
          href="/student/leaderboard"
          className="bg-white rounded-[2rem] border border-[#EAE3D2]/70 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#EAE3D2] transition-all h-[150px] cursor-pointer group"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Your Rank</span>
            <div className="w-8 h-8 rounded-xl bg-[#D8615C]/10 text-[#D8615C] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-serif font-black text-[#1A1A2E] mt-2">
            —
          </p>
        </Link>

        {/* Stat 4 - Dark */}
        <Link
          href="/student/certificates"
          className="bg-white rounded-[2rem] border border-[#EAE3D2]/70 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#EAE3D2] transition-all h-[150px] cursor-pointer group"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Certificates</span>
            <div className="w-8 h-8 rounded-xl bg-[#1A1A2E]/10 text-[#1A1A2E] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-3xl md:text-4xl font-serif font-black text-[#1A1A2E] mt-2">
            0
          </p>
        </Link>
      </div>

      {/* Badge Showcase */}
      <div className="bg-white rounded-[2rem] border border-[#EAE3D2]/70 p-6 shadow-sm">
        <BadgeShowcase maxDisplay={8} showViewAll />
      </div>

      {/* Points History — Collapsible */}
      <div className="bg-white rounded-[2rem] border border-[#EAE3D2]/70 shadow-sm overflow-hidden transition-all duration-300">
        <button
          id="points-history-toggle"
          onClick={toggleHistory}
          className="w-full flex items-center justify-between px-6 py-5 group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6EA2F8]/10 text-[#6EA2F8] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div className="text-left">
              <h2 className="text-base font-serif font-black text-[#1A1A2E]">Points History</h2>
              <p className="text-xs text-gray-400 font-medium">Recent activity &amp; earned points</p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${historyOpen ? "rotate-180" : ""
              }`}
          />
        </button>

        <div
          ref={contentRef}
          className="transition-all duration-300 ease-in-out overflow-hidden"
          style={{
            maxHeight: historyOpen ? "1000px" : "0px",
            opacity: historyOpen ? 1 : 0,
          }}
        >
          <div className="px-6 pb-6">
            <div className="border-t border-[#EAE3D2]/50 pt-4">
              {historyLoading ? (
                <div className="flex items-center justify-center py-8 gap-2 text-sm text-gray-400">
                  <div className="w-4 h-4 border-2 border-[#6EA2F8] border-t-transparent rounded-full animate-spin" />
                  Loading history…
                </div>
              ) : historyEntries.length === 0 ? (
                <div className="text-center py-8">
                  <Zap className="w-10 h-10 text-[#EAE3D2] mx-auto mb-3" />
                  <p className="text-sm font-semibold text-[#1A1A2E]">No points yet</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Attend events and submit projects to start earning!
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {historyEntries.map((entry, i) => {
                    const meta = ACTIVITY_META[entry.activityType] || {
                      label: entry.activityType.replace(/_/g, " "),
                      icon: Star,
                      color: "text-gray-500",
                      bg: "bg-gray-100",
                    };
                    const Icon = meta.icon;
                    return (
                      <div
                        key={`${entry.awardedAt}-${i}`}
                        className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-[#FAF6EE]/60 transition-colors"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <div className={`w-8 h-8 rounded-lg ${meta.bg} ${meta.color} flex items-center justify-center shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1A1A2E] truncate">
                            {meta.label}
                          </p>
                          {entry.note && (
                            <p className="text-xs text-gray-400 truncate">{entry.note}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-[#84C974]">+{entry.points}</p>
                          <p className="text-[10px] text-gray-400 font-medium">
                            {timeAgo(entry.awardedAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-serif font-black text-[#1A1A2E]">
            Upcoming Events
          </h2>
          <Link
            href="/student/events"
            className="text-xs md:text-sm text-[#D8615C] font-bold hover:underline transition-colors flex items-center gap-1"
          >
            View all events →
          </Link>
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