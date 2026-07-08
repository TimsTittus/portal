"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const [error, setError] = useState(searchParams.get("error") || "");
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await signIn.social({
        provider: "google",
        callbackURL: redirectTo || "/student/dashboard",
      });
    } catch (err) {
      setError((err as Error).message || "Failed to sign in with Google");
      setGoogleLoading(false);
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
          <div className="relative w-full aspect-4/3 flex items-center justify-center my-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/student-jumping-red.png"
              alt="Innovator Girl"
              className="object-contain max-h-65 w-auto"
            />
          </div>

          <div className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
            © 2026 IEDC Innovation Hub
          </div>
        </div>

        {/* Right side: Form */}
        <div className="px-5 py-12 sm:px-8 sm:py-16 md:p-16 flex flex-col justify-center min-h-100">
          {/* Mobile Branding */}
          <div className="flex items-center gap-3 mb-8 md:hidden">
            <div className="w-9 h-9 rounded-xl bg-[#1A1A2E] flex items-center justify-center shadow-md shadow-black/10 shrink-0">
              <span className="text-[#FBF5E8] font-serif font-bold text-md">I.</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-serif font-black text-[#1A1A2E] leading-tight truncate">Welcome Back</h1>
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Sign in to your IEDC Portal</p>
            </div>
          </div>

          {/* Desktop Title */}
          <div className="hidden md:block mb-8">
            <h2 className="text-2xl font-serif font-black text-[#1A1A2E] leading-tight">Welcome Back</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Sign in to your IEDC Portal</p>
          </div>

          <div className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-100 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                {error}
              </div>
            )}



            <Button
              type="button"
              variant="outline"
              disabled={googleLoading}
              onClick={handleGoogleSignIn}
              className="w-full h-12 rounded-full border border-[#EAE3D2] hover:bg-[#FAF6EE] text-[#1A1A2E] font-semibold text-base sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign In with Google
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}