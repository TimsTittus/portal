"use client";

import Link from "next/link";
import { Award, TrendingUp, Calendar, Trophy } from "lucide-react";
import { DashboardData } from "../types";

interface PointsOverviewProps {
  profile: DashboardData["profile"];
  eventsCount: number;
}

export function PointsOverview({ profile, eventsCount }: PointsOverviewProps) {
  return (
    <>
      {/* IEDC ID Badge Card */}
      {profile?.iecdId && (
        <Link
          href="/student/profile"
          className="bg-[#1A1A2E] text-[#FBF5E8] rounded-[2rem] p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-[#1A1A2E] shadow-xl shadow-black/10 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group cursor-pointer w-full block"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-200" />
          <div className="space-y-2 relative z-10">
            <p className="text-xs uppercase tracking-widest text-[#FBF5E8]/60 font-bold">Official IEDC ID</p>
            <p className="text-2xl md:text-3.5xl font-serif font-black tracking-wide">
              {profile.iecdId}
            </p>
            <p className="text-xs font-semibold text-[#FAF6EE]/75 bg-white/10 px-3 py-1 rounded-full w-fit">
              {profile.department} Department
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
            {profile?.totalPoints || 0}
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
            {eventsCount}
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
    </>
  );
}
