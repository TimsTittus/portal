import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { events, eventRegistrations, studentProfiles, users } from "@/db/schema";
import { eq, desc, and, sql, count, inArray } from "drizzle-orm";
import { createEventSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status") || "published";

  const conditions = [eq(events.isDeleted, false)];
  if (status === "active") {
    conditions.push(inArray(events.status, ["published", "ongoing"]));
  } else if (status !== "all") {
    conditions.push(eq(events.status, status as "draft" | "published" | "ongoing" | "completed" | "cancelled"));
  }

  const eventsList = await db
    .select()
    .from(events)
    .where(and(...conditions))
    .orderBy(desc(events.startDatetime))
    .limit(limit)
    .offset(page * limit);

  const totalResult = await db
    .select({ count: count() })
    .from(events)
    .where(and(...conditions));

  return NextResponse.json({
    events: eventsList,
    total: totalResult[0].count,
    page,
    limit,
  });
}

export async function POST(request: Request) {
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

  const body = await request.json();
  const parsed = createEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { volunteerEmails, ...eventData } = parsed.data;

  const [event] = await db
    .insert(events)
    .values({
      ...eventData,
      startDatetime: new Date(parsed.data.startDatetime),
      endDatetime: new Date(parsed.data.endDatetime),
      registrationDeadline: parsed.data.registrationDeadline
        ? new Date(parsed.data.registrationDeadline)
        : null,
      coordinatorId: session.user.id,
      status: "draft",
    })
    .returning();

  if (execomRoles.includes(role) && volunteerEmails && volunteerEmails.length > 0) {
    const profiles = await db
      .select({ studentId: studentProfiles.id })
      .from(studentProfiles)
      .innerJoin(users, eq(studentProfiles.userId, users.id))
      .where(inArray(users.email, volunteerEmails));

    if (profiles.length > 0) {
      const regValues = profiles.map((p) => ({
        eventId: event.id,
        studentId: p.studentId,
        role: "volunteer" as "volunteer" | "participant",
      }));
      await db.insert(eventRegistrations).values(regValues);
    }
  }

  return NextResponse.json(event, { status: 201 });
}
