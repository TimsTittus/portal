import { db } from "@/db";
import {
  pointsLog,
  studentProfiles,
  pointRules,
  badges,
  studentBadges,
  eventAttendance,
} from "@/db/schema";
import { eq, sql, and, count } from "drizzle-orm";

type ActivityType =
  | "event_participation"
  | "event_volunteer"
  | "event_coordinator"
  | "project_submission"
  | "competition_winner"
  | "workshop_completion"
  | "startup_idea"
  | "manual_award";

export async function awardPoints(params: {
  studentId: string;
  activityType: ActivityType;
  referenceId?: string;
  referenceType?: string;
  awardedBy?: string;
  note?: string;
  customPoints?: number;
}): Promise<number> {
  const {
    studentId,
    activityType,
    referenceId,
    referenceType,
    awardedBy,
    note,
    customPoints,
  } = params;

  // Get configured points for this activity type
  let points = customPoints;
  if (!points) {
    const rules = await db
      .select()
      .from(pointRules)
      .where(eq(pointRules.activityType, activityType));
    points = rules.length > 0 ? rules[0].points : getDefaultPoints(activityType);
  }

  // Log points
  await db.insert(pointsLog).values({
    studentId,
    points,
    activityType,
    referenceId,
    referenceType,
    awardedBy,
    note,
  });

  // Update student total
  await db
    .update(studentProfiles)
    .set({
      totalPoints: sql`${studentProfiles.totalPoints} + ${points}`,
      updatedAt: new Date(),
    })
    .where(eq(studentProfiles.id, studentId));

  // Check badges (async, don't await)
  checkAndAwardBadges(studentId).catch(console.error);

  return points;
}

function getDefaultPoints(activityType: ActivityType): number {
  const defaults: Record<ActivityType, number> = {
    event_participation: 10,
    event_volunteer: 20,
    event_coordinator: 30,
    project_submission: 25,
    competition_winner: 50,
    workshop_completion: 15,
    startup_idea: 40,
    manual_award: 10,
  };
  return defaults[activityType] || 10;
}

async function checkAndAwardBadges(studentId: string): Promise<void> {
  const [student] = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.id, studentId));

  if (!student) return;

  const allBadges = await db
    .select()
    .from(badges)
    .where(eq(badges.isActive, true));

  const earnedBadges = await db
    .select()
    .from(studentBadges)
    .where(eq(studentBadges.studentId, studentId));

  const earnedIds = new Set(earnedBadges.map((b) => b.badgeId));

  const attendanceResult = await db
    .select({ count: count() })
    .from(eventAttendance)
    .where(eq(eventAttendance.studentId, studentId));

  const eventCount = attendanceResult[0]?.count || 0;

  for (const badge of allBadges) {
    if (earnedIds.has(badge.id)) continue;

    const criteria = badge.criteria as Record<string, unknown>;
    let eligible = false;

    if (criteria.type === "points") {
      eligible = (student.totalPoints || 0) >= (criteria.threshold as number);
    } else if (criteria.type === "event_count") {
      eligible = eventCount >= (criteria.min as number);
    }

    if (eligible) {
      await db.insert(studentBadges).values({
        studentId,
        badgeId: badge.id,
      });
    }
  }
}
