"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Plus,
  Edit3,
  Trash2,
  X,
  Save,
  Loader2,
  Shield,
  Users,
  Trophy,
  Wrench,
  Zap,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import type { BadgeCriteria } from "@/lib/points";

// TYPES

interface BadgeData {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  criteria: BadgeCriteria;
  isActive?: boolean;
  earnedCount?: number;
}

type CriteriaType = BadgeCriteria["type"];

const CRITERIA_TYPE_OPTIONS: Array<{
  value: CriteriaType;
  label: string;
  icon: typeof Trophy;
  valueLabel: string;
}> = [
    { value: "points", label: "Points Threshold", icon: Trophy, valueLabel: "Min Points" },
    { value: "event_count", label: "Events Attended", icon: Sparkles, valueLabel: "Min Events" },
    { value: "project_count", label: "Approved Projects", icon: Wrench, valueLabel: "Min Projects" },
    { value: "volunteer_count", label: "Times Volunteered", icon: Users, valueLabel: "Min Volunteered" },
    { value: "streak", label: "Event Streak", icon: Zap, valueLabel: "Min Streak" },
  ];

const EMOJI_PRESETS = ["🌱", "⭐", "💡", "🔥", "👑", "👣", "🧭", "🎯", "🏆", "🛠️", "🏗️", "🚀", "🤝", "🏛️", "💎", "📈", "⚡", "🏅", "🎖️", "🥇"];

// BADGE FORM

function BadgeForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: BadgeData;
  onSave: (data: {
    name: string;
    description: string;
    icon: string;
    criteria: BadgeCriteria;
  }) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [icon, setIcon] = useState(initial?.icon || "🏅");
  const [criteriaType, setCriteriaType] = useState<CriteriaType>(
    initial?.criteria?.type || "points"
  );
  const [criteriaValue, setCriteriaValue] = useState<number>(() => {
    if (!initial?.criteria) return 100;
    if (initial.criteria.type === "points") return initial.criteria.threshold;
    return initial.criteria.min;
  });

  function buildCriteria(): BadgeCriteria {
    if (criteriaType === "points") {
      return { type: "points", threshold: criteriaValue };
    }
    return { type: criteriaType, min: criteriaValue } as BadgeCriteria;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return;
    onSave({ name: name.trim(), description: description.trim(), icon, criteria: buildCriteria() });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name + Icon */}
      <div className="flex gap-3">
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Badge Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rising Star"
            className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 focus:border-[#1A1A2E] focus:ring-1 focus:ring-[#1A1A2E] outline-none transition-all bg-white"
            required
            minLength={2}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Icon
          </label>
          <div className="relative">
            <div className="w-[52px] h-[42px] rounded-xl border border-gray-200 flex items-center justify-center text-xl bg-white cursor-default">
              {icon}
            </div>
          </div>
        </div>
      </div>

      {/* Emoji Picker */}
      <div className="flex flex-wrap gap-1.5">
        {EMOJI_PRESETS.map((emoji) => (
          <button
            type="button"
            key={emoji}
            onClick={() => setIcon(emoji)}
            className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all cursor-pointer ${icon === emoji
              ? "bg-[#1A1A2E] scale-110 shadow-lg"
              : "bg-gray-50 hover:bg-gray-100"
              }`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A short description of what this badge represents..."
          rows={2}
          className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#1A1A2E] focus:ring-1 focus:ring-[#1A1A2E] outline-none transition-all bg-white resize-none"
        />
      </div>

      {/* Criteria Type */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Criteria Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CRITERIA_TYPE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => setCriteriaType(opt.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${criteriaType === opt.value
                  ? "bg-[#1A1A2E] text-white shadow-lg shadow-black/10"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Criteria Value */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {CRITERIA_TYPE_OPTIONS.find((o) => o.value === criteriaType)?.valueLabel || "Value"}
        </label>
        <input
          type="number"
          min={1}
          value={criteriaValue}
          onChange={(e) => setCriteriaValue(parseInt(e.target.value) || 1)}
          className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 focus:border-[#1A1A2E] focus:ring-1 focus:ring-[#1A1A2E] outline-none transition-all bg-white"
          required
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || name.trim().length < 2}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A2E] text-white rounded-xl text-xs font-bold hover:bg-[#2a2a4e] transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {initial ? "Update Badge" : "Create Badge"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-gray-500 bg-gray-50 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function getCriteriaLabel(criteria: BadgeCriteria): string {
  switch (criteria.type) {
    case "points":
      return `${criteria.threshold}+ points`;
    case "event_count":
      return `${criteria.min}+ events`;
    case "project_count":
      return `${criteria.min}+ projects`;
    case "volunteer_count":
      return `${criteria.min}+ volunteered`;
    case "streak":
      return `${criteria.min}+ streak`;
    default:
      return "Custom";
  }
}

// MAIN PAGE
export default function ExecomSettingsPage() {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBadge, setEditingBadge] = useState<BadgeData | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchBadges();
  }, []);

  async function fetchBadges() {
    try {
      const res = await fetch("/api/badges");
      if (res.ok) {
        const data = await res.json();
        setBadges(data.badges || []);
      }
    } catch (e) {
      console.error("Failed to load badges", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(data: {
    name: string;
    description: string;
    icon: string;
    criteria: BadgeCriteria;
  }) {
    setSaving(true);
    try {
      const res = await fetch("/api/badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setShowForm(false);
        await fetchBadges();
      }
    } catch (e) {
      console.error("Create failed", e);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(data: {
    name: string;
    description: string;
    icon: string;
    criteria: BadgeCriteria;
  }) {
    if (!editingBadge) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/badges/${editingBadge.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setEditingBadge(null);
        await fetchBadges();
      }
    } catch (e) {
      console.error("Update failed", e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(id: string) {
    try {
      const res = await fetch(`/api/badges/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchBadges();
      }
    } catch (e) {
      console.error("Deactivate failed", e);
    }
  }

  async function handleSeedBadges() {
    setSeeding(true);
    try {
      const res = await fetch("/api/badges/seed", { method: "POST" });
      if (res.ok) {
        await fetchBadges();
      }
    } catch (e) {
      console.error("Seed failed", e);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
            Settings
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage badges, point rules, and portal configuration
          </p>
        </div>
      </div>

      {/* Badge Management Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#A78BFA]/10 text-[#A78BFA] flex items-center justify-center">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1A2E]">Badge Management</h2>
              <p className="text-xs text-gray-400">
                {badges.length} active badge{badges.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {badges.length === 0 && (
              <button
                id="seed-badges-btn"
                onClick={handleSeedBadges}
                disabled={seeding}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#FAF6EE] text-[#1A1A2E] rounded-xl text-xs font-bold hover:bg-[#EAE3D2]/60 transition-all cursor-pointer disabled:opacity-50"
              >
                {seeding ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Seed Defaults
              </button>
            )}
            <button
              id="create-badge-btn"
              onClick={() => {
                setShowForm(true);
                setEditingBadge(null);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1A1A2E] text-white rounded-xl text-xs font-bold hover:bg-[#2a2a4e] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New Badge
            </button>
          </div>
        </div>

        {/* Create/Edit Form */}
        {(showForm || editingBadge) && (
          <div className="px-6 py-5 border-b border-gray-100 bg-[#FAF6EE]/30">
            <BadgeForm
              initial={editingBadge || undefined}
              onSave={editingBadge ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingBadge(null);
              }}
              saving={saving}
            />
          </div>
        )}

        {/* Badge List */}
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : badges.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No badges created yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Click &quot;Seed Defaults&quot; to add 17 starter badges, or create your own.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[#FAF6EE]/30 transition-colors group"
              >
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-[#FAF6EE] flex items-center justify-center text-xl shrink-0">
                  {badge.icon || "🏅"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#1A1A2E] truncate">
                      {badge.name}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#6EA2F8]/10 text-[#6EA2F8] shrink-0">
                      {getCriteriaLabel(badge.criteria)}
                    </span>
                  </div>
                  {badge.description && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {badge.description}
                    </p>
                  )}
                </div>

                {/* Earned count */}
                {badge.earnedCount !== undefined && (
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-sm font-black text-[#1A1A2E]">
                      {badge.earnedCount}
                    </p>
                    <p className="text-[10px] text-gray-400">earned</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingBadge(badge);
                      setShowForm(false);
                    }}
                    className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-[#6EA2F8]/10 hover:text-[#6EA2F8] transition-all cursor-pointer"
                    title="Edit badge"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeactivate(badge.id)}
                    className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                    title="Deactivate badge"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Point Rules Placeholder */}
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
        <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">
          Point Rules Configuration
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Point rules configuration coming soon
        </p>
      </div>
    </div>
  );
}