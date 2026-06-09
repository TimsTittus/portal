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

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const targetId = searchParams.get("id");

  if (targetId) {
    const profile = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.id, targetId));

    if (profile.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const publicProfile = { ...profile[0] };
    delete (publicProfile as Record<string, unknown>).qrHmacSecret;
    return NextResponse.json(publicProfile);
  }

  const role = session.user.role;

  if (role === "student") {
    const profile = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, session.user.id));

    if (profile.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ ...profile[0], role });
  } else if (role === "coordinator") {
    let [profile] = await db
      .select()
      .from(coordinatorProfiles)
      .where(eq(coordinatorProfiles.userId, session.user.id));

    if (!profile) {
      [profile] = await db
        .insert(coordinatorProfiles)
        .values({
          userId: session.user.id,
          name: session.user.name,
          phone: "",
          department: "",
        })
        .returning();
    }

    return NextResponse.json({ ...profile, role, email: session.user.email });
  } else if (role === "faculty") {
    let [profile] = await db
      .select()
      .from(facultyProfiles)
      .where(eq(facultyProfiles.userId, session.user.id));

    if (!profile) {
      [profile] = await db
        .insert(facultyProfiles)
        .values({
          userId: session.user.id,
          name: session.user.name,
          phone: "",
          department: "",
          designation: "",
        })
        .returning();
    }

    return NextResponse.json({ ...profile, role, email: session.user.email });
  } else {
    // e.g. execom
    return NextResponse.json({
      userId: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role,
    });
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  const body = (await request.json()) as Record<string, unknown>;

  if (role === "student") {
    if (typeof body.linkedinUrl === "string") {
      let val = body.linkedinUrl.trim();
      if (val && !val.startsWith("http://") && !val.startsWith("https://")) {
        if (val.includes("linkedin.com")) {
          val = `https://${val}`;
        } else {
          val = `https://linkedin.com/in/${val}`;
        }
      }
      body.linkedinUrl = val;
    }

    if (typeof body.githubUrl === "string") {
      let val = body.githubUrl.trim();
      if (val && !val.startsWith("http://") && !val.startsWith("https://")) {
        if (val.includes("github.com")) {
          val = `https://${val}`;
        } else {
          val = `https://github.com/${val}`;
        }
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
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(studentProfiles)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(studentProfiles.userId, session.user.id))
      .returning();

    return NextResponse.json(updated);
  } else if (role === "coordinator") {
    const updateData: Record<string, any> = {};
    if (typeof body.name === "string" && body.name.trim().length >= 2) {
      updateData.name = body.name.trim();
    }
    if (typeof body.phone === "string") {
      updateData.phone = body.phone.trim() || null;
    }
    if (typeof body.department === "string") {
      updateData.department = body.department.trim() || null;
    }

    const [updated] = await db
      .update(coordinatorProfiles)
      .set(updateData)
      .where(eq(coordinatorProfiles.userId, session.user.id))
      .returning();

    return NextResponse.json({ ...updated, role, email: session.user.email });
  } else if (role === "faculty") {
    const updateData: Record<string, any> = {};
    if (typeof body.name === "string" && body.name.trim().length >= 2) {
      updateData.name = body.name.trim();
    }
    if (typeof body.phone === "string") {
      updateData.phone = body.phone.trim() || null;
    }
    if (typeof body.department === "string") {
      updateData.department = body.department.trim() || null;
    }
    if (typeof body.designation === "string") {
      updateData.designation = body.designation.trim() || null;
    }

    const [updated] = await db
      .update(facultyProfiles)
      .set(updateData)
      .where(eq(facultyProfiles.userId, session.user.id))
      .returning();

    return NextResponse.json({ ...updated, role, email: session.user.email });
  } else if (role === "execom") {
    const updateData: Record<string, any> = {};
    if (typeof body.name === "string" && body.name.trim().length >= 2) {
      updateData.name = body.name.trim();
    }

    const [updated] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, session.user.id))
      .returning();

    return NextResponse.json({ userId: updated.id, name: updated.name, email: updated.email, role });
  }

  return NextResponse.json({ error: "Unsupported role" }, { status: 400 });
}