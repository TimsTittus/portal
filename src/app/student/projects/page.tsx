"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderOpen, ExternalLink, GitBranch } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProjectData {
  id: string;
  title: string;
  description: string | null;
  githubUrl: string | null;
  demoUrl: string | null;
  tags: string[];
  status: string | null;
  submittedAt: string | null;
}

export default function StudentProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"browse" | "my">("browse");

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        const url = activeTab === "browse"
          ? "/api/projects?status=approved&limit=20"
          : "/api/projects?my=true";
        const res = await fetch(url);
        const data = await res.json();
        setProjects(data.projects || []);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [activeTab]);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-xs font-semibold px-2 py-0.5 border shrink-0">
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-xs font-semibold px-2 py-0.5 border shrink-0">
            Rejected
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 hover:text-amber-700 rounded-lg text-xs font-semibold px-2 py-0.5 border shrink-0">
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
            Projects
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Browse community projects and submit your own
          </p>
        </div>
        <Link href="/student/projects/submit">
          <Button className="rounded-xl bg-[#1a1a2e] hover:bg-[#2a2a4e] hidden md:flex">
            Submit Project
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100 pb-px">
        <button
          onClick={() => setActiveTab("browse")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer",
            activeTab === "browse"
              ? "border-[#1a1a2e] text-[#1a1a2e]"
              : "border-transparent text-gray-400 hover:text-gray-600"
          )}
        >
          Browse Projects
        </button>
        <button
          onClick={() => setActiveTab("my")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer",
            activeTab === "my"
              ? "border-[#1a1a2e] text-[#1a1a2e]"
              : "border-transparent text-gray-400 hover:text-gray-600"
          )}
        >
          My Submissions
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-semibold text-[#1a1a2e] text-base">
                  {project.title}
                </h3>
                {activeTab === "my" && getStatusBadge(project.status)}
              </div>
              {project.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {project.description}
                </p>
              )}

              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {project.tags.map((tag, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="text-xs rounded-lg"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 mt-auto pt-4">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#1a1a2e] transition-colors"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    GitHub
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#1a1a2e] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <FolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No projects yet</p>
          <p className="text-gray-400 text-sm mt-1">
            {activeTab === "browse" ? "Be the first to submit a project!" : "You haven't submitted any projects yet."}
          </p>
        </div>
      )}

      {/* Mobile FAB */}
      <Link href="/student/projects/submit" className="md:hidden fixed bottom-20 right-4 z-40">
        <Button className="rounded-full w-14 h-14 bg-[#1a1a2e] hover:bg-[#2a2a4e] shadow-xl">
          <span className="text-xl">+</span>
        </Button>
      </Link>
    </div>
  );
}