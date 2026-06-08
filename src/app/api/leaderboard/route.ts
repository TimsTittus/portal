import { db } from "@/db";
import { studentProfiles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0");
  const limit = parseInt(searchParams.get("limit") || "20");

  // PostgreSQL-based leaderboard (works without Redis)
  const leaderboard = await db
    .select({
      id: studentProfiles.id,
      name: studentProfiles.name,
      department: studentProfiles.department,
      photoUrl: studentProfiles.photoUrl,
      iecdId: studentProfiles.iecdId,
      totalPoints: studentProfiles.totalPoints,
    })
    .from(studentProfiles)
    .where(eq(studentProfiles.isDeleted, false))
    .orderBy(desc(studentProfiles.totalPoints))
    .limit(limit)
    .offset(page * limit);

  const entries = leaderboard.map((student, i) => ({
    rank: page * limit + i + 1,
    ...student,
    points: student.totalPoints,
  }));

  return NextResponse.json({ leaderboard: entries, page, limit });
}
