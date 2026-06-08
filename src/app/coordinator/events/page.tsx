"use client";

import { useEffect, useState } from "react";
import { EventCard } from "@/components/events/event-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface EventData {
  id: string;
  title: string;
  eventType: string;
  venue: string | null;
  startDatetime: string;
  endDatetime: string;
  status: string | null;
  participationPoints: number | null;
}

export default function CoordinatorEventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/events?status=all&limit=50");
        const data = await res.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
            Event Management
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Create and manage your events
          </p>
        </div>
        <Link href="/coordinator/events/new">
          <Button className="rounded-xl bg-[#1a1a2e] hover:bg-[#2a2a4e]">
            <Plus className="w-4 h-4 mr-1" />
            New Event
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              {...event}
              linkPrefix="/coordinator/events"
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500 font-medium">No events created yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Create your first event to get started!
          </p>
        </div>
      )}
    </div>
  );
}
