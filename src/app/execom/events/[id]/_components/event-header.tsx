"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, TrendingUp, UserCheck, QrCode } from "lucide-react";
import Link from "next/link";
import { EventDetail } from "../types";

interface EventHeaderProps {
  event: EventDetail;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  published: "bg-blue-50 text-blue-700",
  ongoing: "bg-green-50 text-green-700",
  completed: "bg-purple-50 text-purple-700",
  cancelled: "bg-red-50 text-red-700",
};

export function EventHeader({ event }: EventHeaderProps) {
  const start = new Date(event.startDatetime);
  const end = new Date(event.endDatetime);

  return (
    <>
      {event.posterUrl && (
        <div className="w-full rounded-2xl border border-gray-100 overflow-hidden bg-gray-50 max-h-80 flex items-center justify-center shadow-sm">
          <img
            src={event.posterUrl}
            alt="Event Poster"
            className="w-full object-contain max-h-80"
          />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="secondary" className="capitalize mb-3">
              {event.eventType.replace("_", " ")}
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
              {event.title}
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <Badge
              variant="secondary"
              className={`capitalize shrink-0 ${statusColors[event.status || "draft"]}`}
            >
              {event.status}
            </Badge>
            <Link href={`/execom/events/${event.id}/scan`}>
              <Button size="sm" className="bg-[#1a1a2e] text-white hover:bg-[#2a2a4e] rounded-xl cursor-pointer">
                <QrCode className="w-4 h-4 mr-2" />
                Scan QR
              </Button>
            </Link>
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {start.toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium">
              {start.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              –{" "}
              {end.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {event.venue && (
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <p className="text-sm font-medium">{event.venue}</p>
            </div>
          )}

          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium">
              {event.registrationCount} registered
              {event.registrationLimit
                ? ` / ${event.registrationLimit} max`
                : ""}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-3 mt-6">
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-xl text-sm font-medium">
            <TrendingUp className="w-4 h-4" />+
            {event.participationPoints} pts (Participant)
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-xl text-sm font-medium">
            <TrendingUp className="w-4 h-4" />+
            {event.volunteerPoints} pts (Volunteer)
          </div>
          <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-2 rounded-xl text-sm font-medium">
            <UserCheck className="w-4 h-4" />
            {event.attendanceCount} attended
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="font-semibold text-[#1a1a2e] mb-2">About</h3>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
