import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getGithubUsername(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?#]+)/i);
  return match ? match[1] : null;
}