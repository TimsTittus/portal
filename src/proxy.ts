import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createClient as createSupabaseClient } from "@/utils/supabase/middleware";
import { db } from "@/db";
import { studentProfiles, allowedStaffEmails, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const execomRoles = [
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

const protectedRoutes: Record<string, string[]> = {
  "/student": ["student"],
  "/coordinator": ["coordinator", ...execomRoles],
  "/execom": execomRoles,
  "/faculty": ["faculty", ...execomRoles],
};

const authRoutes = ["/auth/login", "/auth/register"];

export async function proxy(request: NextRequest) {
  const supabaseResponse = createSupabaseClient(request);
  const { pathname } = request.nextUrl;

  // Check if this is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Get session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If session is present, process automatic role updates & onboarding redirects
  if (session) {
    const email = session.user.email;
     const isCollegeEmail =
      email.endsWith("@sjcetpalai.ac.in") ||
      email.endsWith(".sjcetpalai.ac.in")
    if (!isCollegeEmail) {
      return NextResponse.redirect(
        new URL("/auth/login?error=Only SJCET college email IDs are allowed.", request.url)
      );
    }

    let role = (session.user as Record<string, unknown>).role as string;

    // 1. Auto-update whitelisted staff role upon first request/login
    if (role === "student" && email.endsWith("@sjcetpalai.ac.in") && !email.includes(".ac.in", 0)) {
      const [staff] = await db
        .select()
        .from(allowedStaffEmails)
        .where(eq(allowedStaffEmails.email, email));
      if (staff) {
        await db
          .update(users)
          .set({ role: staff.role })
          .where(eq(users.id, session.user.id));
        role = staff.role;
      }
    }

    // 2. Redirect student to onboarding page if they do not have a profile yet
    if (role === "student") {
      const [profile] = await db
        .select({ id: studentProfiles.id })
        .from(studentProfiles)
        .where(eq(studentProfiles.userId, session.user.id));

      const isOnboardingRoute = pathname === "/student/onboarding" || pathname === "/api/student/onboarding";

      if (!profile && !isOnboardingRoute) {
        return NextResponse.redirect(new URL("/student/onboarding", request.url));
      }

      if (profile && pathname === "/student/onboarding") {
        return NextResponse.redirect(new URL("/student/dashboard", request.url));
      }
    }
  }

  // If on auth route and already logged in, redirect to dashboard
  if (isAuthRoute && session) {
    const role = (session.user as Record<string, unknown>).role as string;
    const dashboardUrl = getDashboardForRole(role);
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Check protected routes
  for (const [prefix, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(prefix)) {
      // Allow guests to view student event details page
      if (prefix === "/student" && pathname.match(/^\/student\/events\/[a-zA-Z0-9-]+$/)) {
        continue;
      }

      if (!session) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
      const role = (session.user as Record<string, unknown>).role as string;
      if (!allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    }
  }

  return supabaseResponse;
}

function getDashboardForRole(role: string): string {
  if (execomRoles.includes(role)) {
    return "/execom/analytics";
  }
  switch (role) {
    case "student":
      return "/student/dashboard";
    case "coordinator":
      return "/coordinator/events";
    case "faculty":
      return "/faculty/reports";
    default:
      return "/student/dashboard";
  }
}

export const config = {
  matcher: [
    "/student/:path*",
    "/coordinator/:path*",
    "/execom/:path*",
    "/faculty/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
