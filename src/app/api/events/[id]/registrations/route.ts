import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { eventRegistrations, studentProfiles, eventAttendance } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as Record<string, unknown>).role as string;
  if (!["coordinator", "execom"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const registrations = await db
      .select({
        id: eventRegistrations.id,
        role: eventRegistrations.role,
        registeredAt: eventRegistrations.registeredAt,
        student: {
          id: studentProfiles.id,
          name: studentProfiles.name,
          department: studentProfiles.department,
          batch: studentProfiles.batch,
          iecdId: studentProfiles.iecdId,
        },
        attended: eventAttendance.id,
      })
      .from(eventRegistrations)
      .innerJoin(studentProfiles, eq(eventRegistrations.studentId, studentProfiles.id))
      .leftJoin(
        eventAttendance,
        and(
          eq(eventAttendance.eventId, eventRegistrations.eventId),
          eq(eventAttendance.studentId, studentProfiles.id)
        )
      )
      .where(eq(eventRegistrations.eventId, id));

    return NextResponse.json({
      registrations: registrations.map((r) => ({
        ...r,
        attended: !!r.attended,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch event registrations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
