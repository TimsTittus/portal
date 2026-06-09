import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { projects, studentProfiles, projectTeamMembers } from "@/db/schema";
import { eq, desc, and, count } from "drizzle-orm";
import { createProjectSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status") || "approved";
  const my = searchParams.get("my") === "true";

  if (my) {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [profile] = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, session.user.id));

    if (!profile) {
      return NextResponse.json({ projects: [], page, limit });
    }

    const projectsList = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.isDeleted, false),
          eq(projects.submittedBy, profile.id)
        )
      )
      .orderBy(desc(projects.submittedAt))
      .limit(limit)
      .offset(page * limit);

    return NextResponse.json({ projects: projectsList, page, limit });
  }

  const projectsList = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.isDeleted, false),
        eq(projects.status, status as "pending" | "approved" | "rejected")
      )
    )
    .orderBy(desc(projects.submittedAt))
    .limit(limit)
    .offset(page * limit);

  return NextResponse.json({ projects: projectsList, page, limit });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [profile] = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, session.user.id));

  if (!profile) {
    return NextResponse.json(
      { error: "Student profile not found" },
      { status: 404 }
    );
  }

  const { teamMembers, ...projectData } = parsed.data;

  const [project] = await db
    .insert(projects)
    .values({
      ...projectData,
      submittedBy: profile.id,
    })
    .returning();

  // Add submitter as team member
  await db.insert(projectTeamMembers).values({
    projectId: project.id,
    studentId: profile.id,
    role: "Lead",
  });

  return NextResponse.json(project, { status: 201 });
}