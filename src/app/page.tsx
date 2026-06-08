import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Trophy,
  QrCode,
  Award,
  Users,
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "Event Management",
    description:
      "Browse, register, and track events — workshops, hackathons, seminars, and more.",
  },
  {
    icon: <QrCode className="w-6 h-6" />,
    title: "QR Attendance",
    description:
      "Secure QR-based attendance with HMAC verification. Just scan and go.",
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: "Leaderboards",
    description:
      "Earn points for participation, climb the rankings, and unlock badges.",
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Digital Certificates",
    description:
      "Auto-generated PDF certificates for every event you attend.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Team Formation",
    description:
      "Find teammates for hackathons and projects. Match skills and build together.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Analytics Dashboard",
    description:
      "Real-time insights for coordinators and execom. Track engagement and growth.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1a1a2e] flex items-center justify-center">
            <span className="text-white font-bold text-lg">I.</span>
          </div>
          <span className="text-lg font-bold text-[#1a1a2e] hidden md:block">
            IEDC Portal
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button
              variant="ghost"
              className="rounded-xl text-sm font-medium text-gray-600 hover:text-[#1a1a2e]"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="rounded-xl bg-[#1a1a2e] hover:bg-[#2a2a4e] text-sm font-medium">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 py-16 md:py-24 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-gray-50 text-gray-600 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-gray-100">
          <Zap className="w-4 h-4 text-yellow-500" />
          Built for 3,000+ students
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-[#1a1a2e] leading-tight tracking-tight">
          Your Innovation Hub,
          <br />
          <span className="text-gray-400">All in One Place</span>
        </h1>

        <p className="text-gray-500 text-lg md:text-xl mt-6 max-w-2xl mx-auto leading-relaxed">
          The IEDC Student Engagement Portal — manage events, track participation,
          earn recognition, and build your innovation portfolio.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link href="/auth/register">
            <Button
              size="lg"
              className="rounded-xl bg-[#1a1a2e] hover:bg-[#2a2a4e] h-12 px-8 text-base font-medium w-full sm:w-auto"
            >
              Join IEDC
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl h-12 px-8 text-base font-medium border-gray-200 w-full sm:w-auto"
            >
              Sign In
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            Secure QR Auth
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4" />
            Real-time Tracking
          </span>
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            Auto Certificates
          </span>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-16 bg-gray-50/50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a2e] text-center mb-12">
            Everything You Need
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-[#1a1a2e] group-hover:bg-[#1a1a2e] group-hover:text-white transition-all duration-300 mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-[#1a1a2e] text-base">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1a1a2e] flex items-center justify-center">
              <span className="text-white font-bold text-sm">I.</span>
            </div>
            <span className="text-sm font-semibold text-[#1a1a2e]">
              IEDC Portal
            </span>
          </div>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Innovation & Entrepreneurship Development Cell.
            All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
