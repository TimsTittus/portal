"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { QrCode, Edit3, Save, Loader2, RefreshCw } from "lucide-react";

interface ProfileData {
  name: string;
  iecdId: string;
  admissionNumber: string;
  department: string;
  batch: string;
  phone: string | null;
  bio: string | null;
  skills: string[];
  interests: string[];
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  qrCodeUrl: string | null;
  totalPoints: number | null;
}

export default function StudentProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<ProfileData>>({});
  const [showQR, setShowQR] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/student/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setQrUrl(data.qrCodeUrl || "");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setEditing(false);
        setEditData({});
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  }

  async function regenerateQR() {
    try {
      const res = await fetch("/api/student/qr", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setQrUrl(data.qrCodeUrl);
      }
    } catch (error) {
      console.error("QR regeneration error:", error);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-3xl">
        <div className="h-48 bg-gray-200 rounded-2xl" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
        Profile
      </h1>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-24 w-24 bg-[#1a1a2e]">
              <AvatarFallback className="bg-[#1a1a2e] text-white text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-xs"
              onClick={() => setShowQR(!showQR)}
            >
              <QrCode className="w-3 h-3 mr-1" />
              {showQR ? "Hide QR" : "Show QR"}
            </Button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-[#1a1a2e]">
              {profile.name}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {profile.iecdId}
            </p>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 text-sm">
              <div>
                <span className="text-gray-400">Department</span>
                <p className="font-medium text-[#1a1a2e]">
                  {profile.department}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Batch</span>
                <p className="font-medium text-[#1a1a2e]">{profile.batch}</p>
              </div>
              <div>
                <span className="text-gray-400">Admission No.</span>
                <p className="font-medium text-[#1a1a2e]">
                  {profile.admissionNumber}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Total Points</span>
                <p className="font-medium text-[#1a1a2e]">
                  {profile.totalPoints || 0}
                </p>
              </div>
            </div>

            {profile.bio && (
              <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                {profile.bio}
              </p>
            )}

            {profile.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="rounded-lg">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="rounded-xl shrink-0"
            onClick={() => {
              setEditing(!editing);
              setEditData({
                bio: profile.bio || "",
                phone: profile.phone || "",
                linkedinUrl: profile.linkedinUrl || "",
                githubUrl: profile.githubUrl || "",
              });
            }}
          >
            <Edit3 className="w-3 h-3 mr-1" />
            Edit
          </Button>
        </div>

        {/* QR Code */}
        {showQR && qrUrl && (
          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col items-center gap-3">
            <img
              src={qrUrl}
              alt="QR Code"
              className="w-48 h-48 rounded-xl border border-gray-100"
            />
            <p className="text-xs text-gray-400">
              Show this QR code at events for attendance
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-xs"
              onClick={regenerateQR}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Regenerate QR
            </Button>
          </div>
        )}
      </div>

      {/* Edit form */}
      {editing && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-[#1a1a2e]">Edit Profile</h3>

          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              value={editData.bio || ""}
              onChange={(e) =>
                setEditData((p) => ({ ...p, bio: e.target.value }))
              }
              className="rounded-xl resize-none"
              rows={3}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={editData.phone || ""}
                onChange={(e) =>
                  setEditData((p) => ({ ...p, phone: e.target.value }))
                }
                className="rounded-xl"
                placeholder="+91 9876543210"
              />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn URL</Label>
              <Input
                value={editData.linkedinUrl || ""}
                onChange={(e) =>
                  setEditData((p) => ({ ...p, linkedinUrl: e.target.value }))
                }
                className="rounded-xl"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className="space-y-2">
              <Label>GitHub URL</Label>
              <Input
                value={editData.githubUrl || ""}
                onChange={(e) =>
                  setEditData((p) => ({ ...p, githubUrl: e.target.value }))
                }
                className="rounded-xl"
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-[#1a1a2e] hover:bg-[#2a2a4e]"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}
              Save Changes
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
