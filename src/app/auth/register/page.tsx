"use client";

import { useState } from "react";
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
import { Loader2 } from "lucide-react";

const DEPARTMENTS = [
  { value: "CSE", label: "Computer Science & Engineering" },
  { value: "ECE", label: "Electronics & Communication" },
  { value: "MEE", label: "Mechanical Engineering" },
  { value: "CIV", label: "Civil Engineering" },
  { value: "EEE", label: "Electrical Engineering" },
  { value: "IT", label: "Information Technology" },
  { value: "MCA", label: "Master of Computer Applications" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    admissionNumber: "",
    department: "",
    batch: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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
    <div className="bg-white rounded-[2.5rem] border border-[#EAE3D2]/60 shadow-xl shadow-black/5 p-8 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-[#1A1A2E] flex items-center justify-center shadow-md shadow-black/10">
          <span className="text-[#FBF5E8] font-serif font-bold text-lg">I.</span>
        </div>
        <div>
          <h1 className="text-2xl font-serif font-black text-[#1A1A2E] leading-tight">Create Account</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Join the IEDC community</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
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

        <div className="space-y-1.5">
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

        <div className="space-y-1.5">
          <Label htmlFor="reg-password" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Password</Label>
          <Input
            id="reg-password"
            type="password"
            placeholder="Min. 8 characters"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            className="rounded-xl h-11 bg-[#FAF6EE]/50 border-[#EAE3D2] focus:bg-white focus-visible:ring-[#1A1A2E]"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="admission" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Admission No.</Label>
            <Input
              id="admission"
              placeholder="ADM2025001"
              value={formData.admissionNumber}
              onChange={(e) => handleChange("admissionNumber", e.target.value)}
              className="rounded-xl h-11 bg-[#FAF6EE]/50 border-[#EAE3D2] focus:bg-white focus-visible:ring-[#1A1A2E]"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="batch" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Batch</Label>
            <Input
              id="batch"
              placeholder="2022-2026"
              value={formData.batch}
              onChange={(e) => handleChange("batch", e.target.value)}
              className="rounded-xl h-11 bg-[#FAF6EE]/50 border-[#EAE3D2] focus:bg-white focus-visible:ring-[#1A1A2E]"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
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

        <div className="space-y-1.5">
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
  );
}
