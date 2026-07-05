"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EventDetail } from "./types";
import { StudentEventHeader } from "./_components/student-event-header";
import { StudentRegistrationAction } from "./_components/student-registration-action";
import { useSession } from "@/lib/auth-client";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
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
    if (!session) {
      router.push(`/auth/login?redirectTo=/student/events/${params.id}`);
      return;
    }
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
          className="mt-4 rounded-xl cursor-pointer"
          onClick={() => router.back()}
        >
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a1a2e] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to events
      </button>

      <StudentEventHeader event={event} />

      <StudentRegistrationAction
        registered={registered}
        registering={registering}
        message={message}
        onRegister={handleRegister}
      />
    </div>
  );
}
