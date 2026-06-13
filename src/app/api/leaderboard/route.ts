import { db } from "@/db";
import { studentProfiles, pointsLog } from "@/db/schema";
import { desc, eq, gte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import {
  getRedis,
  leaderboardKey,
  LEADERBOARD_TTL,
  periodStart,
  type LeaderboardScope,
} from "@/lib/redis";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  department: string;
  photoUrl: string | null;
  iecdId: string;
  points: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Fetch from Postgres, return entries sorted by points desc. */
async function fetchFromDb(
  scope: LeaderboardScope,
  limit: number,
  offset: number
): Promise<LeaderboardEntry[]> {
  if (scope === "overall") {
    const rows = await db
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
      .offset(offset);

    return rows.map((r, i) => ({
      rank: offset + i + 1,
      ...r,
      points: r.totalPoints ?? 0,
    }));
  }

  // Monthly / Weekly — aggregate from pointsLog
  const start = periodStart(scope)!;

  const rows = await db
    .select({
      id: studentProfiles.id,
      name: studentProfiles.name,
      department: studentProfiles.department,
      photoUrl: studentProfiles.photoUrl,
      iecdId: studentProfiles.iecdId,
      periodPoints: sql<number>`COALESCE(SUM(${pointsLog.points}), 0)`,
    })
    .from(studentProfiles)
    .leftJoin(
      pointsLog,
      sql`${pointsLog.studentId} = ${studentProfiles.id} AND ${pointsLog.awardedAt} >= ${start}`
    )
    .where(eq(studentProfiles.isDeleted, false))
    .groupBy(
      studentProfiles.id,
      studentProfiles.name,
      studentProfiles.department,
      studentProfiles.photoUrl,
      studentProfiles.iecdId
    )
    .orderBy(desc(sql<number>`COALESCE(SUM(${pointsLog.points}), 0)`))
    .limit(limit)
    .offset(offset);

  return rows.map((r, i) => ({
    rank: offset + i + 1,
    id: r.id,
    name: r.name,
    department: r.department,
    photoUrl: r.photoUrl,
    iecdId: r.iecdId,
    points: r.periodPoints,
  }));
}

/** Try to read a page from Redis sorted set. Returns null on miss. */
async function fetchFromRedis(
  scope: LeaderboardScope,
  limit: number,
  offset: number
): Promise<LeaderboardEntry[] | null> {
  const redis = getRedis();
  if (!redis) return null;

  const key = leaderboardKey(scope);

  // ZREVRANGE with scores — member format is JSON-stringified entry
  const raw = await redis.zrange(key, offset, offset + limit - 1, {
    rev: true,
    withScores: true,
  });

  if (!raw || raw.length === 0) return null;

  const entries: LeaderboardEntry[] = [];
  for (let i = 0; i < raw.length; i += 2) {
    const member = raw[i] as string;
    const score = raw[i + 1] as number;
    try {
      const parsed = JSON.parse(member) as Omit<LeaderboardEntry, "rank" | "points">;
      entries.push({ ...parsed, rank: offset + entries.length + 1, points: score });
    } catch {
      // corrupt member — skip and let it be rebuilt
      return null;
    }
  }

  return entries.length > 0 ? entries : null;
}

/** Populate Redis sorted set from Postgres entries (top 200). */
async function populateRedis(scope: LeaderboardScope): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const key = leaderboardKey(scope);
  const ttl = LEADERBOARD_TTL[scope];

  // Fetch top 200 to populate the set
  const rows = await fetchFromDb(scope, 200, 0);
  if (rows.length === 0) return;

  const members = rows.map((r) => ({
    score: r.points,
    member: JSON.stringify({
      id: r.id,
      name: r.name,
      department: r.department,
      photoUrl: r.photoUrl,
      iecdId: r.iecdId,
    }),
  }));

  if (members.length === 0) return;

  // Destructure so TypeScript knows position-1 is a concrete ScoreMember,
  // satisfying the zadd overload that requires at least one positional arg.
  const [first, ...rest] = members;
  await redis.zadd(key, first, ...rest);
  await redis.expire(key, ttl);
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawScope = searchParams.get("scope") ?? "overall";
  const scope: LeaderboardScope =
    rawScope === "monthly" || rawScope === "weekly" ? rawScope : "overall";
  const page = parseInt(searchParams.get("page") ?? "0");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);
  const offset = page * limit;

  // 1. Try Redis
  let cached = await fetchFromRedis(scope, limit, offset);

  if (!cached) {
    // 2. Miss — populate Redis and read from Postgres
    populateRedis(scope).catch(console.error); // async, fire-and-forget
    cached = await fetchFromDb(scope, limit, offset);
  }

  return NextResponse.json({
    leaderboard: cached,
    scope,
    page,
    limit,
  });
}
