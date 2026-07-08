"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { QrCode, Edit3, Save, Loader2, Globe, LogOut } from "lucide-react";
import { LinkedinIcon, GithubIcon } from "@/components/ui/icons";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getGithubUsername } from "@/lib/utils";
import { BadgeShowcase } from "@/components/badges/badge-showcase";

function ProfileQR({ onOpenModal }: { onOpenModal: (url: string) => void }) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQR() {
      try {
        const res = await fetch("/api/student/qr");
        if (res.ok) {
          const { qrDataUrl } = await res.json();
          setQrDataUrl(qrDataUrl);
        }
      } catch (err) {
        console.error("Failed to load QR code", err);
      } finally {
        setLoading(false);
      }
    }
    fetchQR();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[220px]">
        <Loader2 className="w-6 h-6 animate-spin text-[#1a1a2e]" />
      </div>
    );
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col items-center gap-3">
      <div
        className="relative cursor-pointer border-2 border-[#1a1a2e]/5 rounded-2xl p-2 bg-white shadow-sm hover:shadow-md transition-all active:scale-95"
        onClick={() => qrDataUrl && onOpenModal(qrDataUrl)}
      >
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt="Attendance QR Code"
            className="w-44 h-44 rounded-xl object-contain block"
          />
        ) : (
          <div className="w-44 h-44 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 text-xs">
            Failed to load QR
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center max-w-[200px] leading-relaxed">
        Click to enlarge QR Code
      </p>
    </div>
  );
}

