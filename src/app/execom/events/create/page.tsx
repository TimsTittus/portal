"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEventSchema, CreateEventInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { PosterUpload } from "@/components/events/poster-upload";

export default function CreateEventPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [posterPreview, setPosterPreview] = useState("");
  const [volunteersText, setVolunteersText] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      participationPoints: 10,
      volunteerPoints: 20,
    },
  });

  const startDatetime = watch("startDatetime");

  const onSubmit = async (data: CreateEventInput) => {
    setLoading(true);
    setError("");

    const volunteerEmails = volunteersText
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    // Make sure datetime strings are valid ISO strings (from datetime-local which lacks seconds and Z)
    const formattedData = {
      ...data,
      volunteerEmails: volunteerEmails.length > 0 ? volunteerEmails : undefined,
      startDatetime: new Date(data.startDatetime).toISOString(),
      endDatetime: new Date(data.endDatetime).toISOString(),
      registrationDeadline: data.registrationDeadline
        ? new Date(data.registrationDeadline).toISOString()
        : undefined,
      registrationLimit: data.registrationLimit ? Number(data.registrationLimit) : undefined,
      participationPoints: Number(data.participationPoints),
      volunteerPoints: Number(data.volunteerPoints),
    };

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (res.ok) {
        router.push("/execom/events");
        router.refresh();
      } else {
        const result = await res.json();
        setError(result.error || "Failed to create event");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 pb-12">
      <Link
        href="/execom/events"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a1a2e] transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to events
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
          Create Event
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Publish a new event for students
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input id="title" {...register("title")} className="mt-1" placeholder="e.g. Annual Hackathon" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              className="mt-1 min-h-25"
              placeholder="Provide details about the event..."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Event Poster (Optional)</Label>
            <PosterUpload
              value={posterPreview}
              onChange={(val) => {
                setPosterPreview(val);
                setValue("posterUrl", val);
              }}
              onRemove={() => {
                setPosterPreview("");
                setValue("posterUrl", undefined);
              }}
            />
            {errors.posterUrl && <p className="text-red-500 text-xs mt-1">{errors.posterUrl.message}</p>}
          </div>

          <div>
            <Label htmlFor="volunteerEmails">Volunteer Emails (Optional)</Label>
            <Textarea
              id="volunteerEmails"
              value={volunteersText}
              onChange={(e) => setVolunteersText(e.target.value)}
              className="mt-1 resize-none"
              placeholder="e.g. student1@example.com, student2@example.com"
              rows={2}
            />
            <p className="text-gray-400 text-[10px] mt-1 leading-relaxed">
              Separate multiple emails with commas. If the student profile exists, they will be registered as a volunteer and receive volunteer points.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <select
                id="eventType"
                {...register("eventType")}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
              >
                <option value="workshop">Workshop</option>
                <option value="hackathon">Hackathon</option>
                <option value="bootcamp">Bootcamp</option>
                <option value="seminar">Seminar</option>
                <option value="competition">Competition</option>
                <option value="innovation_challenge">Innovation Challenge</option>
              </select>
              {errors.eventType && <p className="text-red-500 text-xs mt-1">{errors.eventType.message}</p>}
            </div>

            <div>
              <Label htmlFor="venue">Venue (Optional)</Label>
              <Input id="venue" {...register("venue")} className="mt-1" placeholder="e.g. Main Auditorium" />
              {errors.venue && <p className="text-red-500 text-xs mt-1">{errors.venue.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDatetime">Start Date & Time</Label>
              <Input
                id="startDatetime"
                type="datetime-local"
                {...register("startDatetime")}
                className="mt-1"
              />
              {errors.startDatetime && <p className="text-red-500 text-xs mt-1">{errors.startDatetime.message}</p>}
            </div>

            <div>
              <Label htmlFor="endDatetime">End Date & Time</Label>
              <Input
                id="endDatetime"
                type="datetime-local"
                min={startDatetime}
                {...register("endDatetime")}
                className="mt-1"
              />
              {errors.endDatetime && <p className="text-red-500 text-xs mt-1">{errors.endDatetime.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="registrationDeadline">Registration Deadline (Optional)</Label>
              <Input
                id="registrationDeadline"
                type="datetime-local"
                max={startDatetime}
                {...register("registrationDeadline")}
                className="mt-1"
              />
              {errors.registrationDeadline && <p className="text-red-500 text-xs mt-1">{errors.registrationDeadline.message}</p>}
            </div>

            <div>
              <Label htmlFor="registrationLimit">Registration Limit (Optional)</Label>
              <Input
                id="registrationLimit"
                type="number"
                {...register("registrationLimit", { valueAsNumber: true })}
                className="mt-1"
                placeholder="e.g. 100"
              />
              {errors.registrationLimit && <p className="text-red-500 text-xs mt-1">{errors.registrationLimit.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="participationPoints">Participation Points</Label>
              <Input
                id="participationPoints"
                type="number"
                {...register("participationPoints", { valueAsNumber: true })}
                className="mt-1"
              />
              {errors.participationPoints && <p className="text-red-500 text-xs mt-1">{errors.participationPoints.message}</p>}
            </div>

            <div>
              <Label htmlFor="volunteerPoints">Volunteer Points</Label>
              <Input
                id="volunteerPoints"
                type="number"
                {...register("volunteerPoints", { valueAsNumber: true })}
                className="mt-1"
              />
              {errors.volunteerPoints && <p className="text-red-500 text-xs mt-1">{errors.volunteerPoints.message}</p>}
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-8 bg-[#1a1a2e] text-white hover:bg-[#2a2a4e]"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Create Event
          </Button>
        </div>
      </form>
    </div>
  );
}
