import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { badges } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { BadgeCriteria } from "@/lib/points";

async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}

const VALID_CRITERIA_TYPES = new Set(["points", "event_count", "project_count", "volunteer_count", "streak"]);

const execomRoles = [
  "ceo", "cto", "to", "cfo", "fo", "cco", "co", "cio", "io", "cmo", "mo", "coo", "oo", "cso", "so", "cvo", "vo", "cwit", "wit"
];

function validateCriteria(criteria: unknown): criteria is BadgeCriteria {
  if (!criteria || typeof criteria !== "object") return false;
  const c = criteria as Record<string, unknown>;
  if (!VALID_CRITERIA_TYPES.has(c.type as string)) return false;

  if (c.type === "points") {
    return typeof c.threshold === "number" && c.threshold > 0;
  }
  return typeof c.min === "number" && c.min > 0;
}

// PUT /api/badges/[id] — update a badge (execom only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || !execomRoles.includes(session.user.role || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name, description, icon, criteria, isActive } = body as {
    name?: string;
    description?: string;
    icon?: string;
    criteria?: unknown;
    isActive?: boolean;
  };

  const updateData: Record<string, unknown> = {};

  if (typeof name === "string" && name.trim().length >= 2) {
    updateData.name = name.trim();
  }
  if (typeof description === "string") {
    updateData.description = description.trim() || null;
  }
  if (typeof icon === "string") {
    updateData.icon = icon.trim() || "🏅";
  }
  if (criteria !== undefined) {
    if (!validateCriteria(criteria)) {
      return NextResponse.json(
        { error: "Invalid criteria. Must have a valid type and threshold/min." },
        { status: 400 }
      );
    }
    updateData.criteria = criteria;
  }
  if (typeof isActive === "boolean") {
    updateData.isActive = isActive;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const [updated] = await db
    .update(badges)
    .set(updateData)
    .where(eq(badges.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Badge not found" }, { status: 404 });
  }

  return NextResponse.json({ badge: updated });
}

// DELETE /api/badges/[id] — soft-delete (deactivate) a badge
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || !execomRoles.includes(session.user.role || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const [updated] = await db
    .update(badges)
    .set({ isActive: false })
    .where(eq(badges.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Badge not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}