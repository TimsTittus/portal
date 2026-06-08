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
    <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 p-8 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-xl bg-[#1a1a2e] flex items-center justify-center">
          <span className="text-white font-bold text-lg">I.</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1a1a2e]">Create Account</h1>
          <p className="text-sm text-gray-500">Join the IEDC community</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="rounded-xl h-11 bg-gray-50 border-gray-200 focus:bg-white"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-email">College Email</Label>
          <Input
            id="reg-email"
            type="email"
            placeholder="you@college.edu.in"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="rounded-xl h-11 bg-gray-50 border-gray-200 focus:bg-white"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-password">Password</Label>
          <Input
            id="reg-password"
            type="password"
            placeholder="Min. 8 characters"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            className="rounded-xl h-11 bg-gray-50 border-gray-200 focus:bg-white"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="admission">Admission No.</Label>
            <Input
              id="admission"
              placeholder="e.g. ADM2025001"
              value={formData.admissionNumber}
              onChange={(e) => handleChange("admissionNumber", e.target.value)}
              className="rounded-xl h-11 bg-gray-50 border-gray-200 focus:bg-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="batch">Batch</Label>
            <Input
              id="batch"
              placeholder="2022-2026"
              value={formData.batch}
              onChange={(e) => handleChange("batch", e.target.value)}
              className="rounded-xl h-11 bg-gray-50 border-gray-200 focus:bg-white"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Department</Label>
          <Select
            value={formData.department}
            onValueChange={(val) => handleChange("department", val)}
          >
            <SelectTrigger className="rounded-xl h-11 bg-gray-50 border-gray-200">
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

        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            placeholder="+91 9876543210"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="rounded-xl h-11 bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-100">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white font-medium transition-all duration-200"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-[#1a1a2e] font-semibold hover:underline"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
