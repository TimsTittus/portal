/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2 } from "lucide-react";

const DEPARTMENTS = [
  { value: "cse", label: "Computer Science & Engineering (CSE)" },
  { value: "cy", label: "CS - Cyber Security (CY)" },
  { value: "ai", label: "CS - Artificial Intelligence (AI)" },
  { value: "ec", label: "Electronics & Communication (EC)" },
  { value: "ecs", label: "Electronics & Computer Science (ECS)" },
  { value: "me", label: "Mechanical Engineering (ME)" },
  { value: "ce", label: "Civil Engineering (CE)" },
  { value: "eee", label: "Electrical & Electronics (EEE)" },
  { value: "ct", label: "Computer Technology (CT)" },
  { value: "mba", label: "MBA" },
  { value: "mca", label: "MCA" },
];

function parseStudentEmail(email: string) {
  const parts = email.split("@");
  if (parts.length !== 2) return null;
  const username = parts[0];
  const domain = parts[1];

  const domainParts = domain.split(".");
  // For student email: name2027@dept.sjcetpalai.ac.in
  if (domainParts.length < 4 || domainParts[1] !== "sjcetpalai") return null;

  const deptCode = domainParts[0].toLowerCase();
  
  // Extract graduating year
  const match = username.match(/(\d+)$/);
  if (!match) return { deptCode, gradYear: null, batch: "" };
  const gradYear = parseInt(match[1]);
  if (isNaN(gradYear)) return { deptCode, gradYear: null, batch: "" };

  // Calculate batch based on dept
  const duration = ["mca", "mba"].includes(deptCode) ? 2 : 4;
  const startYear = gradYear - duration;
  const batch = `${startYear}-${gradYear}`;

  return {
    deptCode,
    gradYear,
    batch,
  };
}

export default function StudentOnboardingPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [batch, setBatch] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isPending && session) {
      setName(session.user?.name || "");
      const parsed = parseStudentEmail(session.user?.email || "");
      if (parsed) {
        if (parsed.deptCode && DEPARTMENTS.some(d => d.value === parsed.deptCode)) {
          setDepartment(parsed.deptCode);
        }
        if (parsed.batch) {
          setBatch(parsed.batch);
        }
      }
    }
  }, [session, isPending]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/student/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          admissionNumber,
          department,
          batch,
          phone,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/student/dashboard");
          router.refresh();
        }, 1200);
      } else {
        setError(data.error || "Failed to complete onboarding");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#FBF5E8] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#1A1A2E]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF5E8] text-[#1A1A2E] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl md:rounded-[2.5rem] border border-[#EAE3D2]/60 shadow-xl p-6 sm:p-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#1A1A2E] flex items-center justify-center mx-auto shadow-md">
            <span className="text-[#FBF5E8] font-serif font-bold text-xl">I.</span>
          </div>
          <h1 className="text-3xl font-serif font-black tracking-tight text-[#1A1A2E] mt-4">
            Welcome to SJCET IEDC! 👋
          </h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Let&apos;s complete your profile details. Some details are pre-filled based on your college email.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Full Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl h-11 bg-[#FAF6EE]/50 border-[#EAE3D2] focus:bg-white"
                required
              />
            </div>

            {/* Email (read only) */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Email Address
              </Label>
              <Input
                id="email"
                value={session?.user?.email || ""}
                className="rounded-xl h-11 bg-gray-50 text-gray-400 border-[#EAE3D2] cursor-not-allowed"
                disabled
              />
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Department
              </Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="rounded-xl h-11 bg-[#FAF6EE]/50 border-[#EAE3D2]">
                  <SelectValue placeholder="Select Department" />
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

            {/* Batch */}
            <div className="space-y-1.5">
              <Label htmlFor="batch" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Batch (e.g. 2023-2027)
              </Label>
              <Input
                id="batch"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="rounded-xl h-11 bg-[#FAF6EE]/50 border-[#EAE3D2] focus:bg-white"
                placeholder="2023-2027"
                required
              />
            </div>

            {/* Admission Number */}
            <div className="space-y-1.5">
              <Label htmlFor="admissionNumber" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Admission Number
              </Label>
              <Input
                id="admissionNumber"
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                className="rounded-xl h-11 bg-[#FAF6EE]/50 border-[#EAE3D2] focus:bg-white"
                placeholder="e.g. 23CS101"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl h-11 bg-[#FAF6EE]/50 border-[#EAE3D2] focus:bg-white"
                placeholder="10-digit number"
                type="tel"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-100 font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 text-emerald-700 text-sm rounded-xl px-4 py-3 border border-emerald-100 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Onboarding completed! Redirecting to dashboard...
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting || success || !department}
            className="w-full h-12 rounded-full bg-[#1A1A2E] hover:bg-[#2A2A4E] text-[#FBF5E8] font-semibold text-sm transition-all shadow-md hover:shadow-lg mt-2"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              "Complete Registration"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
