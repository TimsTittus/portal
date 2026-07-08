"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { BadgeShowcase } from "@/components/badges/badge-showcase";
import { Sparkles } from "lucide-react";
import { DashboardData, PointsEntry } from "./types";
import { PointsOverview } from "./_components/points-overview";
import { PointsHistory } from "./_components/points-history";
import { UpcomingEvents } from "./_components/upcoming-events";

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
          fetch("/api/events?status=active&limit=30"),
        ]);

        const profile = profileRes.ok ? await profileRes.json() : null;
        const eventsData = eventsRes.ok ? await eventsRes.json() : { events: [] };

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const filteredEvents = (eventsData.events || []).filter((e: { startDatetime: string }) => {
          const eventDate = new Date(e.startDatetime);
          return eventDate >= oneWeekAgo;
        });

        setData({ profile, events: filteredEvents });
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

      <PointsOverview
        profile={data.profile}
        eventsCount={data.events.length}
      />

      {/* Badge Showcase */}
      <div className="bg-white rounded-[2rem] border border-[#EAE3D2]/70 p-6 shadow-sm">
        <BadgeShowcase maxDisplay={8} showViewAll />
      </div>

      <PointsHistory
        historyOpen={historyOpen}
        historyLoading={historyLoading}
        historyEntries={historyEntries}
        toggleHistory={toggleHistory}
      />

      <UpcomingEvents events={data.events} />
    </div>
  );
}