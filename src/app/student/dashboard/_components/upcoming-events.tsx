"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { DashboardData } from "../types";

interface UpcomingEventsProps {
  events: DashboardData["events"];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-serif font-black text-[#1A1A2E]">
          Upcoming Events
        </h2>
        <Link
          href="/student/events"
          className="text-xs md:text-sm text-[#D8615C] font-bold hover:underline transition-colors flex items-center gap-1"
        >
          View all events →
        </Link>
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              {...event}
              startDatetime={event.startDatetime}
              endDatetime={event.endDatetime}
              className="bg-white rounded-[1.5rem] border border-[#EAE3D2]/70 p-5 shadow-sm hover:shadow-md hover:border-[#EAE3D2] transition-all"
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-[#EAE3D2]/60 p-10 text-center shadow-sm">
          <Calendar className="w-12 h-12 text-[#EAE3D2] mx-auto mb-4" />
          <p className="text-[#1A1A2E] font-serif font-bold text-lg">No upcoming events</p>
          <p className="text-gray-400 text-xs mt-1">
            Check back soon for new hackathons and workshops!
          </p>
        </div>
      )}
    </div>
  );
}
