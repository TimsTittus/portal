"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginSchema } from "@/lib/validators";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";

function getDashboardPath(role?: string): string {
  switch (role) {
    case "faculty":
      return "/faculty/reports";
    case "coordinator":
      return "/coordinator/events";
    case "execom":
      return "/execom/analytics";
    default:
      return "/student/dashboard";
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      setLoading(false);
      return;
    }

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      setSuccess(true);

      // Determine destination based on user role
      const userRole = (result.data as { user?: { role?: string } })?.user?.role;
      const destination = getDashboardPath(userRole);

      // Brief pause so the user sees the success feedback, then navigate
      await new Promise((resolve) => setTimeout(resolve, 1200));

      router.push(destination);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl md:rounded-[2.5rem] border border-[#EAE3D2]/60 shadow-xl shadow-black/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left side: Premium Branding & Illustration */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-[#FAF6EE] border-r border-[#EAE3D2]/40 relative">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1A1A2E] flex items-center justify-center shadow-md shadow-black/10">
                <span className="text-[#FBF5E8] font-serif font-bold text-lg">I.</span>
              </div>
              <div>
                <h1 className="text-xl font-serif font-black text-[#1A1A2E] tracking-tight">IEDC Portal</h1>
              </div>
            </div>

            <div className="space-y-2 mt-8">
              <h2 className="text-3xl font-serif font-extrabold text-[#1A1A2E] leading-tight">
                Welcome Back!
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Sign in to your account to continue sharing ideas, exploring events, and tracking your innovation journey.
              </p>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative w-full aspect-[4/3] flex items-center justify-center my-6">
            <img
              src="/illustrations/student-jumping-red.png"
              alt="Innovator Girl"
              className="object-contain max-h-[260px] w-auto"
            />
          </div>

          <div className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
            © 2026 IEDC Innovation Hub
          </div>
        </div>

        {/* Right side: Form */}
        <div className="px-5 py-8 sm:px-8 sm:py-10 md:p-10 flex flex-col justify-center">
          {/* Mobile Branding */}
          <div className="flex items-center gap-3 mb-6 md:hidden">
            <div className="w-9 h-9 rounded-xl bg-[#1A1A2E] flex items-center justify-center shadow-md shadow-black/10 shrink-0">
              <span className="text-[#FBF5E8] font-serif font-bold text-md">I.</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-serif font-black text-[#1A1A2E] leading-tight truncate">Welcome Back</h1>
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Sign in to your IEDC Portal</p>
            </div>
          </div>

          {/* Desktop Title */}
          <div className="hidden md:block mb-6">
            <h2 className="text-2xl font-serif font-black text-[#1A1A2E] leading-tight">Welcome Back</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Sign in to your IEDC Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@college.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl h-11 sm:h-11 text-base sm:text-sm bg-[#FAF6EE]/50 border-[#EAE3D2] focus:bg-white focus-visible:ring-[#1A1A2E]"
                required
                disabled={loading || success}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl h-11 sm:h-11 text-base sm:text-sm bg-[#FAF6EE]/50 border-[#EAE3D2] focus:bg-white focus-visible:ring-[#1A1A2E] pr-12"
                  required
                  disabled={loading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-gray-400 hover:text-gray-600 active:text-gray-800 transition-colors rounded-r-xl touch-manipulation"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px] sm:w-4 sm:h-4" /> : <Eye className="w-[18px] h-[18px] sm:w-4 sm:h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-100 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 text-emerald-700 text-sm rounded-xl px-4 py-3 border border-emerald-100 font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Signed in successfully! Redirecting…
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || success}
              className="w-full h-12 sm:h-12 rounded-full bg-[#1A1A2E] hover:bg-[#2A2A4E] text-[#FBF5E8] font-semibold text-base sm:text-sm transition-all shadow-md shadow-black/5 hover:shadow-lg hover:-translate-y-0.5 duration-200 mt-2 touch-manipulation"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 animate-spin" />
              ) : success ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 sm:w-4 sm:h-4" />
                  Success
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6 font-medium">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-[#D8615C] font-bold hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}