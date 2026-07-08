"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { EventDetail, Registration } from "./types";
import { EventHeader } from "./_components/event-header";
import { StatusActions } from "./_components/status-actions";
import { RegistrationsTable } from "./_components/registrations-table";
import { PosterUpload } from "@/components/events/poster-upload";

export default function ExecomEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editEventType, setEditEventType] = useState("");
  const [editVenue, setEditVenue] = useState("");
  const [editStartDatetime, setEditStartDatetime] = useState("");
  const [editEndDatetime, setEditEndDatetime] = useState("");
  const [editRegistrationLimit, setEditRegistrationLimit] = useState<number | "">("");
  const [editParticipationPoints, setEditParticipationPoints] = useState<number>(10);
  const [editVolunteerPoints, setEditVolunteerPoints] = useState<number>(20);
  const [editPosterUrl, setEditPosterUrl] = useState("");
  const [editRegistrationDeadline, setEditRegistrationDeadline] = useState("");
  const [editVolunteerEmails, setEditVolunteerEmails] = useState("");

  const startEdit = () => {
    if (!event) return;
    setEditTitle(event.title);
    setEditDescription(event.description || "");
    setEditEventType(event.eventType);
    setEditVenue(event.venue || "");
    
    const formatForInput = (isoString: string) => {
      const d = new Date(isoString);
      const pad = (num: number) => String(num).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    
    setEditStartDatetime(formatForInput(event.startDatetime));
    setEditEndDatetime(formatForInput(event.endDatetime));
    setEditRegistrationLimit(event.registrationLimit || "");
    setEditParticipationPoints(event.participationPoints || 10);
    setEditVolunteerPoints(event.volunteerPoints || 20);
    setEditPosterUrl(event.posterUrl || "");
    setEditRegistrationDeadline(event.registrationDeadline ? formatForInput(event.registrationDeadline) : "");
    setEditVolunteerEmails(event.volunteerEmails?.join(", ") || "");
    setIsEditing(true);
    setMessage("");
  };

  const saveEventDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage("");
    try {
      const body = {
        title: editTitle,
        description: editDescription || undefined,
        eventType: editEventType,
        venue: editVenue || undefined,
        startDatetime: new Date(editStartDatetime).toISOString(),
        endDatetime: new Date(editEndDatetime).toISOString(),
        registrationDeadline: editRegistrationDeadline ? new Date(editRegistrationDeadline).toISOString() : null,
        registrationLimit: editRegistrationLimit === "" ? null : Number(editRegistrationLimit),
        participationPoints: Number(editParticipationPoints),
        volunteerPoints: Number(editVolunteerPoints),
        posterUrl: editPosterUrl || null,
        volunteerEmails: editVolunteerEmails.split(",").map((email) => email.trim()).filter(Boolean),
      };

      const res = await fetch(`/api/events/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const updated = await res.json();
        setEvent((prev) => (prev ? { ...prev, ...updated } : prev));
        setMessage("Event details updated successfully");
        setIsEditing(false);
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to update details");
      }
    } catch {
      setMessage("Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    async function fetchEvent() {
      try {
        const [eventRes, regRes] = await Promise.all([
          fetch(`/api/events/${params.id}`),
          fetch(`/api/events/${params.id}/registrations`),
        ]);
        
        if (eventRes.ok) {
          setEvent(await eventRes.json());
        }
        if (regRes.ok) {
          const regData = await regRes.json();
          setRegistrations(regData.registrations || []);
        }
      } catch (error) {
        console.error("Failed to fetch event:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [params.id]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    setMessage("");
    try {
      const res = await fetch(`/api/events/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setEvent((prev) => (prev ? { ...prev, ...updated } : prev));
        setMessage(`Status updated to ${newStatus}`);
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to update");
      }
    } catch {
      setMessage("Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  const downloadPDF = async () => {
    if (!event) return;
    try {
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([600, 800]);
      const { height } = page.getSize();
      
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const drawHeader = (p: typeof page) => {
        p.drawText(event.title, {
          x: 50,
          y: height - 60,
          size: 18,
          font: fontBold,
          color: rgb(0.1, 0.1, 0.18),
        });

        const eventInfo = `Type: ${event.eventType.replace("_", " ").toUpperCase()}   |   Venue: ${event.venue || "N/A"}`;
        p.drawText(eventInfo, {
          x: 50,
          y: height - 80,
          size: 9,
          font: fontRegular,
          color: rgb(0.4, 0.4, 0.4),
        });

        const dateStr = `Date: ${new Date(event.startDatetime).toLocaleDateString("en-IN")}   |   Time: ${new Date(event.startDatetime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
        p.drawText(dateStr, {
          x: 50,
          y: height - 95,
          size: 9,
          font: fontRegular,
          color: rgb(0.4, 0.4, 0.4),
        });

        p.drawText("Registered Attendees List", {
          x: 50,
          y: height - 130,
          size: 12,
          font: fontBold,
          color: rgb(0.1, 0.1, 0.18),
        });

        const tableTop = height - 150;
        p.drawLine({
          start: { x: 50, y: tableTop },
          end: { x: 550, y: tableTop },
          thickness: 1,
          color: rgb(0.8, 0.8, 0.8),
        });

        const headers = ["Name", "Department", "Batch", "Status"];
        const colWidths = [180, 110, 100, 110];
        const startX = 50;

        let currentX = startX;
        for (let i = 0; i < headers.length; i++) {
          p.drawText(headers[i], {
            x: currentX,
            y: tableTop - 12,
            size: 9,
            font: fontBold,
            color: rgb(0.2, 0.2, 0.2),
          });
          currentX += colWidths[i];
        }

        p.drawLine({
          start: { x: 50, y: tableTop - 20 },
          end: { x: 550, y: tableTop - 20 },
          thickness: 1,
          color: rgb(0.8, 0.8, 0.8),
        });
      };

      drawHeader(page);

      const colWidths = [180, 110, 100, 110];
      const startX = 50;
      let currentY = height - 190;

      for (let index = 0; index < registrations.length; index++) {
        const reg = registrations[index];

        if (currentY < 50) {
          page = pdfDoc.addPage([600, 800]);
          drawHeader(page);
          currentY = height - 190;
        }

        let currentX = startX;
        
        // Name
        page.drawText(reg.student.name, {
          x: currentX,
          y: currentY,
          size: 9,
          font: fontRegular,
          color: rgb(0.1, 0.1, 0.1),
        });
        currentX += colWidths[0];

        // Dept
        page.drawText(reg.student.department, {
          x: currentX,
          y: currentY,
          size: 9,
          font: fontRegular,
          color: rgb(0.3, 0.3, 0.3),
        });
        currentX += colWidths[1];

        // Batch
        page.drawText(reg.student.batch, {
          x: currentX,
          y: currentY,
          size: 9,
          font: fontRegular,
          color: rgb(0.3, 0.3, 0.3),
        });
        currentX += colWidths[2];

        // Status
        const statusText = reg.attended ? "Attended" : "Registered";
        page.drawText(statusText, {
          x: currentX,
          y: currentY,
          size: 9,
          font: fontBold,
          color: reg.attended ? rgb(0.1, 0.6, 0.2) : rgb(0.5, 0.5, 0.5),
        });

        currentY -= 20;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${event.title.replace(/\s+/g, "_")}_Attendance.pdf`;
      link.click();
    } catch (e) {
      console.error("PDF generation failed:", e);
      alert("Failed to generate PDF. Please try again.");
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
          onClick={() => router.push("/execom/events")}
        >
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Top bar with back button and Edit button */}
      <div className="flex items-center justify-between">
        <Link
          href="/execom/events"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a1a2e] transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to events
        </Link>
        {!isEditing && (
          <Button
            className="rounded-xl bg-[#D8615C] hover:bg-[#C0504B] text-white cursor-pointer shadow-md hover:shadow-lg transition-all"
            onClick={startEdit}
          >
            Edit Details
          </Button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={saveEventDetails} className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-[#1a1a2e] mb-4">Edit Event Details</h2>
          
          {message && (
            <div className="rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 border border-red-100 mb-4">
              {message}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="editTitle" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</Label>
            <Input id="editTitle" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="editDescription" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</Label>
            <Textarea id="editDescription" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={4} className="resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 flex flex-col justify-start">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Event Poster (Optional)</Label>
              <PosterUpload
                value={editPosterUrl}
                onChange={(val) => setEditPosterUrl(val)}
                onRemove={() => setEditPosterUrl("")}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="editDeadline" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Registration Deadline (Optional)</Label>
              <Input id="editDeadline" type="datetime-local" value={editRegistrationDeadline} onChange={(e) => setEditRegistrationDeadline(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Event Type</Label>
              <Select value={editEventType} onValueChange={setEditEventType}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="hackathon">Hackathon</SelectItem>
                  <SelectItem value="bootcamp">Bootcamp</SelectItem>
                  <SelectItem value="seminar">Seminar</SelectItem>
                  <SelectItem value="competition">Competition</SelectItem>
                  <SelectItem value="innovation_challenge">Innovation Challenge</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="editVenue" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Venue</Label>
              <Input id="editVenue" value={editVenue} onChange={(e) => setEditVenue(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="editStart" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date & Time</Label>
              <Input id="editStart" type="datetime-local" value={editStartDatetime} onChange={(e) => setEditStartDatetime(e.target.value)} required />
            </div>

            <div className="space-y-1">
              <Label htmlFor="editEnd" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date & Time</Label>
              <Input id="editEnd" type="datetime-local" value={editEndDatetime} onChange={(e) => setEditEndDatetime(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="editPoints" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Participation Points</Label>
              <Input id="editPoints" type="number" value={editParticipationPoints} onChange={(e) => setEditParticipationPoints(Number(e.target.value))} required />
            </div>

            <div className="space-y-1">
              <Label htmlFor="editVolPoints" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Volunteer Points</Label>
              <Input id="editVolPoints" type="number" value={editVolunteerPoints} onChange={(e) => setEditVolunteerPoints(Number(e.target.value))} required />
            </div>

            <div className="space-y-1">
              <Label htmlFor="editLimit" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Registration Limit (Optional)</Label>
              <Input id="editLimit" type="number" value={editRegistrationLimit} onChange={(e) => setEditRegistrationLimit(e.target.value === "" ? "" : Number(e.target.value))} placeholder="No limit" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="editVolunteers" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Volunteer Emails (comma-separated)</Label>
            <Textarea id="editVolunteers" value={editVolunteerEmails} onChange={(e) => setEditVolunteerEmails(e.target.value)} placeholder="email1@sjcetpalai.ac.in, email2@sjcetpalai.ac.in" rows={3} className="resize-none animate-in fade-in" />
          </div>

          <div className="flex gap-2 pt-4 justify-end">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setIsEditing(false)} disabled={updating}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white" disabled={updating}>
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </form>
      ) : (
        <>
          <EventHeader event={event} />

          <StatusActions
            event={event}
            updating={updating}
            message={message}
            onUpdateStatus={updateStatus}
          />

          <RegistrationsTable
            registrations={registrations}
            onDownloadPDF={downloadPDF}
          />
        </>
      )}
    </div>
  );
}
