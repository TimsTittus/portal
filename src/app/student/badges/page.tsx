"use client";

import { useEffect, useState } from "react";
import { BadgeCard } from "@/components/badges/badge-card";
import type { BadgeCriteria } from "@/lib/points";
import { Sparkles, RefreshCw, Shield, Trophy, Wrench, Users, Zap } from "lucide-react";

interface BadgeData {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  criteria: BadgeCriteria;
  earnedAt: string | null;
}

const CRITERIA_TYPE_META: Record<
  string,
  { label: string; icon: typeof Trophy; color: string; bg: string }
> = {
  points: { label: "Points", icon: Trophy, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
  event_count: { label: "Events", icon: Sparkles, color: "text-[#6EA2F8]", bg: "bg-[#6EA2F8]/10" },
  project_count: { label: "Projects", icon: Wrench, color: "text-[#84C974]", bg: "bg-[#84C974]/10" },
  volunteer_count: { label: "Volunteering", icon: Users, color: "text-[#A78BFA]", bg: "bg-[#A78BFA]/10" },
  streak: { label: "Streak", icon: Zap, color: "text-[#D8615C]", bg: "bg-[#D8615C]/10" },
};

export default function StudentBadgesPage() {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  async function fetchBadges() {
    try {
      const res = await fetch("/api/badges");
      if (res.ok) {
        const data = await res.json();
        setBadges(data.badges || []);
      }
    } catch (e) {
      console.error("Failed to load badges", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBadges();
  }, []);

  async function handleCheck() {
    setChecking(true);
    try {
      const res = await fetch("/api/badges/check", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.newlyAwarded?.length > 0) {
          // Refresh the full list to get updated earned dates
          await fetchBadges();
        }
      }
    } catch (e) {
      console.error("Badge check failed", e);
    } finally {
      setChecking(false);
    }
  }

  const earnedBadges = badges.filter((b) => b.earnedAt);
  const unearnedBadges = badges.filter((b) => !b.earnedAt);

  const filteredEarned =
    filter === "all"
      ? earnedBadges
      : earnedBadges.filter((b) => b.criteria.type === filter);
  const filteredUnearned =
    filter === "all"
      ? unearnedBadges
      : unearnedBadges.filter((b) => b.criteria.type === filter);

  const criteriaTypes = [...new Set(badges.map((b) => b.criteria.type))];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse max-w-5xl">
        <div className="space-y-3">
          <div className="h-10 bg-[#EAE3D2]/50 rounded-2xl w-48" />
          <div className="h-4 bg-[#EAE3D2]/40 rounded-xl w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-[#EAE3D2]/30 rounded-[1.5rem]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-serif font-black text-[#1A1A2E] leading-tight">
            Badges
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm md:text-base font-medium">
            {earnedBadges.length} of {badges.length} badges earned
          </p>
        </div>
        <button
          id="check-badges-btn"
          onClick={handleCheck}
          disabled={checking}
          className="flex items-center gap-2 bg-white border border-[#EAE3D2]/60 px-4 py-2 rounded-full text-xs font-semibold text-[#1A1A2E] hover:bg-[#FAF6EE] hover:shadow-sm transition-all cursor-pointer disabled:opacity-50 w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
          {checking ? "Checking…" : "Check for new badges"}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-[2rem] border border-[#EAE3D2]/70 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Overall Progress
          </span>
          <span className="text-sm font-black text-[#1A1A2E]">
            {earnedBadges.length}/{badges.length}
          </span>
        </div>
        <div className="w-full h-3 bg-[#EAE3D2]/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#6EA2F8] to-[#84C974] rounded-full transition-all duration-300 ease-out"
            style={{
              width: badges.length > 0
                ? `${(earnedBadges.length / badges.length) * 100}%`
                : "0%",
            }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      {criteriaTypes.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${filter === "all"
              ? "bg-[#1A1A2E] text-white shadow-lg shadow-black/10"
              : "bg-white border border-[#EAE3D2]/60 text-gray-500 hover:bg-[#FAF6EE]"
              }`}
          >
            All ({badges.length})
          </button>
          {criteriaTypes.map((type) => {
            const meta = CRITERIA_TYPE_META[type];
            const typeCount = badges.filter((b) => b.criteria.type === type).length;
            const Icon = meta?.icon || Shield;
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${filter === type
                  ? "bg-[#1A1A2E] text-white shadow-lg shadow-black/10"
                  : "bg-white border border-[#EAE3D2]/60 text-gray-500 hover:bg-[#FAF6EE]"
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {meta?.label || type} ({typeCount})
              </button>
            );
          })}
        </div>
      )}

      {/* Earned Badges */}
      {filteredEarned.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-serif font-black text-[#1A1A2E] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#84C974]" />
            Earned
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEarned.map((badge) => (
              <BadgeCard key={badge.id} {...badge} />
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {filteredUnearned.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-serif font-black text-[#1A1A2E] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-300" />
            Locked
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUnearned.map((badge) => (
              <BadgeCard key={badge.id} {...badge} />
            ))}
          </div>
        </div>
      )}

      {/* Empty filter state */}
      {filteredEarned.length === 0 && filteredUnearned.length === 0 && (
        <div className="bg-white rounded-[2.5rem] border border-[#EAE3D2]/60 p-10 text-center shadow-sm">
          <Shield className="w-12 h-12 text-[#EAE3D2] mx-auto mb-4" />
          <p className="text-[#1A1A2E] font-serif font-bold text-lg">
            No badges in this category
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Try selecting a different filter above
          </p>
        </div>
      )}
    </div>
  );
}