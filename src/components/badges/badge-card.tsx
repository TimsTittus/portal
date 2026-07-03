"use client";

import type { BadgeCriteria } from "@/lib/points";

interface BadgeCardProps {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  criteria: BadgeCriteria;
  earnedAt: string | null;
  compact?: boolean;
}

const CRITERIA_LABELS: Record<string, (c: BadgeCriteria) => string> = {
  points: (c) => `${(c as { threshold: number }).threshold}+ points`,
  event_count: (c) => `${(c as { min: number }).min}+ events attended`,
  project_count: (c) => `${(c as { min: number }).min}+ approved projects`,
  volunteer_count: (c) => `${(c as { min: number }).min}+ times volunteered`,
  streak: (c) => `${(c as { min: number }).min}+ event streak`,
};

function getCriteriaLabel(criteria: BadgeCriteria): string {
  const fn = CRITERIA_LABELS[criteria.type];
  return fn ? fn(criteria) : "Special achievement";
}

function formatEarnedDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BadgeCard({ name, description, icon, criteria, earnedAt, compact }: BadgeCardProps) {
  const isEarned = !!earnedAt;

  if (compact) {
    return (
      <div
        className={`group relative flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-300 ${isEarned
          ? "bg-white border border-[#EAE3D2]/70 shadow-sm hover:shadow-md hover:border-[#EAE3D2]"
          : "bg-[#FAF6EE]/50 border border-[#EAE3D2]/40 opacity-50"
          }`}
      >
        <span
          className={`text-2xl transition-transform duration-300 ${isEarned ? "group-hover:scale-125" : "grayscale"
            }`}
        >
          {icon || "🏅"}
        </span>
        <span
          className={`text-[10px] font-bold text-center leading-tight ${isEarned ? "text-[#1A1A2E]" : "text-gray-400"
            }`}
        >
          {name}
        </span>
        {isEarned && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#84C974] rounded-full flex items-center justify-center shadow-sm">
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-[1.5rem] border p-5 transition-all duration-300 ${isEarned
        ? "bg-white border-[#EAE3D2]/70 shadow-sm hover:shadow-md hover:border-[#EAE3D2]"
        : "bg-[#FAF6EE]/30 border-[#EAE3D2]/40"
        }`}
    >
      {/* Earned glow effect */}
      {isEarned && (
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#F59E0B]/10 rounded-full blur-xl" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#6EA2F8]/10 rounded-full blur-xl" />
        </div>
      )}

      <div className="relative z-10 flex items-start gap-4">
        {/* Badge icon */}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-all duration-300 ${isEarned
            ? "bg-[#FAF6EE] group-hover:scale-110 group-hover:rotate-3"
            : "bg-gray-100 grayscale opacity-60"
            }`}
        >
          {icon || "🏅"}
        </div>

        {/* Badge info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={`font-serif font-black text-sm truncate ${isEarned ? "text-[#1A1A2E]" : "text-gray-400"
                }`}
            >
              {name}
            </h3>
            {isEarned && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#84C974]/10 text-[#84C974] text-[10px] font-bold shrink-0">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Earned
              </span>
            )}
          </div>

          <p
            className={`text-xs mt-0.5 leading-relaxed ${isEarned ? "text-gray-500" : "text-gray-400"
              }`}
          >
            {description}
          </p>

          <div className="flex items-center gap-3 mt-2">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isEarned
                ? "bg-[#6EA2F8]/10 text-[#6EA2F8]"
                : "bg-gray-100 text-gray-400"
                }`}
            >
              {getCriteriaLabel(criteria)}
            </span>

            {isEarned && earnedAt && (
              <span className="text-[10px] text-gray-400 font-medium">
                {formatEarnedDate(earnedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Lock icon for unearned */}
        {!isEarned && (
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}