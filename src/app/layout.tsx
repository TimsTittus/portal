import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IEDC Portal — Student Engagement & Event Management",
  description:
    "Innovation and Entrepreneurship Development Cell portal for student engagement, event management, QR attendance, leaderboards, and project showcases.",
  keywords: [
    "IEDC",
    "student portal",
    "events",
    "innovation",
    "entrepreneurship",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}