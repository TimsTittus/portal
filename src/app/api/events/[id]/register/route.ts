import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { eventRegistrations, events, studentProfiles } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { NextResponse } from "next/server";

async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await params;
  const body = await request.json().catch(() => ({}));
  const role = (body.role as string) || "participant";

  // Get student profile
  const [profile] = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, session.user.id));

  if (!profile) {
    return NextResponse.json(
      { error: "Student profile not found" },
      { status: 404 }
    );
  }

  // Check event exists and is published
  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event || event.status !== "published") {
    return NextResponse.json(
      { error: "Event not available for registration" },
      { status: 400 }
    );
  }

  // Check registration limit
  if (event.registrationLimit) {
    const regCount = await db
      .select({ count: count() })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId));

    if (regCount[0].count >= event.registrationLimit) {
      return NextResponse.json({ error: "Event is full" }, { status: 400 });
    }
  }

  // Check deadline
  if (event.registrationDeadline && new Date() > event.registrationDeadline) {
    return NextResponse.json(
      { error: "Registration deadline has passed" },
      { status: 400 }
    );
  }

  // Check if already registered
  const existing = await db
    .select()
    .from(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.studentId, profile.id)
      )
    );

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Already registered for this event" },
      { status: 409 }
    );
  }

  const [registration] = await db
    .insert(eventRegistrations)
    .values({
      eventId,
      studentId: profile.id,
      role: role as "participant" | "volunteer",
    })
    .returning();

  return NextResponse.json(registration, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await params;

  const [profile] = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, session.user.id));

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  await db
    .delete(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.studentId, profile.id)
      )
    );

  return NextResponse.json({ message: "Registration cancelled" });
}
