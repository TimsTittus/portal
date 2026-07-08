import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { events, eventRegistrations, eventAttendance, studentProfiles, users, pointsLog } from "@/db/schema";
import { eq, count, and, inArray, notInArray } from "drizzle-orm";
import { updateEventSchema } from "@/lib/validators";
import { NextResponse } from "next/server";
import { awardPoints } from "@/lib/points";

async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [event] = await db.select().from(events).where(eq(events.id, id));

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const regCount = await db
    .select({ count: count() })
    .from(eventRegistrations)
    .where(eq(eventRegistrations.eventId, id));

  const attCount = await db
    .select({ count: count() })
    .from(eventAttendance)
    .where(eq(eventAttendance.eventId, id));

  const session = await getSession();
  let isRegistered = false;
  if (session) {
    const [profile] = await db
      .select({ id: studentProfiles.id })
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, session.user.id));
    if (profile) {
      const existing = await db
        .select()
        .from(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.eventId, id),
            eq(eventRegistrations.studentId, profile.id)
          )
        );
      isRegistered = existing.length > 0;
    }
  }

  const volunteers = await db
    .select({ email: users.email })
    .from(eventRegistrations)
    .innerJoin(studentProfiles, eq(eventRegistrations.studentId, studentProfiles.id))
    .innerJoin(users, eq(studentProfiles.userId, users.id))
    .where(
      and(
        eq(eventRegistrations.eventId, id),
        eq(eventRegistrations.role, "volunteer")
      )
    );

  const volunteerEmails = volunteers.map((v) => v.email);

  return NextResponse.json({
    ...event,
    registrationCount: regCount[0].count,
    attendanceCount: attCount[0].count,
    registered: isRegistered,
    volunteerEmails,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as Record<string, unknown>).role as string;
  const execomRoles = [
    "ceo", "cto", "to", "cfo", "fo", "cco", "co", "cio", "io", "cmo", "mo", "coo", "oo", "cso", "so", "cvo", "vo", "cwit", "wit"
  ];
  if (role !== "coordinator" && !execomRoles.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Extract volunteerEmails from updates (since it is not an events table column)
  const { volunteerEmails, ...eventUpdates } = parsed.data;

  const updateData: Record<string, unknown> = { ...eventUpdates, updatedAt: new Date() };
  if (eventUpdates.startDatetime)
    updateData.startDatetime = new Date(eventUpdates.startDatetime);
  if (eventUpdates.endDatetime)
    updateData.endDatetime = new Date(eventUpdates.endDatetime);
  if (eventUpdates.registrationDeadline !== undefined)
    updateData.registrationDeadline = eventUpdates.registrationDeadline ? new Date(eventUpdates.registrationDeadline) : null;

  const [updated] = await db
    .update(events)
    .set(updateData)
    .where(eq(events.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Sync volunteer registrations and award points if volunteerEmails is provided
  if (volunteerEmails !== undefined) {
    let targetProfiles: Array<{ studentId: string }> = [];
    if (volunteerEmails.length > 0) {
      targetProfiles = await db
        .select({ studentId: studentProfiles.id })
        .from(studentProfiles)
        .innerJoin(users, eq(studentProfiles.userId, users.id))
        .where(inArray(users.email, volunteerEmails));
    }

    const targetStudentIds = targetProfiles.map((p) => p.studentId);

    // Delete volunteer registrations that are not in the new list
    if (targetStudentIds.length > 0) {
      await db
        .delete(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.eventId, id),
            eq(eventRegistrations.role, "volunteer"),
            notInArray(eventRegistrations.studentId, targetStudentIds)
          )
        );
    } else {
      await db
        .delete(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.eventId, id),
            eq(eventRegistrations.role, "volunteer")
          )
        );
    }

    // Register new volunteers and award points
    for (const studentId of targetStudentIds) {
      const [existingReg] = await db
        .select()
        .from(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.eventId, id),
            eq(eventRegistrations.studentId, studentId)
          )
        );

      if (!existingReg) {
        await db.insert(eventRegistrations).values({
          eventId: id,
          studentId,
          role: "volunteer",
        });
      } else if (existingReg.role !== "volunteer") {
        await db
          .update(eventRegistrations)
          .set({ role: "volunteer" })
          .where(eq(eventRegistrations.id, existingReg.id));
      }

      // Check points log to avoid awarding points multiple times
      const [existingPointsLog] = await db
        .select()
        .from(pointsLog)
        .where(
          and(
            eq(pointsLog.studentId, studentId),
            eq(pointsLog.activityType, "event_volunteer"),
            eq(pointsLog.referenceId, id)
          )
        );

      if (!existingPointsLog) {
        await awardPoints({
          studentId,
          activityType: "event_volunteer",
          referenceId: id,
          referenceType: "event",
          customPoints: updated.volunteerPoints || 20,
          note: `Volunteered for event: ${updated.title}`,
          awardedBy: session.user.id,
        });
      }
    }
  }

  return NextResponse.json(updated);
}
