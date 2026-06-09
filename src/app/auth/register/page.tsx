"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerSchema } from "@/lib/validators";
import { Loader2, Eye, EyeOff } from "lucide-react";

const DEPARTMENTS = [
  { value: "CSE", label: "Computer Science & Engineering (CSE)" },
  { value: "CC", label: "CSE CyberSecurity (CC)" },
  { value: "CA", label: "CSE AI (CA)" },
  { value: "AIDS", label: "Artificial Intelligence & DataScience (AIDS)" },
  { value: "ER", label: "Electronics and Computer Science (ER)" },
  { value: "ECE", label: "Electronics and Communication Engineering (ECE)" },
  { value: "EEE", label: "Electrical and Electronics Engineering (EEE)" },
  { value: "ME", label: "Mechanical Engineering (ME)" },
  { value: "CE", label: "Civil Engineering (CE)" },
  { value: "IMCA", label: "Integrated MCA (IMCA)" },
  { value: "MCA", label: "MCA" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    admissionNumber: "",
    department: "",
    batch: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [admissionStatus, setAdmissionStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  useEffect(() => {
    const admissionNo = formData.admissionNumber.trim();
    if (!admissionNo) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-admission?admissionNumber=${encodeURIComponent(admissionNo)}`);
        if (res.ok) {
          const data = await res.json();
          setAdmissionStatus(data.available ? "available" : "taken");
        }
      } catch (err) {
        console.error(err);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.admissionNumber]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "admissionNumber") {
      setAdmissionStatus(value.trim() ? "checking" : "idle");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (admissionStatus === "taken") {
      setError("This admission number is already registered.");
      setLoading(false);
      return;
    }

    const parsed = registerSchema.safeParse(formData);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      router.push("/auth/login?registered=true");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-[2.5rem] border border-[#EAE3D2]/60 shadow-xl shadow-black/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                Connect. Innovate. Elevate.
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Join the official IEDC Student Engagement Portal. Submit projects, earn points, track your innovation journey, and gain access to exclusive startup opportunities.
              </p>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative w-full aspect-[4/3] flex items-center justify-center my-6">
            <img
              src="/illustrations/student-jumping-red.png"
              alt="Innovator Girl"
              className="object-contain max-h-[260px] w-auto animate-float"
            />
          </div>

          <div className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
            © 2026 IEDC Innovation Hub
          </div>
        </div>

        {/* Right side: Form */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          {/* Mobile Branding */}
          <div className="flex items-center gap-3 mb-6 md:hidden">
            <div className="w-9 h-9 rounded-xl bg-[#1A1A2E] flex items-center justify-center shadow-md shadow-black/10">
              <span className="text-[#FBF5E8] font-serif font-bold text-md">I.</span>
            </div>
            <div>
              <h1 className="text-xl font-serif font-black text-[#1A1A2E] leading-tight">Create Account</h1>
              <p className="text-[10px] text-gray-500 font-medium">Join the IEDC community</p>
            </div>
          </div>

          {/* Desktop Title */}
          <div className="hidden md:block mb-6">
            <h2 className="text-2xl font-serif font-black text-[#1A1A2E] leading-tight">Create Account</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Join the IEDC community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="rounded-xl h-11 bg-[#FAF6EE]/50 border-[#EAE3D2] focus:bg-white focus-visible:ring-[#1A1A2E]"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="reg-email" className="text-xs font-semibold uppercase tracking-wider text-gray-500">College Email</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="you@college.edu.in"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="rounded-xl h-11 bg-[#FAF6EE]/50 border-[#EAE3D2] focus:bg-white focus-visible:ring-[#1A1A2E]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <Label htmlFor="reg-password" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Password</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 chars"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="rounded-xl h-11 bg-[#FAF6EE]/50 border-[#EAE3D2] focus:bg-white focus-visible:ring-[#1A1A2E] pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirm-password" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className="rounded-xl h-11 bg-[#FAF6EE]/50 border-[#EAE3D2] focus:bg-white focus-visible:ring-[#1A1A2E] pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <Label htmlFor="admission" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Admission No.</Label>
                <Input
                  id="admission"
                  placeholder="ADM2025001"
                  value={formData.admissionNumber}
                  onChange={(e) => handleChange("admissionNumber", e.target.value)}
                  className="rounded-xl h-11 bg-[#FAF6EE]/50 border-[#EAE3D2] focus:bg-white focus-visible:ring-[#1A1A2E]"
                  required
                />
                {admissionStatus === "checking" && (
                  <p className="text-[10px] text-yellow-600 font-semibold mt-1 animate-pulse">Checking availability...</p>
                )}
                {admissionStatus === "available" && (
                  <p className="text-[10px] text-green-600 font-semibold mt-1">✓ Available</p>
                )}
                {admissionStatus === "taken" && (
                  <p className="text-[10px] text-red-600 font-semibold mt-1">✗ Already registered</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="batch" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Graduation Year</Label>
                <Input
                  id="batch"
                  maxLength={4}
                  placeholder="e.g. 2026"
                  value={formData.batch}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    handleChange("batch", val);
                  }}
                  className="rounded-xl h-11 bg-[#FAF6EE]/50 border-[#EAE3D2] focus:bg-white focus-visible:ring-[#1A1A2E]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(val) => handleChange("department", val)}
              >
                <SelectTrigger className="rounded-xl h-11 bg-[#FAF6EE]/50 border-[#EAE3D2] focus:bg-white focus-visible:ring-[#1A1A2E]">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Phone (optional)</Label>
              <Input
                id="phone"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="rounded-xl h-11 bg-[#FAF6EE]/50 border-[#EAE3D2] focus:bg-white focus-visible:ring-[#1A1A2E]"
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
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6 font-medium">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-[#D8615C] font-bold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}