import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import {
  badges,
  studentBadges,
  studentProfiles,
  users,
} from "@/db/schema";
import { eq, sql, count } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { BadgeCriteria } from "@/lib/points";

async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}

const execomRoles = [
  "ceo", "cto", "to", "cfo", "fo", "cco", "co", "cio", "io", "cmo", "mo", "coo", "oo", "cso", "so", "cvo", "vo", "cwit", "wit"
];

// GET /api/badges — list all active badges + earned status
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allBadges = await db
    .select()
    .from(badges)
    .where(eq(badges.isActive, true));

  // If the user is a student, attach earned timestamps
  let earnedMap = new Map<string, Date | null>();

  if (session.user.role === "student" || execomRoles.includes(session.user.role || "")) {
    const [profile] = await db
      .select({ id: studentProfiles.id })
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, session.user.id));

    if (profile) {
      const earned = await db
        .select()
        .from(studentBadges)
        .where(eq(studentBadges.studentId, profile.id));

      earnedMap = new Map(earned.map((e) => [e.badgeId, e.earnedAt]));
    }
  }

  // For execom/faculty — also get count of students who earned each badge
  let badgeCountMap = new Map<string, number>();
  if (execomRoles.includes(session.user.role || "") || session.user.role === "faculty") {
    const counts = await db
      .select({
        badgeId: studentBadges.badgeId,
        count: count(),
      })
      .from(studentBadges)
      .groupBy(studentBadges.badgeId);

    badgeCountMap = new Map(counts.map((c) => [c.badgeId, c.count]));
  }

  const result = allBadges.map((badge) => ({
    id: badge.id,
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    criteria: badge.criteria as BadgeCriteria,
    earnedAt: earnedMap.get(badge.id)?.toISOString() ?? null,
    earnedCount: badgeCountMap.get(badge.id) ?? undefined,
  }));

  return NextResponse.json({ badges: result });
}

// POST /api/badges — create a new badge (execom only)
const VALID_CRITERIA_TYPES = new Set(["points", "event_count", "project_count", "volunteer_count", "streak"]);

function validateCriteria(criteria: unknown): criteria is BadgeCriteria {
  if (!criteria || typeof criteria !== "object") return false;
  const c = criteria as Record<string, unknown>;
  if (!VALID_CRITERIA_TYPES.has(c.type as string)) return false;

  if (c.type === "points") {
    return typeof c.threshold === "number" && c.threshold > 0;
  }
  return typeof c.min === "number" && c.min > 0;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !execomRoles.includes(session.user.role || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { name, description, icon, criteria } = body as {
    name?: string;
    description?: string;
    icon?: string;
    criteria?: unknown;
  };

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Name is required (min 2 chars)" }, { status: 400 });
  }

  if (!validateCriteria(criteria)) {
    return NextResponse.json(
      { error: "Invalid criteria. Must have a valid type and threshold/min." },
      { status: 400 }
    );
  }

  const [badge] = await db
    .insert(badges)
    .values({
      name: name.trim(),
      description: description?.trim() || null,
      icon: icon?.trim() || "🏅",
      criteria,
    })
    .returning();

  return NextResponse.json({ badge }, { status: 201 });
}