interface ProfileData {
  name: string;
  role?: string;
  email?: string;
  iecdId?: string;
  admissionNumber?: string;
  department?: string;
  batch?: string;
  designation?: string;
  phone: string | null;
  bio?: string | null;
  skills?: string[];
  interests?: string[];
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  qrCodeUrl?: string | null;
  totalPoints?: number | null;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/auth/login");
            router.refresh();
          },
        },
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<ProfileData>>({});
  const [showQR, setShowQR] = useState(false);
  const [modalQrUrl, setModalQrUrl] = useState("");
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/student/profile");
        if (res.ok) setProfile(await res.json());
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

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

  const initials = (profile.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const execomRoles = [
    "ceo",
    "cto",
    "to",
    "cfo",
    "fo",
    "cco",
    "co",
    "cio",
    "io",
    "cmo",
    "mo",
    "coo",
    "oo",
    "cso",
    "so",
    "cvo",
    "vo",
    "cwit",
    "wit",
  ];

  const userRole = profile.role || "student";
  const isStudent = userRole === "student" || execomRoles.includes(userRole);
  const isCoordinator = userRole === "coordinator";
  const isFaculty = userRole === "faculty";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
          Profile
        </h1>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium text-xs cursor-pointer"
          onClick={handleSignOut}
        >
          <LogOut className="w-3.5 h-3.5 mr-1" />
          Sign Out
        </Button>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-start gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-24 w-24 bg-[#1a1a2e]">
              {session?.user?.image && (
                <AvatarImage src={session.user.image} alt={profile.name} className="object-cover" />
              )}
              <AvatarFallback className="bg-[#1a1a2e] text-white text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isStudent && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs cursor-pointer"
                onClick={() => setShowQR(!showQR)}
              >
                <QrCode className="w-3 h-3 mr-1" />
                {showQR ? "Hide QR" : "My QR Code"}
              </Button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#1a1a2e]">
                {profile.name}
              </h2>
              <Badge className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold uppercase px-2 py-0.5 border">
                {userRole}
              </Badge>
            </div>
            {isStudent && profile.iecdId && (
              <p className="text-sm text-gray-500 mt-0.5">
                {profile.iecdId}
              </p>
            )}

            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-4 text-sm">
              <div>
                <span className="text-gray-400">Email</span>
                <p className="font-medium text-[#1a1a2e] truncate">
                  {profile.email || session?.user?.email || "N/A"}
                </p>
              </div>
              {isStudent && (
                <div>
                  <span className="text-gray-400">Total Points</span>
                  <p className="font-medium text-[#1a1a2e]">
                    {profile.totalPoints || 0}
                  </p>
                </div>
              )}
              {(isStudent || isCoordinator || isFaculty) && (
                <div>
                  <span className="text-gray-400">Department</span>
                  <p className="font-medium text-[#1a1a2e]">
                    {profile.department || "N/A"}
                  </p>
                </div>
              )}
              {isStudent && (
                <>
                  <div>
                    <span className="text-gray-400">Batch</span>
                    <p className="font-medium text-[#1a1a2e]">{profile.batch || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Admission No.</span>
                    <p className="font-medium text-[#1a1a2e]">
                      {profile.admissionNumber || "N/A"}
                    </p>
                  </div>
                </>
              )}
              {isFaculty && (
                <div>
                  <span className="text-gray-400">Designation</span>
                  <p className="font-medium text-[#1a1a2e]">
                    {profile.designation || "N/A"}
                  </p>
                </div>
              )}
              {(isStudent || isCoordinator || isFaculty) && (
                <div>
                  <span className="text-gray-400">Phone</span>
                  <p className="font-medium text-[#1a1a2e]">
                    {profile.phone || "N/A"}
                  </p>
                </div>
              )}
            </div>

            {isStudent && profile.bio && (
              <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                {profile.bio}
              </p>
            )}

            {isStudent && profile.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="rounded-lg">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            {isStudent && (profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl) && (
              <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-gray-100">
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <LinkedinIcon className="w-4 h-4 text-blue-600" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-black dark:hover:text-white transition-colors"
                  >
                    <GithubIcon className="w-4 h-4 text-black dark:text-[#F5F5F7]" />
                    <span>GitHub</span>
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-primary transition-colors"
                  >
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span>Portfolio</span>
                  </a>
                )}
              </div>
            )}

            {isStudent && profile.githubUrl && getGithubUsername(profile.githubUrl) && (
              <div className="mt-6 pt-5 border-t border-gray-100 space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">GitHub Contributions</span>
                <div className="w-full overflow-x-auto bg-gray-50/50 border border-gray-100 rounded-2xl p-4">
                  <div className="min-w-[670px] flex justify-center items-center py-1">
                    <img
                      src={`https://ghchart.rshah.org/1a1a2e/${getGithubUsername(profile.githubUrl)}`}
                      alt="GitHub contributions"
                      className="w-full h-auto dark:invert dark:hue-rotate-180"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="rounded-xl shrink-0 cursor-pointer"
            onClick={() => {
              setEditing(!editing);
              setEditData({
                name: profile.name || "",
                bio: profile.bio || "",
                phone: profile.phone || "",
                department: profile.department || "",
                designation: profile.designation || "",
                linkedinUrl: profile.linkedinUrl || "",
                githubUrl: profile.githubUrl || "",
                portfolioUrl: profile.portfolioUrl || "",
              });
            }}
          >
            <Edit3 className="w-3 h-3 mr-1" />
            Edit
          </Button>
        </div>

        {/* Static QR Code */}
        {isStudent && showQR && (
          <ProfileQR onOpenModal={(url) => { setModalQrUrl(url); setIsQRModalOpen(true); }} />
        )}
      </div>

      {/* Earned Badges */}
      {isStudent && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <BadgeShowcase maxDisplay={10} showViewAll />
        </div>
      )}

      {/* Edit form */}
      {editing && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-[#1a1a2e]">Edit Profile</h3>

          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={editData.name ?? profile.name ?? ""}
              onChange={(e) =>
                setEditData((p) => ({ ...p, name: e.target.value }))
              }
              className="rounded-xl"
              placeholder="Your Name"
              required
            />
          </div>

          {isStudent && (
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={editData.bio ?? ""}
                onChange={(e) =>
                  setEditData((p) => ({ ...p, bio: e.target.value }))
                }
                className="rounded-xl resize-none"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(isStudent || isCoordinator || isFaculty) && (
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={editData.phone ?? ""}
                  onChange={(e) =>
                    setEditData((p) => ({ ...p, phone: e.target.value }))
                  }
                  className="rounded-xl"
                  placeholder="+91 9876543210"
                />
              </div>
            )}

            {(isCoordinator || isFaculty) && (
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={editData.department ?? ""}
                  onChange={(e) =>
                    setEditData((p) => ({ ...p, department: e.target.value }))
                  }
                  className="rounded-xl"
                  placeholder="e.g. CSE"
                />
              </div>
            )}

            {isFaculty && (
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input
                  value={editData.designation ?? ""}
                  onChange={(e) =>
                    setEditData((p) => ({ ...p, designation: e.target.value }))
                  }
                  className="rounded-xl"
                  placeholder="e.g. Assistant Professor"
                />
              </div>
            )}

            {isStudent && (
              <>
                <div className="space-y-2">
                  <Label>LinkedIn URL</Label>
                  <Input
                    value={editData.linkedinUrl ?? ""}
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
                    value={editData.githubUrl ?? ""}
                    onChange={(e) =>
                      setEditData((p) => ({ ...p, githubUrl: e.target.value }))
                    }
                    className="rounded-xl"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Portfolio URL</Label>
                  <Input
                    value={editData.portfolioUrl ?? ""}
                    onChange={(e) =>
                      setEditData((p) => ({ ...p, portfolioUrl: e.target.value }))
                    }
                    className="rounded-xl"
                    placeholder="https://..."
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-[#1a1a2e] hover:bg-[#2a2a4e] cursor-pointer"
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
              className="rounded-xl cursor-pointer"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      {/* QR Code Large Popup */}
      <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
        <DialogContent className="sm:max-w-sm bg-white border border-gray-100 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center text-center">
          <DialogTitle className="font-mono text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Official IEDC QR Code</DialogTitle>
          <DialogDescription className="sr-only">Scanning this QR code registers attendance at IEDC events.</DialogDescription>
          {modalQrUrl && (
            <img
              src={modalQrUrl}
              alt="Official QR Code"
              className="w-72 h-72 md:w-80 md:h-80 rounded-2xl border border-gray-100 shadow-sm"
            />
          )}
          <p className="text-xs text-gray-400 mt-4 leading-relaxed max-w-[280px]">
            Scan this QR code at any IEDC event to log your attendance.
            This code refreshes automatically every 30 seconds.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}