"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { EventDetail } from "../types";

interface StatusActionsProps {
  event: EventDetail;
  updating: boolean;
  message: string;
  onUpdateStatus: (newStatus: string) => Promise<void>;
}

export function StatusActions({ event, updating, message, onUpdateStatus }: StatusActionsProps) {
  const currentStatus = event.status || "draft";
  const actions: Array<{ label: string; value: string; className: string }> = [];

  if (currentStatus === "draft") {
    actions.push({
      label: "Publish Event",
      value: "published",
      className: "bg-blue-600 hover:bg-blue-700 text-white border-transparent",
    });
  } else if (currentStatus === "published") {
    actions.push({
      label: "Start Event (Ongoing)",
      value: "ongoing",
      className: "bg-green-600 hover:bg-green-700 text-white border-transparent",
    });
    actions.push({
      label: "Cancel Event",
      value: "cancelled",
      className: "bg-red-50 hover:bg-red-100 text-red-600 border-red-200",
    });
  } else if (currentStatus === "ongoing") {
    actions.push({
      label: "Mark as Completed",
      value: "completed",
      className: "bg-purple-600 hover:bg-purple-700 text-white border-transparent",
    });
  } else if (currentStatus === "cancelled") {
    actions.push({
      label: "Restart Event",
      value: "published",
      className: "bg-blue-600 hover:bg-blue-700 text-white border-transparent",
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
      <h3 className="font-semibold text-[#1a1a2e] mb-3">Manage Status</h3>
      {message && (
        <div className="mb-3 rounded-xl px-4 py-3 text-sm bg-blue-50 text-blue-700 border border-blue-100">
          {message}
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        {actions.length === 0 ? (
          <p className="text-sm text-gray-500">No further status updates available.</p>
        ) : (
          actions.map((action) => (
            <Button
              key={action.value}
              variant="outline"
              size="sm"
              className={`rounded-xl font-medium shadow-sm transition-all cursor-pointer ${action.className}`}
              disabled={updating}
              onClick={() => onUpdateStatus(action.value)}
            >
              {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {action.label}
            </Button>
          ))
        )}
      </div>
    </div>
  );
}
