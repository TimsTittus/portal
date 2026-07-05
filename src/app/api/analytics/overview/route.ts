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
import { eq, count, sql } from "drizzle-orm";
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
  if (!execomRoles.includes(role)) {
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

  const [totalUsers] = await db.select({ count: count() }).from(users);

  // Department breakdown
  const deptBreakdown = await db
    .select({
      department: studentProfiles.department,
      count: count(),
    })
    .from(studentProfiles)
    .where(eq(studentProfiles.isDeleted, false))
    .groupBy(studentProfiles.department);

  return NextResponse.json({
    totalStudents: totalStudents.count,
    totalEvents: totalEvents.count,
    totalRegistrations: totalRegistrations.count,
    totalAttendance: totalAttendance.count,
    pendingProjects: pendingProjects.count,
    totalUsers: totalUsers.count,
    departmentBreakdown: deptBreakdown,
  });
}
