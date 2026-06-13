import { Redis } from "@upstash/redis";

// ─── Redis singleton ──────────────────────────────────────────────────────────
let _redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (_redis) return _redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  _redis = new Redis({ url, token });
  return _redis;
}

export function isRedisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

// ─── Leaderboard key helpers ──────────────────────────────────────────────────

export type LeaderboardScope = "overall" | "monthly" | "weekly";

/** Returns the ISO week number (1-53) for a given date. */
function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

export function leaderboardKey(scope: LeaderboardScope): string {
  const now = new Date();
  switch (scope) {
    case "overall":
      return "lb:overall";
    case "monthly": {
      const month = String(now.getUTCMonth() + 1).padStart(2, "0");
      return `lb:monthly:${now.getUTCFullYear()}-${month}`;
    }
    case "weekly": {
      const week = String(isoWeek(now)).padStart(2, "0");
      return `lb:weekly:${now.getUTCFullYear()}-W${week}`;
    }
  }
}

/** TTLs in seconds */
export const LEADERBOARD_TTL: Record<LeaderboardScope, number> = {
  overall: 60,       // 1 minute
  monthly: 5 * 60,  // 5 minutes
  weekly: 5 * 60,   // 5 minutes
};

/** Start of the current period for time-scoped queries */
export function periodStart(scope: LeaderboardScope): Date | null {
  if (scope === "overall") return null;

  const now = new Date();

  if (scope === "monthly") {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }

  // Weekly: start of the ISO week (Monday)
  const day = now.getUTCDay() || 7; // treat Sunday as 7
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - day + 1);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}