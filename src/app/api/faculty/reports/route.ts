import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import {
  users,
  studentProfiles,
  events,
  eventRegistrations,
  eventAttendance,
  projects,
} from "@/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as Record<string, unknown>).role as string;
  const execomRoles = [
    "ceo", "cto", "to", "cfo", "fo", "cco", "co", "cio", "io", "cmo", "mo", "coo", "oo", "cso", "so", "cvo", "vo", "cwit", "wit"
  ];
  if (role !== "faculty" && !execomRoles.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalStudents] = await db
    .select({ count: count() })
    .from(studentProfiles)
    .where(eq(studentProfiles.isDeleted, false));

  const [totalEvents] = await db
    .select({ count: count() })
    .from(events)
    .where(eq(events.isDeleted, false));

  const [totalRegistrations] = await db
    .select({ count: count() })
    .from(eventRegistrations);

  const [totalAttendance] = await db
    .select({ count: count() })
    .from(eventAttendance);

  const [pendingProjects] = await db
    .select({ count: count() })
    .from(projects)
    .where(eq(projects.status, "pending"));

  const [approvedProjects] = await db
    .select({ count: count() })
    .from(projects)
    .where(eq(projects.status, "approved"));

  // Department breakdown
  const departmentBreakdown = await db
    .select({
      department: studentProfiles.department,
      count: count(),
    })
    .from(studentProfiles)
    .where(eq(studentProfiles.isDeleted, false))
    .groupBy(studentProfiles.department);

  // Recent events
  const recentEvents = await db
    .select({
      id: events.id,
      title: events.title,
      eventType: events.eventType,
      venue: events.venue,
      startDatetime: events.startDatetime,
      endDatetime: events.endDatetime,
      status: events.status,
      participationPoints: events.participationPoints,
    })
    .from(events)
    .where(eq(events.isDeleted, false))
    .orderBy(desc(events.startDatetime))
    .limit(10);

  return NextResponse.json({
    totalStudents: totalStudents.count,
    totalEvents: totalEvents.count,
    totalRegistrations: totalRegistrations.count,
    totalAttendance: totalAttendance.count,
    pendingProjects: pendingProjects.count,
    approvedProjects: approvedProjects.count,
    departmentBreakdown,
    recentEvents,
  });
}
