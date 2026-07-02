"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  TrendingUp,
  UserCheck,
  Loader2,
  QrCode,
  FileDown,
} from "lucide-react";
import Link from "next/link";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

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

interface Registration {
  id: string;
  role: string;
  registeredAt: string;
  student: {
    id: string;
    name: string;
    department: string;
    batch: string;
    iecdId: string;
  };
  attended: boolean;
}

export default function ExecomEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);

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

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    published: "bg-blue-50 text-blue-700",
    ongoing: "bg-green-50 text-green-700",
    completed: "bg-purple-50 text-purple-700",
    cancelled: "bg-red-50 text-red-700",
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back button */}
      <Link
        href="/execom/events"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a1a2e] transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to events
      </Link>

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
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant="secondary"
              className={`capitalize shrink-0 ${statusColors[event.status || "draft"]}`}
            >
              {event.status}
            </Badge>
            <Link href={`/execom/events/${event.id}/scan`}>
              <Button size="sm" className="bg-[#1a1a2e] text-white hover:bg-[#2a2a4e] rounded-xl">
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

        {/* Status actions */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="font-semibold text-[#1a1a2e] mb-3">Manage Status</h3>
          {message && (
            <div className="mb-3 rounded-xl px-4 py-3 text-sm bg-blue-50 text-blue-700 border border-blue-100">
              {message}
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {(() => {
              const currentStatus = event.status || "draft";
              const actions: Array<{ label: string; value: string; className: string }> = [];
              
              if (currentStatus === "draft") {
                actions.push({ label: "Publish Event", value: "published", className: "bg-blue-600 hover:bg-blue-700 text-white border-transparent" });
              } else if (currentStatus === "published") {
                actions.push({ label: "Start Event (Ongoing)", value: "ongoing", className: "bg-green-600 hover:bg-green-700 text-white border-transparent" });
                actions.push({ label: "Cancel Event", value: "cancelled", className: "bg-red-50 hover:bg-red-100 text-red-600 border-red-200" });
              } else if (currentStatus === "ongoing") {
                actions.push({ label: "Mark as Completed", value: "completed", className: "bg-purple-600 hover:bg-purple-700 text-white border-transparent" });
              }
              
              if (actions.length === 0) {
                return <p className="text-sm text-gray-500">No further status updates available.</p>;
              }
              
              return actions.map((action) => (
                <Button
                  key={action.value}
                  variant="outline"
                  size="sm"
                  className={`rounded-xl font-medium shadow-sm transition-all ${action.className}`}
                  disabled={updating}
                  onClick={() => updateStatus(action.value)}
                >
                  {updating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {action.label}
                </Button>
              ));
            })()}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1a1a2e]">Registered Students ({registrations.length})</h3>
          {registrations.length > 0 && (
            <Button
              onClick={downloadPDF}
              variant="outline"
              size="icon"
              title="Download PDF Report"
              className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer w-8 h-8 flex items-center justify-center bg-white"
            >
              <FileDown className="w-4 h-4" />
            </Button>
          )}
        </div>
        {registrations.length === 0 ? (
          <p className="text-gray-500 text-sm">No students registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl rounded-bl-xl">Name</th>
                  <th className="px-4 py-3">IEDC ID</th>
                  <th className="px-4 py-3">Dept & Year</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 rounded-tr-xl rounded-br-xl">Attended</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-900">{reg.student.name}</td>
                    <td className="px-4 py-3">{reg.student.iecdId}</td>
                    <td className="px-4 py-3">{reg.student.department} ({reg.student.batch})</td>
                    <td className="px-4 py-3 capitalize">{reg.role}</td>
                    <td className="px-4 py-3">
                      {reg.attended ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-none">Present</Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
