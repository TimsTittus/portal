"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";

const EVENT_TYPES = [
  { value: "workshop", label: "Workshop" },
  { value: "hackathon", label: "Hackathon" },
  { value: "bootcamp", label: "Bootcamp" },
  { value: "seminar", label: "Seminar" },
  { value: "competition", label: "Competition" },
  { value: "innovation_challenge", label: "Innovation Challenge" },
];

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    eventType: "",
    venue: "",
    startDatetime: "",
    endDatetime: "",
    registrationDeadline: "",
    registrationLimit: "",
    participationPoints: "10",
    volunteerPoints: "20",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const body = {
        ...form,
        startDatetime: new Date(form.startDatetime).toISOString(),
        endDatetime: new Date(form.endDatetime).toISOString(),
        registrationDeadline: form.registrationDeadline
          ? new Date(form.registrationDeadline).toISOString()
          : undefined,
        registrationLimit: form.registrationLimit
          ? parseInt(form.registrationLimit)
          : undefined,
        participationPoints: parseInt(form.participationPoints),
        volunteerPoints: parseInt(form.volunteerPoints),
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push("/coordinator/events");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create event");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a1a2e] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div>
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Create Event</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Fill in the details to create a new event
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5"
      >
        <div className="space-y-2">
          <Label>Event Title</Label>
          <Input
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="rounded-xl"
            placeholder="e.g. React Workshop 2025"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="rounded-xl resize-none"
            rows={4}
            placeholder="What's this event about?"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Event Type</Label>
            <Select
              value={form.eventType}
              onValueChange={(val) => handleChange("eventType", val)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Venue</Label>
            <Input
              value={form.venue}
              onChange={(e) => handleChange("venue", e.target.value)}
              className="rounded-xl"
              placeholder="e.g. Seminar Hall A"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date & Time</Label>
            <Input
              type="datetime-local"
              value={form.startDatetime}
              onChange={(e) => handleChange("startDatetime", e.target.value)}
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>End Date & Time</Label>
            <Input
              type="datetime-local"
              value={form.endDatetime}
              onChange={(e) => handleChange("endDatetime", e.target.value)}
              className="rounded-xl"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Registration Deadline</Label>
            <Input
              type="datetime-local"
              value={form.registrationDeadline}
              onChange={(e) =>
                handleChange("registrationDeadline", e.target.value)
              }
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label>Max Registrations</Label>
            <Input
              type="number"
              value={form.registrationLimit}
              onChange={(e) =>
                handleChange("registrationLimit", e.target.value)
              }
              className="rounded-xl"
              placeholder="Unlimited"
            />
          </div>

          <div className="space-y-2">
            <Label>Participation Points</Label>
            <Input
              type="number"
              value={form.participationPoints}
              onChange={(e) =>
                handleChange("participationPoints", e.target.value)
              }
              className="rounded-xl"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-100">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto h-11 px-8 rounded-xl bg-[#1a1a2e] hover:bg-[#2a2a4e]"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Create Event
        </Button>
      </form>
    </div>
  );
}
