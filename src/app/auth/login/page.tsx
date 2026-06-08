"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginSchema } from "@/lib/validators";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      router.push("/student/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-[#EAE3D2]/60 shadow-xl shadow-black/5 p-8 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-[#1A1A2E] flex items-center justify-center shadow-md shadow-black/10">
          <span className="text-[#FBF5E8] font-serif font-bold text-lg">I.</span>
        </div>
        <div>
          <h1 className="text-2xl font-serif font-black text-[#1A1A2E] leading-tight">Welcome Back</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Sign in to your IEDC Portal</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
            className="rounded-xl h-11 bg-[#FAF6EE]/50 border-[#EAE3D2] focus:bg-white focus-visible:ring-[#1A1A2E]"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-xs font-semibold uppercase tracking-wider text-gray-500"
          >
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl h-11 bg-[#FAF6EE]/50 border-[#EAE3D2] focus:bg-white focus-visible:ring-[#1A1A2E]"
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-100 font-medium">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-full bg-[#1A1A2E] hover:bg-[#2A2A4E] text-[#FBF5E8] font-semibold transition-all shadow-md shadow-black/5 hover:shadow-lg hover:-translate-y-0.5 duration-200 mt-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
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
  );
}
