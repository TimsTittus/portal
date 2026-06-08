import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createClient as createSupabaseClient } from "@/utils/supabase/middleware";

const protectedRoutes: Record<string, string[]> = {
  "/student": ["student"],
  "/coordinator": ["coordinator", "execom"],
  "/execom": ["execom"],
  "/faculty": ["faculty", "execom"],
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
  switch (role) {
    case "student":
      return "/student/dashboard";
    case "coordinator":
      return "/coordinator/events";
    case "execom":
      return "/execom/analytics";
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
