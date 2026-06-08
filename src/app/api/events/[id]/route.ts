import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { events, eventRegistrations, eventAttendance } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { updateEventSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

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

  return NextResponse.json({
    ...event,
    registrationCount: regCount[0].count,
    attendanceCount: attCount[0].count,
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
  if (!["coordinator", "execom"].includes(role)) {
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

  const updateData: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.startDatetime)
    updateData.startDatetime = new Date(parsed.data.startDatetime);
  if (parsed.data.endDatetime)
    updateData.endDatetime = new Date(parsed.data.endDatetime);
  if (parsed.data.registrationDeadline)
    updateData.registrationDeadline = new Date(parsed.data.registrationDeadline);

  const [updated] = await db
    .update(events)
    .set(updateData)
    .where(eq(events.id, id))
    .returning();

  return NextResponse.json(updated);
}
