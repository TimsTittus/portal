"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function SubmitProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    githubUrl: "",
    demoUrl: "",
    tags: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const body = {
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        teamMembers: [],
      };

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push("/student/projects");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit project");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a1a2e] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div>
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Submit Project</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Share your project with the IEDC community
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5"
      >
        <div className="space-y-2">
          <Label>Project Title</Label>
          <Input
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="rounded-xl"
            placeholder="e.g. Smart Campus App"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="rounded-xl resize-none"
            rows={4}
            placeholder="What does your project do?"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>GitHub URL</Label>
            <Input
              value={form.githubUrl}
              onChange={(e) => handleChange("githubUrl", e.target.value)}
              className="rounded-xl"
              placeholder="https://github.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label>Demo URL</Label>
            <Input
              value={form.demoUrl}
              onChange={(e) => handleChange("demoUrl", e.target.value)}
              className="rounded-xl"
              placeholder="https://demo.example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <Input
            value={form.tags}
            onChange={(e) => handleChange("tags", e.target.value)}
            className="rounded-xl"
            placeholder="React, IoT, AI (comma-separated)"
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
          className="w-full md:w-auto h-11 px-8 rounded-xl bg-[#1a1a2e] hover:bg-[#2a2a4e]"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Submit Project
        </Button>
      </form>
    </div>
  );
}
