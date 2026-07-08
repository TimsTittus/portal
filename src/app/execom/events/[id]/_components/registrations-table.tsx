"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { Registration } from "../types";

interface RegistrationsTableProps {
  registrations: Registration[];
  onDownloadPDF: () => Promise<void>;
}

export function RegistrationsTable({ registrations, onDownloadPDF }: RegistrationsTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#1a1a2e]">
          Registered Students ({registrations.length})
        </h3>
        {registrations.length > 0 && (
          <Button
            onClick={onDownloadPDF}
            variant="outline"
            size="icon"
            title="Download PDF Report"
            className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer w-8 h-8 flex items-center justify-center bg-white"
          >
            <FileDown className="w-4 h-4" />
          </Button>
        )}
      </div>
      {registrations.length === 0 ? (
        <p className="text-gray-500 text-sm">No students registered yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 rounded-tl-xl rounded-bl-xl">Name</th>
                <th className="px-4 py-3">IEDC ID</th>
                <th className="px-4 py-3">Dept & Year</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 rounded-tr-xl rounded-br-xl">Attended</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{reg.student.name}</td>
                  <td className="px-4 py-3">{reg.student.iecdId}</td>
                  <td className="px-4 py-3">
                    {reg.student.department} ({reg.student.batch})
                  </td>
                  <td className="px-4 py-3 capitalize">{reg.role}</td>
                  <td className="px-4 py-3">
                    {reg.attended ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-none">
                        Present
                      </Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
