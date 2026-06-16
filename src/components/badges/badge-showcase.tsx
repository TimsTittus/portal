"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCard } from "./badge-card";
import type { BadgeCriteria } from "@/lib/points";
import { Sparkles } from "lucide-react";

interface BadgeData {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  criteria: BadgeCriteria;
  earnedAt: string | null;
}

interface BadgeShowcaseProps {
  /** If provided, uses these badges instead of fetching from API */
  badges?: BadgeData[];
  /** Maximum number of badges to show */
  maxDisplay?: number;
  /** Whether to show a "View All" link */
  showViewAll?: boolean;
}

export function BadgeShowcase({ badges: propBadges, maxDisplay = 8, showViewAll = true }: BadgeShowcaseProps) {
  const [badges, setBadges] = useState<BadgeData[]>(propBadges || []);
  const [loading, setLoading] = useState(!propBadges);

  useEffect(() => {
    if (propBadges) {
      setBadges(propBadges);
      return;
    }

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

    fetchBadges();
  }, [propBadges]);

  const earnedBadges = badges.filter((b) => b.earnedAt);
  const displayBadges = earnedBadges.slice(0, maxDisplay);

  if (loading) {
    return (
      <div className="flex gap-3 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-20 h-20 bg-[#EAE3D2]/30 rounded-2xl animate-pulse shrink-0"
          />
        ))}
      </div>
    );
  }

  if (earnedBadges.length === 0) {
    return (
      <div className="bg-[#FAF6EE]/50 rounded-[1.5rem] border border-[#EAE3D2]/40 p-6 text-center">
        <Sparkles className="w-8 h-8 text-[#EAE3D2] mx-auto mb-2" />
        <p className="text-sm font-semibold text-[#1A1A2E]">No badges yet</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Attend events, submit projects, and earn points to unlock badges!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-serif font-black text-[#1A1A2E]">
            My Badges
          </h2>
          <span className="text-xs font-bold text-[#6EA2F8] bg-[#6EA2F8]/10 px-2 py-0.5 rounded-full">
            {earnedBadges.length}
          </span>
        </div>
        {showViewAll && (
          <Link
            href="/student/badges"
            className="text-xs text-[#D8615C] font-bold hover:underline transition-colors flex items-center gap-1"
          >
            View all →
          </Link>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {displayBadges.map((badge) => (
          <div key={badge.id} className="shrink-0 w-20">
            <BadgeCard {...badge} compact />
          </div>
        ))}
        {earnedBadges.length > maxDisplay && (
          <Link
            href="/student/badges"
            className="shrink-0 w-20 h-20 rounded-2xl bg-[#FAF6EE] border border-[#EAE3D2]/60 flex flex-col items-center justify-center gap-1 hover:bg-white hover:shadow-sm transition-all"
          >
            <span className="text-lg font-black text-[#1A1A2E]">
              +{earnedBadges.length - maxDisplay}
            </span>
            <span className="text-[9px] font-bold text-gray-400">MORE</span>
          </Link>
        )}
      </div>
    </div>
  );
}