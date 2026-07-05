import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { studentProfiles, coordinatorProfiles, facultyProfiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateProfileSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}

const execomRoles = [
  "ceo",
  "cto",
  "to",
  "cfo",
  "fo",
  "cco",
  "co",
  "cio",
  "io",
  "cmo",
  "mo",
  "coo",
  "oo",
  "cso",
  "so",
  "cvo",
  "vo",
  "cwit",
  "wit",
];

const PRIVATE_FIELDS = new Set([
  "id", "userId", "qrHmacSecret", "qrCodeUrl", "isDeleted",
]);

function stripPrivate<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !PRIVATE_FIELDS.has(k))
  ) as Partial<T>;
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);

  const iecdId = searchParams.get("iecdId");
  if (iecdId) {
    const [profile] = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.iecdId, iecdId));

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    return NextResponse.json(stripPrivate(profile));
  }

  const role = session.user.role;
  const isStudentOrExecom = role === "student" || execomRoles.includes(role || "");

  if (isStudentOrExecom) {
    const [profile] = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, session.user.id));

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const { id, userId, qrHmacSecret, qrCodeUrl, isDeleted, ...safe } = profile;
    return NextResponse.json({ ...safe, role });

  } else if (role === "coordinator") {
    let [profile] = await db
      .select()
      .from(coordinatorProfiles)
      .where(eq(coordinatorProfiles.userId, session.user.id));

    if (!profile) {
      [profile] = await db
        .insert(coordinatorProfiles)
        .values({ userId: session.user.id, name: session.user.name, phone: "", department: "" })
        .returning();
    }

    const { id, userId, ...safe } = profile;
    return NextResponse.json({ ...safe, role, email: session.user.email });

  } else if (role === "faculty") {
    let [profile] = await db
      .select()
      .from(facultyProfiles)
      .where(eq(facultyProfiles.userId, session.user.id));

    if (!profile) {
      [profile] = await db
        .insert(facultyProfiles)
        .values({ userId: session.user.id, name: session.user.name, phone: "", department: "", designation: "" })
        .returning();
    }

    const { id, userId, ...safe } = profile;
    return NextResponse.json({ ...safe, role, email: session.user.email });

  } else {
    return NextResponse.json({ error: "Unsupported role" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  const body = (await request.json()) as Record<string, unknown>;

  const isStudentOrExecom = role === "student" || execomRoles.includes(role || "");

  if (isStudentOrExecom) {
    if (typeof body.linkedinUrl === "string") {
      let val = body.linkedinUrl.trim();
      if (val && !val.startsWith("http://") && !val.startsWith("https://")) {
        val = val.includes("linkedin.com") ? `https://${val}` : `https://linkedin.com/in/${val}`;
      }
      body.linkedinUrl = val;
    }
    if (typeof body.githubUrl === "string") {
      let val = body.githubUrl.trim();
      if (val && !val.startsWith("http://") && !val.startsWith("https://")) {
        val = val.includes("github.com") ? `https://${val}` : `https://github.com/${val}`;
      }
      body.githubUrl = val;
    }
    if (typeof body.portfolioUrl === "string") {
      let val = body.portfolioUrl.trim();
      if (val && !val.startsWith("http://") && !val.startsWith("https://")) {
        val = `https://${val}`;
      }
      body.portfolioUrl = val;
    }

    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const [updated] = await db
      .update(studentProfiles)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(studentProfiles.userId, session.user.id))
      .returning();

    const { id, userId, qrHmacSecret, qrCodeUrl, isDeleted, ...safe } = updated;
    return NextResponse.json({ ...safe, role });

  } else if (role === "coordinator") {
    const updateData: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim().length >= 2) updateData.name = body.name.trim();
    if (typeof body.phone === "string") updateData.phone = body.phone.trim() || null;
    if (typeof body.department === "string") updateData.department = body.department.trim() || null;

    const [updated] = await db
      .update(coordinatorProfiles)
      .set(updateData)
      .where(eq(coordinatorProfiles.userId, session.user.id))
      .returning();

    const { id, userId, ...safe } = updated;
    return NextResponse.json({ ...safe, role, email: session.user.email });

  } else if (role === "faculty") {
    const updateData: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim().length >= 2) updateData.name = body.name.trim();
    if (typeof body.phone === "string") updateData.phone = body.phone.trim() || null;
    if (typeof body.department === "string") updateData.department = body.department.trim() || null;
    if (typeof body.designation === "string") updateData.designation = body.designation.trim() || null;

    const [updated] = await db
      .update(facultyProfiles)
      .set(updateData)
      .where(eq(facultyProfiles.userId, session.user.id))
      .returning();

    const { id, userId, ...safe } = updated;
    return NextResponse.json({ ...safe, role, email: session.user.email });
  }

  return NextResponse.json({ error: "Unsupported role" }, { status: 400 });
}