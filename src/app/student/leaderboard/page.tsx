"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Trophy,
  Star,
  Loader2,
  Medal,
  Globe,
  Calendar,
  CalendarDays,
  Infinity,
  ScanSearch,
} from "lucide-react";
import { LinkedinIcon, GithubIcon } from "@/components/ui/icons";
import { cn, getGithubUsername } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

type Scope = "overall" | "monthly" | "weekly";

interface LeaderboardUser {
  iecdId: string;
  fullName: string;
  points: number;
  rank: number;
}

interface MeProfile {
  iecdId: string;
  name: string;
  totalPoints: number;
  department: string;
  admissionNumber?: string;
  batch?: string;
  bio?: string | null;
  skills?: string[];
  interests?: string[];
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
}

const SCOPES: { id: Scope; label: string; icon: React.ReactNode }[] = [
  { id: "overall", label: "Overall", icon: <Infinity size={14} strokeWidth={2.5} /> },
  { id: "monthly", label: "Monthly", icon: <Calendar size={14} strokeWidth={2.5} /> },
  { id: "weekly", label: "Weekly", icon: <CalendarDays size={14} strokeWidth={2.5} /> },
];

function SkeletonRow() {
  return (
    <div className="brutalist-card-sm p-3 flex items-center gap-4 animate-pulse">
      <div className="w-8 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
        <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-20" />
      </div>
      <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const [scope, setScope] = useState<Scope>("overall");
  const [champions, setChampions] = useState<LeaderboardUser[]>([]);
  const [me, setMe] = useState<MeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScopeLoading, setIsScopeLoading] = useState(false);
  const [findMeActive, setFindMeActive] = useState(false);

  // Profile modal states
  const [selectedProfile, setSelectedProfile] = useState<MeProfile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const myRowRef = useRef<HTMLDivElement>(null);

  // ── Initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      try {
        const [leaderboardRes, profileRes] = await Promise.all([
          fetch("/api/leaderboard?scope=overall&limit=50"),
          fetch("/api/student/profile"),
        ]);

        if (leaderboardRes.ok) {
          const lData = await leaderboardRes.json();
          setChampions(mapEntries(lData.leaderboard ?? []));
        }

        if (profileRes.ok) {
          const pData = await profileRes.json();
          setMe(pData);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // ── Scope change ─────────────────────────────────────────────────────────────
  const handleScopeChange = useCallback(async (newScope: Scope) => {
    if (newScope === scope) return;
    setScope(newScope);
    setIsScopeLoading(true);
    setFindMeActive(false);
    try {
      const res = await fetch(`/api/leaderboard?scope=${newScope}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        setChampions(mapEntries(data.leaderboard ?? []));
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setIsScopeLoading(false);
    }
  }, [scope]);

  // ── Find Me ──────────────────────────────────────────────────────────────────
  const handleFindMe = () => {
    const next = !findMeActive;
    setFindMeActive(next);
    if (next) {
      requestAnimationFrame(() => {
        myRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  };

  // ── Profile click ─────────────────────────────────────────────────────────────
  const handleUserClick = async (iecdId: string) => {
    setIsProfileOpen(true);
    setIsProfileLoading(true);
    try {
      const res = await fetch(`/api/student/profile?iecdId=${encodeURIComponent(iecdId)}`);
      if (res.ok) {
        setSelectedProfile(await res.json());
      } else {
        setSelectedProfile(null);
      }
    } catch {
      setSelectedProfile(null);
    } finally {
      setIsProfileLoading(false);
    }
  };

  // ─── Derived ─────────────────────────────────────────────────────────────────

  const topThree = champions.slice(0, 3);
  const others = champions.slice(3);
  const myEntry = me ? champions.find((c) => c.iecdId === me.iecdId) : null;
  const myRankInList = myEntry?.rank ?? null;
  const iAmInList = myEntry != null;

  // ─── Loading ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" strokeWidth={3} />
        <p className="font-mono text-xs font-bold text-gray-500 uppercase animate-pulse">
          Calculating Rankings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header row ── */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h1 className="font-mono font-bold text-2xl uppercase tracking-tight flex items-center gap-2 dark:text-[#F5F5F7]">
          <Trophy size={24} strokeWidth={3} className="text-primary" />
          Leadership Board
        </h1>

        {/* Find Me button */}
        {me && (
          <button
            id="leaderboard-find-me-btn"
            onClick={handleFindMe}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-xs font-mono font-bold uppercase tracking-widest border-2 transition-all duration-150 shadow-sm",
              findMeActive
                ? "bg-amber-400 text-black border-amber-500 shadow-amber-200"
                : "border-black dark:border-white/30 text-[#1A1A2E] dark:text-[#F5F5F7] hover:bg-amber-50 dark:hover:bg-amber-950/30"
            )}
          >
            <ScanSearch size={14} strokeWidth={2.5} />
            Find Me
            {myRankInList && (
              <span
                className={cn(
                  "ml-1 px-1.5 py-0.5 text-[9px] font-black rounded",
                  findMeActive ? "bg-black/20 text-black" : "bg-black text-white dark:bg-white dark:text-black"
                )}
              >
                #{myRankInList}
              </span>
            )}
          </button>
        )}
      </div>

      {/* ── Scope Tabs ── */}
      <div
        id="leaderboard-scope-tabs"
        className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-[#1E2235] border border-black/10 dark:border-white/10 w-fit"
      >
        {SCOPES.map((s) => (
          <button
            key={s.id}
            id={`leaderboard-tab-${s.id}`}
            onClick={() => handleScopeChange(s.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-widest transition-all duration-150",
              scope === s.id
                ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
            )}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Scope-level loading overlay ── */}
      {isScopeLoading ? (
        <div className="space-y-2">
          <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-32 animate-pulse" />
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* ── Podium ── */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-3 gap-3 items-end pt-10 pb-4 max-w-xl mx-auto">
              {topThree[1] && (
                <PodiumCard
                  user={topThree[1]}
                  rank={2}
                  color="bg-slate-300"
                  height="h-32"
                  iconColor="text-gray-500"
                  isMe={topThree[1].iecdId === me?.iecdId}
                  onClick={() => handleUserClick(topThree[1].iecdId)}
                />
              )}
              {topThree[0] && (
                <PodiumCard
                  user={topThree[0]}
                  rank={1}
                  color="bg-amber-100 dark:bg-amber-900/30"
                  height="h-44"
                  iconColor="text-yellow-600"
                  isWinner
                  isMe={topThree[0].iecdId === me?.iecdId}
                  onClick={() => handleUserClick(topThree[0].iecdId)}
                />
              )}
              {topThree[2] && (
                <PodiumCard
                  user={topThree[2]}
                  rank={3}
                  color="bg-orange-200 dark:bg-orange-900/20"
                  height="h-24"
                  iconColor="text-orange-700"
                  isMe={topThree[2].iecdId === me?.iecdId}
                  onClick={() => handleUserClick(topThree[2].iecdId)}
                />
              )}
            </div>
          )}

          {/* ── Rankings list ── */}
          <div className="space-y-3">
            <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400 px-1">
              Top 50 Rankings
            </h2>
            <div className="space-y-2">
              {others.map((user) => (
                <RankRow
                  key={user.iecdId}
                  ref={user.iecdId === me?.iecdId ? myRowRef : undefined}
                  user={user}
                  rank={user.rank}
                  isMe={user.iecdId === me?.iecdId}
                  highlightMe={findMeActive && user.iecdId === me?.iecdId}
                  onClick={() => handleUserClick(user.iecdId)}
                />
              ))}
              {champions.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-[#1E2235] rounded-2xl border border-gray-100 dark:border-white/10">
                  <Trophy className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No rankings yet</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Participate in events to earn points!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── "Find Me" — out-of-list banner ── */}
          {findMeActive && me && !iAmInList && (
            <div
              id="leaderboard-find-me-banner"
              className="border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/20 p-4 flex items-center gap-4"
            >
              <div className="w-8 font-mono font-black text-xl text-amber-600 italic shrink-0">
                —
              </div>
              <div className="w-10 h-10 bg-brutalist-purple border border-black dark:border-[#D1D1E0] flex items-center justify-center font-mono font-bold text-sm text-black shrink-0 shadow-sm">
                {initials(me.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-bold dark:text-[#F5F5F7] text-[#1A1A2E] truncate">
                  {me.name}
                  <span className="ml-2 brutalist-tag text-[9px] bg-amber-400 text-black px-1.5 py-0.5">
                    YOU
                  </span>
                </p>
                <p className="font-mono text-[10px] text-gray-400 dark:text-gray-500">
                  Not in Top 50 for this period
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 shrink-0">
                <Star size={14} strokeWidth={3} className="text-[#D8615C]" />
                <span className="font-mono text-sm font-bold dark:text-[#F5F5F7] text-[#1A1A2E]">
                  {me.totalPoints}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Profile Detail Dialog ── */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-[#EAE3D2]/60 rounded-3xl p-6 shadow-xl text-[#1A1A2E]">
          <DialogTitle className="sr-only">Student Profile</DialogTitle>
          <DialogDescription className="sr-only">
            Detailed profile information for this student.
          </DialogDescription>
          {isProfileLoading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#D8615C]" strokeWidth={3} />
              <p className="font-mono text-xs font-bold text-gray-500 uppercase animate-pulse">
                Loading Profile...
              </p>
            </div>
          ) : selectedProfile ? (
            <div className="space-y-6 min-w-0 w-full">
              <div className="flex items-center gap-4 border-b border-[#EAE3D2]/40 pb-4">
                <div className="w-14 h-14 rounded-2xl bg-[#1A1A2E] text-[#FBF5E8] flex items-center justify-center font-mono font-bold text-lg shadow-md shrink-0">
                  {initials(selectedProfile.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-serif font-black tracking-tight text-[#1A1A2E] truncate">
                    {selectedProfile.name}
                  </h3>
                  <p className="text-xs font-mono font-semibold text-gray-500 mt-0.5">
                    {selectedProfile.iecdId}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-gray-400 block mb-0.5">Department</span>
                  <span className="font-bold text-[#1A1A2E]">{selectedProfile.department}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Graduation Year</span>
                  <span className="font-bold text-[#1A1A2E]">{selectedProfile.batch || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Admission No.</span>
                  <span className="font-bold text-[#1A1A2E]">{selectedProfile.admissionNumber || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Total Points</span>
                  <span className="font-bold text-[#D8615C] flex items-center gap-1">
                    <Star size={12} strokeWidth={3} className="text-[#D8615C]" />
                    {selectedProfile.totalPoints || 0}
                  </span>
                </div>
              </div>

              {selectedProfile.bio && (
                <div className="bg-[#FAF6EE] border border-[#EAE3D2]/40 rounded-2xl p-4 text-xs leading-relaxed text-gray-600">
                  <span className="font-mono text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">
                    Bio
                  </span>
                  {selectedProfile.bio}
                </div>
              )}

              {selectedProfile.skills && selectedProfile.skills.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProfile.skills.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-lg text-gray-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {(selectedProfile.linkedinUrl || selectedProfile.githubUrl || selectedProfile.portfolioUrl) && (
                <div className="flex items-center gap-3 pt-3 border-t border-[#EAE3D2]/60 justify-center">
                  {selectedProfile.linkedinUrl && (
                    <a
                      href={selectedProfile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-[#FAF6EE] border border-[#EAE3D2]/60 hover:bg-[#D8615C] hover:text-[#FAF6EE] transition-all text-[#D8615C] shadow-sm flex items-center justify-center"
                      title="LinkedIn"
                    >
                      <LinkedinIcon size={18} strokeWidth={2} />
                    </a>
                  )}
                  {selectedProfile.githubUrl && (
                    <a
                      href={selectedProfile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-[#FAF6EE] border border-[#EAE3D2]/60 hover:bg-[#D8615C] hover:text-[#FAF6EE] transition-all text-[#D8615C] shadow-sm flex items-center justify-center"
                      title="GitHub"
                    >
                      <GithubIcon size={18} strokeWidth={2} />
                    </a>
                  )}
                  {selectedProfile.portfolioUrl && (
                    <a
                      href={selectedProfile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-[#FAF6EE] border border-[#EAE3D2]/60 hover:bg-[#D8615C] hover:text-[#FAF6EE] transition-all text-[#D8615C] shadow-sm flex items-center justify-center"
                      title="Portfolio"
                    >
                      <Globe size={18} strokeWidth={2} />
                    </a>
                  )}
                </div>
              )}

              {selectedProfile.githubUrl && getGithubUsername(selectedProfile.githubUrl) && (
                <div className="pt-4 border-t border-[#EAE3D2]/40 space-y-2">
                  <span className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    GitHub Contributions
                  </span>
                  <div className="w-full overflow-x-auto bg-[#FAF6EE]/50 border border-[#EAE3D2]/40 rounded-2xl p-3">
                    <div className="min-w-[670px] flex justify-center items-center py-1">
                      <img
                        src={`https://ghchart.rshah.org/D8615C/${getGithubUsername(selectedProfile.githubUrl)}`}
                        alt={`${selectedProfile.name}'s GitHub contributions`}
                        className="w-full h-auto dark:invert dark:hue-rotate-180"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 font-medium">Failed to load profile details</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function initials(name: string): string {
  return (name || "Student")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function mapEntries(
  raw: { iecdId: string; name: string; points: number; rank: number }[]
): LeaderboardUser[] {
  return raw.map((u) => ({ ...u, fullName: u.name }));
}

// ─── PodiumCard ───────────────────────────────────────────────────────────────

function PodiumCard({
  user,
  rank,
  color,
  height,
  iconColor,
  isWinner = false,
  isMe = false,
  onClick,
}: {
  user: LeaderboardUser;
  rank: number;
  color: string;
  height: string;
  iconColor: string;
  isWinner?: boolean;
  isMe?: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center space-y-3 group w-full cursor-pointer"
    >
      <div className="relative">
        <div
          className={cn(
            "w-16 h-16 border-2 border-black dark:border-[#D1D1E0] flex items-center justify-center font-mono font-bold text-xl text-black transition-transform duration-200 group-hover:-translate-y-1 shadow-brutalist dark:shadow-brutalist-dark bg-white",
            isWinner && "scale-110 border-amber-500",
            isMe && "ring-2 ring-amber-400 ring-offset-1"
          )}
        >
          {initials(user.fullName)}
        </div>
        <div
          className={cn(
            "absolute -top-3 -right-3 w-8 h-8 rounded-full border border-black flex items-center justify-center bg-white shadow-sm",
            iconColor
          )}
        >
          <Medal size={16} strokeWidth={3} />
        </div>
        {isMe && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 brutalist-tag text-[8px] bg-amber-400 text-black px-1.5 py-0.5 whitespace-nowrap">
            YOU
          </div>
        )}
      </div>

      <div className="text-center w-full px-1">
        <p className="font-mono text-xs font-bold truncate max-w-full dark:text-[#F5F5F7] text-[#1A1A2E]">
          {user.fullName.split(" ")[0]}
        </p>
        <div className="flex items-center justify-center gap-0.5 mt-0.5">
          <Star size={10} strokeWidth={3} className="text-[#D8615C]" />
          <span className="font-mono text-[10px] font-bold dark:text-[#F5F5F7] text-gray-700">
            {user.points}
          </span>
        </div>
      </div>

      <div
        className={cn(
          "w-full border-x-2 border-t-2 border-b border-black dark:border-[#D1D1E0] flex flex-col items-center justify-center shadow-brutalist dark:shadow-brutalist-dark",
          height,
          color
        )}
      >
        <span className="font-mono font-black text-3xl text-black/40 italic">
          #{rank}
        </span>
      </div>
    </div>
  );
}

// ─── RankRow ──────────────────────────────────────────────────────────────────

import React from "react";

const RankRow = React.forwardRef<
  HTMLDivElement,
  {
    user: LeaderboardUser;
    rank: number;
    isMe: boolean;
    highlightMe: boolean;
    onClick: () => void;
  }
>(function RankRow({ user, rank, isMe, highlightMe, onClick }, ref) {
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={cn(
        "brutalist-card-sm p-3 flex items-center gap-4 transition-all duration-200 w-full cursor-pointer",
        highlightMe
          ? "bg-amber-50 dark:bg-amber-950/30 border-amber-500 scale-[1.01] shadow-md shadow-amber-200/50"
          : isMe
            ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-500"
            : "hover:bg-gray-50 dark:hover:bg-[#262A3D]"
      )}
    >
      <div className="font-mono font-black text-xl text-gray-400 dark:text-gray-600 italic w-8 shrink-0">
        #{rank}
      </div>
      <div className="w-10 h-10 bg-brutalist-purple border border-black dark:border-[#D1D1E0] flex items-center justify-center font-mono font-bold text-sm text-black shrink-0 shadow-sm">
        {initials(user.fullName)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm font-bold dark:text-[#F5F5F7] text-[#1A1A2E] truncate">
          {user.fullName}
          {isMe && (
            <span className="ml-2 brutalist-tag text-[9px] bg-amber-400 text-black px-1.5 py-0.5">
              YOU
            </span>
          )}
        </p>
        <p className="font-mono text-[10px] text-gray-400 dark:text-gray-500">
          Active student
        </p>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 shrink-0">
        <Star size={14} strokeWidth={3} className="text-[#D8615C]" />
        <span className="font-mono text-sm font-bold dark:text-[#F5F5F7] text-[#1A1A2E]">
          {user.points}
        </span>
      </div>
    </div>
  );
});