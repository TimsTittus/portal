"use client";

import { useRef } from "react";
import { Clock, ChevronDown, Zap, Calendar, Users, Layout, Wrench, Trophy, Award, Lightbulb, Gift, Star } from "lucide-react";
import { PointsEntry } from "../types";

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

interface PointsHistoryProps {
  historyOpen: boolean;
  historyLoading: boolean;
  historyEntries: PointsEntry[];
  toggleHistory: () => Promise<void>;
}

export function PointsHistory({
  historyOpen,
  historyLoading,
  historyEntries,
  toggleHistory,
}: PointsHistoryProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
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
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
            historyOpen ? "rotate-180" : ""
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
                      <div
                        className={`w-8 h-8 rounded-lg ${meta.bg} ${meta.color} flex items-center justify-center shrink-0`}
                      >
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
  );
}
