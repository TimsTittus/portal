import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { allowedStaffEmails } from "@/db/schema";
import { addStaffEmailSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

const execomRoles = [
  "ceo", "cto", "to", "cfo", "fo", "cco", "co", "cio", "io", "cmo", "mo", "coo", "oo", "cso", "so", "cvo", "vo", "cwit", "wit"
];

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as Record<string, unknown>).role as string;
  if (!execomRoles.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const staffEmails = await db.select().from(allowedStaffEmails);
  return NextResponse.json(staffEmails);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as Record<string, unknown>).role as string;
  if (!execomRoles.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = addStaffEmailSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [staff] = await db
    .insert(allowedStaffEmails)
    .values({
      email: parsed.data.email,
      role: parsed.data.role,
      addedBy: session.user.id,
    })
    .returning();

  return NextResponse.json(staff, { status: 201 });
}
