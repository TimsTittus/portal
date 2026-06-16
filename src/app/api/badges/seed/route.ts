import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { seedBadges } from "@/lib/badge-seeds";

async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}

// POST /api/badges/seed — seed default badges (execom only)
export async function POST() {
  const session = await getSession();
  if (!session || session.user.role !== "execom") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const count = await seedBadges();
  return NextResponse.json({ seeded: count });
}