"use client";

import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";

interface StudentRegistrationActionProps {
  registered: boolean;
  registering: boolean;
  message: string;
  onRegister: () => Promise<void>;
}

export function StudentRegistrationAction({
  registered,
  registering,
  message,
  onRegister,
}: StudentRegistrationActionProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
      <h3 className="font-semibold text-[#1a1a2e] mb-3">Registration</h3>
      {message && (
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-sm ${
            registered
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-red-50 text-red-600 border border-red-100"
          }`}
        >
          {message}
        </div>
      )}

      {registered ? (
        <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-700 font-semibold flex items-center gap-2 w-fit">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>Registered ✓</span>
        </div>
      ) : (
        <Button
          onClick={onRegister}
          disabled={registering}
          className="w-full md:w-auto h-11 px-8 rounded-xl bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white font-medium cursor-pointer"
        >
          {registering ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Register for Event
        </Button>
      )}
    </div>
  );
}
