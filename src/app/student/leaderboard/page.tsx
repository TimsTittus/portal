"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  department: string;
  photoUrl: string | null;
  iecdId: string;
  points: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard?limit=50");
        const data = await res.json();
        setEntries(data.leaderboard || []);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return null;
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
          Leaderboard
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Top performing students across all departments
        </p>
      </div>

      {/* Top 3 */}
      {!loading && entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {[entries[1], entries[0], entries[2]].map((entry, i) => {
            const order = [2, 1, 3][i];
            const isFirst = order === 1;
            return (
              <div
                key={entry.id}
                className={cn(
                  "bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center text-center shadow-sm",
                  isFirst && "md:-mt-4 shadow-md border-yellow-100 bg-yellow-50/30"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2",
                    order === 1 && "bg-yellow-100 text-yellow-700",
                    order === 2 && "bg-gray-100 text-gray-600",
                    order === 3 && "bg-amber-100 text-amber-700"
                  )}
                >
                  {order}
                </div>
                <Avatar className="h-14 w-14 mb-2 bg-[#1a1a2e]">
                  <AvatarFallback className="bg-[#1a1a2e] text-white text-sm font-bold">
                    {entry.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold text-[#1a1a2e] text-sm truncate w-full">
                  {entry.name}
                </p>
                <p className="text-xs text-gray-400">{entry.department}</p>
                <p className="font-bold text-[#1a1a2e] mt-1">{entry.points} pts</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="space-y-0 divide-y divide-gray-50">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-gray-50" />
            ))}
          </div>
        ) : entries.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-4 px-4 md:px-6 py-3 hover:bg-gray-50/50 transition-colors"
              >
                <div className="w-8 text-center">
                  {getRankIcon(entry.rank) || (
                    <span className="text-sm font-semibold text-gray-400">
                      {entry.rank}
                    </span>
                  )}
                </div>
                <Avatar className="h-9 w-9 bg-[#1a1a2e] shrink-0">
                  <AvatarFallback className="bg-[#1a1a2e] text-white text-xs">
                    {entry.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#1a1a2e] truncate">
                    {entry.name}
                  </p>
                  <p className="text-xs text-gray-400">{entry.department}</p>
                </div>
                <span className="font-bold text-sm text-[#1a1a2e] tabular-nums shrink-0">
                  {entry.points} pts
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Trophy className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No rankings yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Participate in events to earn points!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
