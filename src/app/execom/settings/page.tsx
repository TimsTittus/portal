"use client";

import { Settings } from "lucide-react";

export default function ExecomSettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
          Settings
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Configure portal settings and point rules
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
        <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">
          Settings panel coming soon
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Point rules, badge configuration, and portal settings
        </p>
      </div>
    </div>
  );
}
