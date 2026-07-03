"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Loader2,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  venue: string | null;
  startDatetime: string;
  endDatetime: string;
  status: string | null;
  participationPoints: number | null;
  volunteerPoints: number | null;
  registrationLimit: number | null;
  registrationCount: number;
  attendanceCount: number;
  posterUrl: string | null;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data);
          setRegistered(data.registered || false);
        }
      } catch (error) {
        console.error("Failed to fetch event:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [params.id]);

  const handleRegister = async () => {
    setRegistering(true);
    setMessage("");
    try {
      const res = await fetch(`/api/events/${params.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "participant" }),
      });
      const data = await res.json();
      if (res.ok) {
        setRegistered(true);
        setMessage("Successfully registered! 🎉");
      } else {
        setMessage(data.error || "Registration failed");
      }
    } catch {
      setMessage("Something went wrong");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse max-w-3xl">
        <div className="h-6 bg-gray-200 rounded-xl w-32" />
        <div className="h-10 bg-gray-200 rounded-xl w-3/4" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 font-medium">Event not found</p>
        <Button
          variant="outline"
          className="mt-4 rounded-xl"
          onClick={() => router.back()}
        >
          Go back
        </Button>
      </div>
    );
  }

  const start = new Date(event.startDatetime);
  const end = new Date(event.endDatetime);

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a1a2e] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to events
      </button>

      {event.posterUrl && (
        <div className="w-full rounded-2xl border border-gray-100 overflow-hidden bg-gray-50 max-h-80 flex items-center justify-center shadow-sm">
          <img
            src={event.posterUrl}
            alt="Event Poster"
            className="w-full object-contain max-h-80"
          />
        </div>
      )}

      {/* Header */}
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
          <Badge
            variant={event.status === "published" ? "default" : "secondary"}
            className="capitalize shrink-0"
          >
            {event.status}
          </Badge>
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

        {/* Points */}
        <div className="flex gap-3 mt-6">
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-xl text-sm font-medium">
            <TrendingUp className="w-4 h-4" />+
            {event.participationPoints} pts (Participant)
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

        {/* Register button / status */}
        <div className="mt-8">
          {message && (
            <div
              className={`mb-4 rounded-xl px-4 py-3 text-sm ${
                registered
                  ? "bg-green-50 text-green-700 border border-green-100"
                  : "bg-red-50 text-red-600 border border-red-100"
              }`}
            >
              {message}
            </div>
          )}
          
          {registered ? (
            <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-700 font-semibold flex items-center gap-2 w-fit">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Registered ✓</span>
            </div>
          ) : (
            <Button
              onClick={handleRegister}
              disabled={registering}
              className="w-full md:w-auto h-11 px-8 rounded-xl bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white font-medium cursor-pointer"
            >
              {registering ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Register for Event
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
