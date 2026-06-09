"use client";

import { useEffect, useState } from "react";
import { Trophy, Star, Loader2, Medal, Globe } from "lucide-react";
import { LinkedinIcon, GithubIcon } from "@/components/ui/icons";
import { cn, getGithubUsername } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface LeaderboardUser {
  id: string;
  fullName: string;
  points: number;
}

interface MeProfile {
  id: string;
  name: string;
  iecdId: string;
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

export default function LeaderboardPage() {
  const [champions, setChampions] = useState<LeaderboardUser[]>([]);
  const [me, setMe] = useState<MeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Profile modal states
  const [selectedProfile, setSelectedProfile] = useState<MeProfile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [leaderboardRes, profileRes] = await Promise.all([
          fetch("/api/leaderboard?limit=50"),
          fetch("/api/student/profile"),
        ]);

        if (leaderboardRes.ok) {
          const lData = await leaderboardRes.json();
          const entries = (lData.leaderboard || []).map((user: { id: string; name: string; points: number }) => ({
            ...user,
            fullName: user.name,
          }));
          setChampions(entries);
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

  const handleUserClick = async (studentId: string) => {
    setIsProfileOpen(true);
    setIsProfileLoading(true);
    try {
      const res = await fetch(`/api/student/profile?id=${encodeURIComponent(studentId)}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedProfile(data);
      } else {
        setSelectedProfile(null);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setSelectedProfile(null);
    } finally {
      setIsProfileLoading(false);
    }
  };

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

  const topThree = champions?.slice(0, 3) || [];
  const others = champions?.slice(3) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <h1 className="font-mono font-bold text-2xl uppercase tracking-tight flex items-center gap-2 dark:text-[#F5F5F7]">
          <Trophy size={24} strokeWidth={3} className="text-primary" />
          Leadership Board
        </h1>
      </div>

      {/* Podium Section */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-3 gap-3 items-end pt-10 pb-4 max-w-xl mx-auto">
          {/* 2nd Place */}
          {topThree[1] && (
            <PodiumCard
              user={topThree[1]}
              rank={2}
              color="bg-slate-300"
              height="h-32"
              iconColor="text-gray-500"
              onClick={() => handleUserClick(topThree[1].id)}
            />
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <PodiumCard
              user={topThree[0]}
              rank={1}
              color="bg-amber-100 dark:bg-amber-900/30"
              height="h-44"
              iconColor="text-yellow-600"
              isWinner
              onClick={() => handleUserClick(topThree[0].id)}
            />
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <PodiumCard
              user={topThree[2]}
              rank={3}
              color="bg-orange-200 dark:bg-orange-900/20"
              height="h-24"
              iconColor="text-orange-700"
              onClick={() => handleUserClick(topThree[2].id)}
            />
          )}
        </div>
      )}

      {/* Rankings List */}
      <div className="space-y-3">
        <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400 px-1">
          Top 50 Rankings
        </h2>
        <div className="space-y-2">
          {others.map((user, index) => (
            <RankRow
              key={user.id}
              user={user}
              rank={index + 4}
              isMe={user.id === me?.id}
              onClick={() => handleUserClick(user.id)}
            />
          ))}
          {champions.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <Trophy className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No rankings yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Participate in events to earn points!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Detail Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-[#EAE3D2]/60 rounded-3xl p-6 shadow-xl text-[#1A1A2E] animate-in zoom-in-95 duration-200">
          <DialogTitle className="sr-only">Student Profile</DialogTitle>
          <DialogDescription className="sr-only">Detailed profile information for this student.</DialogDescription>
          {isProfileLoading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#D8615C]" strokeWidth={3} />
              <p className="font-mono text-xs font-bold text-gray-500 uppercase animate-pulse">Loading Profile...</p>
            </div>
          ) : selectedProfile ? (
            <div className="space-y-6 min-w-0 w-full">
              <div className="flex items-center gap-4 border-b border-[#EAE3D2]/40 pb-4">
                <div className="w-14 h-14 rounded-2xl bg-[#1A1A2E] text-[#FBF5E8] flex items-center justify-center font-mono font-bold text-lg shadow-md shrink-0">
                  {(selectedProfile.name || "Student")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
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
                  <span className="font-mono text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">Bio</span>
                  {selectedProfile.bio}
                </div>
              )}

              {selectedProfile.skills && selectedProfile.skills.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProfile.skills.map((skill: string, idx: number) => (
                      <span key={idx} className="text-[10px] font-semibold bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-lg text-gray-700">
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
                  <span className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-wider block">GitHub Contributions</span>
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

function PodiumCard({
  user,
  rank,
  color,
  height,
  iconColor,
  isWinner = false,
  onClick,
}: {
  user: LeaderboardUser;
  rank: number;
  color: string;
  height: string;
  iconColor: string;
  isWinner?: boolean;
  onClick: () => void;
}) {
  const initials = (user.fullName || "Student")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center space-y-3 group w-full cursor-pointer"
    >
      <div className="relative">
        <div
          className={cn(
            "w-16 h-16 border-2 border-black dark:border-[#D1D1E0] flex items-center justify-center font-mono font-bold text-xl text-black transition-transform duration-200 group-hover:-translate-y-1 shadow-brutalist dark:shadow-brutalist-dark bg-white",
            isWinner && "scale-110 border-amber-500"
          )}
        >
          {initials}
        </div>
        <div
          className={cn(
            "absolute -top-3 -right-3 w-8 h-8 rounded-full border border-black flex items-center justify-center bg-white shadow-sm",
            iconColor
          )}
        >
          <Medal size={16} strokeWidth={3} />
        </div>
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

function RankRow({
  user,
  rank,
  isMe,
  onClick,
}: {
  user: LeaderboardUser;
  rank: number;
  isMe: boolean;
  onClick: () => void;
}) {
  const initials = (user.fullName || "Student")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      onClick={onClick}
      className={cn(
        "brutalist-card-sm p-3 flex items-center gap-4 transition-all duration-100 w-full cursor-pointer",
        isMe
          ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-500"
          : "hover:bg-gray-50 dark:hover:bg-[#262A3D]"
      )}
    >
      <div className="font-mono font-black text-xl text-gray-400 dark:text-gray-600 italic w-8 shrink-0">
        #{rank}
      </div>
      <div className="w-10 h-10 bg-brutalist-purple border border-black dark:border-[#D1D1E0] flex items-center justify-center font-mono font-bold text-sm text-black shrink-0 shadow-sm">
        {initials}
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
}