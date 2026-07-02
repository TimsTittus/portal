"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface ScanResult {
  success: boolean;
  message: string;
  studentName?: string;
  iecdId?: string;
}

export default function ScanPage() {
  const [selectedEvent, setSelectedEvent] = useState("");
  const [events, setEvents] = useState<Array<{ id: string; title: string }>>([]);
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      const res = await fetch("/api/events?status=all&limit=50");
      const data = await res.json();
      setEvents(
        (data.events || []).filter(
          (e: { status: string | null }) =>
            e.status === "published" || e.status === "ongoing"
        )
      );
    }
    fetchEvents();
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
    } catch (error) {
      console.error("Camera error:", error);
      alert("Unable to access camera. Please grant camera permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">QR Scanner</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Scan student QR codes to mark attendance
        </p>
      </div>

      {/* Event selector */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Select event to scan for" />
          </SelectTrigger>
          <SelectContent>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Camera view */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="aspect-square relative bg-gray-900">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          {!scanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 text-white">
              <Camera className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-sm text-gray-400 mb-4">
                {selectedEvent
                  ? "Ready to scan"
                  : "Select an event first"}
              </p>
              <Button
                onClick={startCamera}
                disabled={!selectedEvent}
                className="rounded-xl bg-white text-[#1a1a2e] hover:bg-gray-100"
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Scanning
              </Button>
            </div>
          )}

          {/* Scan overlay */}
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 border-2 border-white/50 rounded-2xl relative">
                <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-xl" />
                <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-xl" />
                <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-xl" />
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-xl" />
              </div>
            </div>
          )}
        </div>

        {scanning && (
          <div className="p-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Scanned: <span className="font-bold text-[#1a1a2e]">{scanCount}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={stopCamera}
            >
              Stop
            </Button>
          </div>
        )}
      </div>

      {/* Last result */}
      {lastResult && (
        <div
          className={`rounded-2xl border p-4 flex items-center gap-3 ${
            lastResult.success
              ? "bg-green-50 border-green-100"
              : "bg-red-50 border-red-100"
          }`}
        >
          {lastResult.success ? (
            <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
          ) : (
            <XCircle className="w-8 h-8 text-red-500 shrink-0" />
          )}
          <div>
            <p
              className={`font-medium text-sm ${
                lastResult.success ? "text-green-700" : "text-red-700"
              }`}
            >
              {lastResult.message}
            </p>
            {lastResult.studentName && (
              <p className="text-xs text-gray-500 mt-0.5">
                {lastResult.studentName} • {lastResult.iecdId}
              </p>
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-center text-gray-400">
        Note: Full QR scanning integration requires the @zxing/browser library.
        Camera feed is shown above — scan processing will be connected to the
        attendance API.
      </p>
    </div>
  );
}
