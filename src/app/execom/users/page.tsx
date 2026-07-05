"use client";

import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Trash2 } from "lucide-react";

interface StaffEmail {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function ExecomUsersPage() {
  const [staffEmails, setStaffEmails] = useState<StaffEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    try {
      const res = await fetch("/api/users/staff");
      if (res.ok) {
        setStaffEmails(await res.json());
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addStaff(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError("");

    try {
      const res = await fetch("/api/users/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, role: newRole }),
      });

      if (res.ok) {
        setNewEmail("");
        setNewRole("");
        fetchStaff();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add staff email");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setAdding(false);
    }
  }

  const execomRolesList = [
    { value: "ceo", label: "CEO (Chief Executive Officer)" },
    { value: "cto", label: "CTO (Chief Technical Officer)" },
    { value: "to", label: "TO (Technical Officer)" },
    { value: "cfo", label: "CFO (Chief Finance Officer)" },
    { value: "fo", label: "FO (Finance Officer)" },
    { value: "cco", label: "CCO (Chief Creative Officer)" },
    { value: "co", label: "CO (Creative Officer)" },
    { value: "cio", label: "CIO (Chief Innovation Officer)" },
    { value: "io", label: "IO (Innovation Officer)" },
    { value: "cmo", label: "CMO (Chief Marketing Officer)" },
    { value: "mo", label: "MO (Marketing Officer)" },
    { value: "coo", label: "COO (Chief Operations Officer)" },
    { value: "oo", label: "OO (Operations Officer)" },
    { value: "cso", label: "CSO (Chief Skills Officer)" },
    { value: "so", label: "SO (Skills Officer)" },
    { value: "cvo", label: "CVO (Chief Vibes Officer)" },
    { value: "vo", label: "VO (Vibes Officer)" },
    { value: "cwit", label: "CWIT (Chief Women in Tech)" },
    { value: "wit", label: "WIT (Women in Tech)" },
  ];

  const roleColors: Record<string, string> = {
    coordinator: "bg-blue-50 text-blue-700",
    faculty: "bg-green-50 text-green-700",
  };
  execomRolesList.forEach((r) => {
    roleColors[r.value] = "bg-purple-50 text-purple-700";
  });

  return (
    <div className="space-y-6 max-w-3xl">
      {" "}
      {/* Container */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
          User Management
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage staff email whitelist and user access
        </p>
      </div>

      {/* Add staff form */}
      <form
        onSubmit={addStaff}
        className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4"
      >
        <h3 className="font-semibold text-[#1a1a2e]">
          Add Staff Email
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-1 space-y-2">
            <Label>Email</Label>
            <Input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="rounded-xl"
              placeholder="staff@college.edu.in"
              type="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coordinator">Coordinator</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
                {execomRolesList.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              disabled={adding || !newRole}
              className="rounded-xl bg-[#1a1a2e] hover:bg-[#2a2a4e] w-full"
            >
              {adding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </>
              )}
            </Button>
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </form>

      {/* Staff list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="font-semibold text-[#1a1a2e]">
            Whitelisted Staff ({staffEmails.length})
          </h3>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : staffEmails.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {staffEmails.map((staff) => (
              <div
                key={staff.id}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-[#1a1a2e]">
                    {staff.email}
                  </p>
                  <p className="text-xs text-gray-400">
                    Added{" "}
                    {new Date(staff.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <Badge
                  className={`capitalize ${roleColors[staff.role] || ""}`}
                  variant="secondary"
                >
                  {staff.role}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-sm">
              No staff emails added yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
