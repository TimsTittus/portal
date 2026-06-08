import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { events, eventRegistrations, studentProfiles } from "@/db/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";
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
  if (status !== "all") {
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
  if (!["coordinator", "execom"].includes(role)) {
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

  const [event] = await db
    .insert(events)
    .values({
      ...parsed.data,
      startDatetime: new Date(parsed.data.startDatetime),
      endDatetime: new Date(parsed.data.endDatetime),
      registrationDeadline: parsed.data.registrationDeadline
        ? new Date(parsed.data.registrationDeadline)
        : null,
      coordinatorId: session.user.id,
      status: "draft",
    })
    .returning();

  return NextResponse.json(event, { status: 201 });
}
