"use client";

import { cn } from "@/lib/utils";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface EventCardProps {
  id: string;
  title: string;
  eventType: string;
  venue?: string | null;
  startDatetime: string;
  endDatetime: string;
  status?: string | null;
  participationPoints?: number | null;
  registrationCount?: number;
  registrationLimit?: number | null;
  linkPrefix?: string;
  className?: string;
  posterUrl?: string | null;
}

const eventTypeIcons: Record<string, string> = {
  workshop: "🛠",
  hackathon: "💻",
  bootcamp: "🚀",
  seminar: "📢",
  competition: "🏆",
  innovation_challenge: "💡",
};

const eventTypeColors: Record<string, string> = {
  workshop: "bg-blue-50 text-blue-700",
  hackathon: "bg-purple-50 text-purple-700",
  bootcamp: "bg-orange-50 text-orange-700",
  seminar: "bg-green-50 text-green-700",
  competition: "bg-red-50 text-red-700",
  innovation_challenge: "bg-yellow-50 text-yellow-700",
};

export function EventCard({
  id,
  title,
  eventType,
  venue,
  startDatetime,
  status,
  participationPoints,
  registrationCount,
  registrationLimit,
  linkPrefix = "/student/events",
  className,
  posterUrl,
}: EventCardProps) {
  const startDate = new Date(startDatetime);
  const formattedDate = startDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = startDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Link href={`${linkPrefix}/${id}`}>
      <div
        className={cn(
          "group bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 cursor-pointer",
          className
        )}
      >
        {/* Event poster or placeholder */}
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-gray-50 border border-gray-100/50">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={cn(
              "w-full h-full flex items-center justify-center text-xl font-bold bg-gradient-to-br",
              eventType === "workshop" ? "from-blue-500 to-indigo-600 text-white" :
              eventType === "hackathon" ? "from-purple-500 to-pink-600 text-white" :
              eventType === "bootcamp" ? "from-orange-400 to-red-600 text-white" :
              eventType === "seminar" ? "from-green-400 to-teal-600 text-white" :
              eventType === "competition" ? "from-red-400 to-rose-600 text-white" :
              "from-yellow-400 to-amber-600 text-white"
            )}>
              {eventTypeIcons[eventType] || "📅"}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-[#1a1a2e] truncate text-sm md:text-base group-hover:text-black transition-colors">
              {title}
            </h3>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs shrink-0 capitalize",
                eventTypeColors[eventType]
              )}
            >
              {eventType.replace("_", " ")}
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formattedTime}
            </span>
            {venue && (
              <span className="hidden md:flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {venue}
              </span>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
          {participationPoints && (
            <span className="text-xs font-medium text-[#1a1a2e] bg-gray-50 px-2 py-1 rounded-lg">
              +{participationPoints} pts
            </span>
          )}
          {registrationCount !== undefined && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Users className="w-3 h-3" />
              {registrationCount}
              {registrationLimit ? `/${registrationLimit}` : ""}
            </span>
          )}
        </div>

        {/* View button */}
        <div className="shrink-0">
          <span className="text-xs font-medium text-[#1a1a2e] border border-[#1a1a2e] rounded-full px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity hidden md:inline-block">
            View
          </span>
        </div>
      </div>
    </Link>
  );
}
