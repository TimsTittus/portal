"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PosterUploadProps {
  value: string;
  onChange: (base64Url: string) => void;
  onRemove: () => void;
}

export function PosterUpload({ value, onChange, onRemove }: PosterUploadProps) {
  const [compressing, setCompressing] = useState(false);

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.7);
          onChange(compressed);
        }
        setCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        id="poster"
        type="file"
        accept="image/*"
        onChange={handlePosterChange}
        className="hidden"
      />
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl cursor-pointer bg-white"
          onClick={() => document.getElementById("poster")?.click()}
          disabled={compressing}
        >
          {compressing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          Choose Image
        </Button>
        {value && (
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 cursor-pointer bg-white"
            onClick={onRemove}
          >
            Remove
          </Button>
        )}
      </div>
      {value && (
        <div className="relative mt-2 border border-gray-100 rounded-xl overflow-hidden w-full max-w-sm aspect-video bg-gray-50 flex items-center justify-center">
          <img
            src={value}
            alt="Poster Preview"
            className="w-full h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
