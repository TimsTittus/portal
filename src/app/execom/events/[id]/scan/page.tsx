"use client";

import { useState, useRef, useEffect, useCallback, use } from "react";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2, XCircle, ArrowLeft, Loader2 } from "lucide-react";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import Link from "next/link";

interface ScanResult {
  success: boolean;
  message: string;
  studentName?: string;
  iecdId?: string;
}

export default function ExecomScanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);

  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const prevDeviceIdRef = useRef("");

  const processQRCode = useCallback(async (qrData: string) => {
    if (processing) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, qrData }),
      });
      const data = await res.json();
      
      setLastResult({
        success: data.success,
        message: data.message,
        studentName: data.studentName,
        iecdId: data.iecdId,
      });

      if (data.success) {
        setScanCount((prev) => prev + 1);
        // Play success sound
        const audio = new Audio("https://cdn.freesound.org/previews/404/404743_1427504-lq.mp3");
        audio.play().catch(() => {});
      } else {
        // Play error sound
        const audio = new Audio("https://cdn.freesound.org/previews/415/415510_5121236-lq.mp3");
        audio.play().catch(() => {});
      }
    } catch {
      setLastResult({
        success: false,
        message: "Failed to connect to server",
      });
    }
    
    // Cool down to prevent double scans
    setTimeout(() => {
      setProcessing(false);
    }, 2000);
  }, [processing, eventId]);

  const startScanning = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      const codeReader = new BrowserQRCodeReader();
      
      // Request permission and list devices
      const videoDevices = await BrowserQRCodeReader.listVideoInputDevices();
      setDevices(videoDevices);

      let deviceId = selectedDeviceId;
      if (!deviceId && videoDevices.length > 0) {
        const backCam = videoDevices.find((d) => 
          d.label.toLowerCase().includes("back") || 
          d.label.toLowerCase().includes("rear") || 
          d.label.toLowerCase().includes("environment")
        );
        deviceId = backCam ? backCam.deviceId : videoDevices[0].deviceId;
        setSelectedDeviceId(deviceId);
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? {
              deviceId: { exact: deviceId },
              advanced: [{ focusMode: "continuous" } as unknown as MediaTrackConstraintSet],
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }
          : {
              facingMode: "environment",
              advanced: [{ focusMode: "continuous" } as unknown as MediaTrackConstraintSet],
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
      };

      const controls = await codeReader.decodeFromConstraints(
        constraints,
        videoRef.current,
        (result) => {
          if (result && !processing) {
            processQRCode(result.getText());
          }
        }
      );
      controlsRef.current = controls;
      setScanning(true);
      setLastResult(null);
    } catch {
      alert("Unable to access camera. Please grant camera permissions or select a different camera source.");
    }
  }, [processing, selectedDeviceId, processQRCode]);

  const stopScanning = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setScanning(false);
  }, []);

  // Hot-swap camera source when dropdown changes
  useEffect(() => {
    if (prevDeviceIdRef.current !== selectedDeviceId && controlsRef.current) {
      prevDeviceIdRef.current = selectedDeviceId;
      stopScanning();
      const timer = setTimeout(() => {
        startScanning();
      }, 500);
      return () => clearTimeout(timer);
    }
    prevDeviceIdRef.current = selectedDeviceId;
  }, [selectedDeviceId, startScanning, stopScanning]);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-12">
      <Link
        href={`/execom/events/${eventId}`}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a1a2e] transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to event details
      </Link>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">QR Scanner</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Scan student QR codes to mark attendance
        </p>
      </div>

      {/* Camera Selection Dropdown */}
      {devices.length > 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
            Select Camera Source
          </label>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="w-full text-sm font-medium border border-gray-200 rounded-xl px-3 py-2 bg-white text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]"
          >
            {devices.map((device, i) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${i + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div 
          className="aspect-square relative bg-gray-900 cursor-pointer" 
          onClick={async () => {
            if (videoRef.current && videoRef.current.srcObject) {
              const stream = videoRef.current.srcObject as MediaStream;
              const track = stream.getVideoTracks()[0];
              try {
                // Try to trigger autofocus on tap for supported devices
                await track.applyConstraints({
                  advanced: [{ focusMode: "single-shot" } as unknown as MediaTrackConstraintSet]
                });
                setTimeout(() => {
                  track.applyConstraints({
                    advanced: [{ focusMode: "continuous" } as unknown as MediaTrackConstraintSet]
                  }).catch(() => {});
                }, 1000);
              } catch (e) {
                console.log("Manual focus not supported", e);
              }
            }
          }}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          {!scanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 text-white p-6 text-center">
              <Camera className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-sm text-gray-400 mb-4">
                Point your camera at a student&apos;s QR code. Ensure good lighting.
              </p>
              <Button
                onClick={startScanning}
                className="rounded-xl bg-white text-[#1a1a2e] hover:bg-gray-100"
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Scanning
              </Button>
            </div>
          )}

          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`w-64 h-64 border-2 rounded-2xl relative transition-colors ${processing ? 'border-green-500/50' : 'border-white/50'}`}>
                <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-xl" />
                <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-xl" />
                <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-xl" />
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-xl" />
              </div>
            </div>
          )}

          {processing && (
            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center">
              <Loader2 className="w-3 h-3 animate-spin mr-2" /> Processing...
            </div>
          )}
        </div>

        {scanning && (
          <div className="p-4 flex justify-between items-center bg-gray-50 border-t border-gray-100">
            <span className="text-sm text-gray-600">
              Scanned Session: <span className="font-bold text-[#1a1a2e]">{scanCount}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl bg-white"
              onClick={stopScanning}
            >
              Stop Camera
            </Button>
          </div>
        )}
      </div>

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
          <div className="flex-1">
            <p
              className={`font-medium text-sm ${
                lastResult.success ? "text-green-800" : "text-red-800"
              }`}
            >
              {lastResult.message}
            </p>
            {lastResult.studentName && (
              <p className="text-xs text-green-600 mt-1 font-medium">
                {lastResult.studentName} {lastResult.iecdId ? `• ${lastResult.iecdId}` : ''}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
