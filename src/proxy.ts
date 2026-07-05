import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createClient as createSupabaseClient } from "@/utils/supabase/middleware";

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
