import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import {
  eventAttendance,
  eventRegistrations,
  studentProfiles,
  events,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyQRPayload } from "@/lib/qr";
import { awardPoints } from "@/lib/points";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as Record<string, unknown>).role as string;
  if (!["coordinator", "execom"].includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { qrData, eventId } = await request.json();

  // Parse QR payload
  let parsed;
  try {
    parsed = JSON.parse(qrData);
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid QR code format" },
      { status: 400 }
    );
  }

  // Fetch student
  const [student] = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.id, parsed.uid));

  if (!student) {
    return NextResponse.json(
      { success: false, message: "Student not found" },
      { status: 404 }
    );
  }

  // Verify HMAC
  const { valid } = verifyQRPayload(qrData, student.qrHmacSecret);
  if (!valid) {
    return NextResponse.json(
      { success: false, message: "Invalid QR code — signature mismatch" },
      { status: 400 }
    );
  }

  // Check event
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId));

  if (!event || !["published", "ongoing"].includes(event.status!)) {
    return NextResponse.json(
      { success: false, message: "Event not active" },
      { status: 400 }
    );
  }

  // Check for duplicate attendance
  const existing = await db
    .select()
    .from(eventAttendance)
    .where(
      and(
        eq(eventAttendance.eventId, eventId),
        eq(eventAttendance.studentId, student.id)
      )
    );

  if (existing.length > 0) {
    return NextResponse.json({
      success: false,
      message: `${student.name} already marked present`,
      studentName: student.name,
    });
  }

  // Check registration
  const registration = await db
    .select()
    .from(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.studentId, student.id)
      )
    );

  // Mark attendance
  await db.insert(eventAttendance).values({
    eventId,
    studentId: student.id,
    scannedBy: session.user.id,
  });

  // Award points
  const activityType =
    registration.length > 0 && registration[0].role === "volunteer"
      ? "event_volunteer"
      : "event_participation";

  await awardPoints({
    studentId: student.id,
    activityType,
    referenceId: eventId,
    referenceType: "event",
    awardedBy: session.user.id,
  });

  return NextResponse.json({
    success: true,
    studentName: student.name,
    studentPhoto: student.photoUrl,
    iecdId: student.iecdId,
    registered: registration.length > 0,
    message: `✅ ${student.name} marked present`,
  });
}
