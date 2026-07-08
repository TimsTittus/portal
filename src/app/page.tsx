import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Award } from "lucide-react";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { EventCard } from "@/components/events/event-card";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const activeEvents = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.isDeleted, false),
        inArray(events.status, ["published", "ongoing"])
      )
    )
    .orderBy(desc(events.startDatetime))
    .limit(6);
  return (
    <div className="min-h-screen bg-[#FBF5E8] text-[#1A1A2E] flex flex-col selection:bg-[#D8615C] selection:text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-5 bg-[#FBF5E8] border-b border-[#EAE3D2]/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1A1A2E] flex items-center justify-center shadow-lg shadow-black/10">
            <span className="text-[#FBF5E8] font-serif font-bold text-xl">I.</span>
          </div>
          <span className="text-lg font-serif font-bold text-[#1A1A2E] tracking-tight">
            IEDC Portal
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login">
            <Button
              variant="ghost"
              className="rounded-full text-sm font-medium text-gray-700 hover:text-[#1A1A2E] hover:bg-[#EAE3D2]/50 px-5"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="rounded-full bg-[#1A1A2E] hover:bg-[#2A2A4E] text-[#FBF5E8] px-6 text-sm font-medium shadow-md hover:shadow-lg transition-all">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 md:px-16 py-12 md:py-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-grow">
        {/* Left Content */}
        <div className="lg:col-span-7 space-y-8 text-left">
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-serif font-black text-[#1A1A2E] leading-[1.08] tracking-tight">
            Grow Your <br className="hidden md:inline" />
            Innovation <br />
            <span className="italic text-[#D8615C] font-semibold">Effortlessly</span>
          </h1>

          <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-xl">
            Create, build, and showcase your ideas with our all-in-one engagement platform.
            Track workshops, register for events, verify attendance with secure QR codes,
            and earn points for your portfolio.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-full bg-[#1A1A2E] hover:bg-[#2A2A4E] text-[#FBF5E8] h-14 px-8 text-base font-semibold transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 duration-200"
              >
                Join the Network Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Feature highlights */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#1A1A2E]/60 pt-4 border-t border-[#EAE3D2]/50">
            <span className="flex items-center gap-2 font-medium">
              <Shield className="w-4.5 h-4.5 text-[#6EA2F8]" />
              Secure QR Attendance
            </span>
            <span className="flex items-center gap-2 font-medium">
              <Zap className="w-4.5 h-4.5 text-[#84C974]" />
              Real-time Portfolio Points
            </span>
            <span className="flex items-center gap-2 font-medium">
              <Award className="w-4.5 h-4.5 text-[#D8615C]" />
              Automated Certificates
            </span>
          </div>
        </div>

        {/* Right Content - Hero Illustration */}
        <div className="lg:col-span-5 flex justify-center relative">
          {/* Pastel decorative circle background */}
          <div className="absolute inset-0 bg-[#EAE3D2]/35 rounded-full filter blur-3xl -z-10 scale-90" />
          <div className="relative w-full max-w-[420px] aspect-square rounded-[2.5rem] border-4 border-[#1A1A2E] bg-[#EAE3D2]/20 overflow-hidden shadow-2xl transition-transform hover:rotate-1 duration-200">
            <Image
              src="/illustrations/hero-innovator.png"
              alt="IEDC Innovation"
              fill
              className="object-cover scale-[1.02]"
              priority
            />
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="px-6 md:px-16 py-16 max-w-7xl mx-auto w-full space-y-10 border-t border-[#EAE3D2]/30">
        <div className="space-y-3 text-left">
          <h2 className="text-3xl md:text-5xl font-serif font-black text-[#1A1A2E]">
            Featured Events
          </h2>
          <p className="text-gray-500 text-sm md:text-base font-medium">
            Explore workshops, hackathons, and bootcamps happening in the hub.
          </p>
        </div>

        {activeEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                eventType={event.eventType}
                venue={event.venue}
                startDatetime={event.startDatetime.toISOString()}
                endDatetime={event.endDatetime.toISOString()}
                status={event.status}
                participationPoints={event.participationPoints}
                posterUrl={event.posterUrl}
                linkPrefix="/student/events"
                className="bg-white rounded-[2rem] border border-[#EAE3D2]/70 p-6 shadow-sm hover:shadow-md hover:border-[#EAE3D2] transition-all cursor-pointer flex flex-col justify-between"
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#FAF6EE] rounded-[2.5rem] border border-[#EAE3D2]/60 p-12 text-center w-full">
            <p className="text-[#1A1A2E] font-serif font-bold text-lg">No active events found</p>
            <p className="text-gray-400 text-xs mt-1">Check back later for exciting upcoming events!</p>
          </div>
        )}
      </section>

      {/* Cards Section */}
      <section className="bg-white px-6 md:px-16 py-20 border-t border-[#EAE3D2]/30">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-serif font-black text-[#1A1A2E]">
              Everything You Need in One Hub
            </h2>
            <p className="text-gray-500 text-base md:text-lg">
              Explore custom features engineered to elevate your engineering and entrepreneurship journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 - Blue Theme */}
            <div className="bg-[#6EA2F8] rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between overflow-hidden shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group h-[520px]">
              <div className="space-y-4">
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-[#1A1A2E]">
                  Event <br />
                  Ecosystem
                </h3>
                <p className="text-[#1A1A2E]/80 text-sm leading-relaxed max-w-[240px]">
                  Browse and register for workshops, hackathons, and webinars. Get instant access.
                </p>
              </div>
              <div className="relative w-full h-[240px] mt-6 self-center">
                <Image
                  src="/illustrations/student-laptop-blue.png"
                  alt="Events illustration"
                  fill
                  className="object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Card 2 - Green Theme */}
            <div className="bg-[#84C974] rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between overflow-hidden shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group h-[520px]">
              <div className="space-y-4">
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-[#1A1A2E]">
                  Project <br />
                  Incubator
                </h3>
                <p className="text-[#1A1A2E]/80 text-sm leading-relaxed max-w-[240px]">
                  Submit projects, form dynamic hackathon teams, and review outcomes.
                </p>
              </div>
              <div className="relative w-full h-[240px] mt-6 self-center">
                <Image
                  src="/illustrations/student-laptop-green.png"
                  alt="Projects illustration"
                  fill
                  className="object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Card 3 - Coral Red Theme */}
            <div className="bg-[#D8615C] rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between overflow-hidden shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group h-[520px]">
              <div className="space-y-4 text-white">
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-[#1A1A2E]">
                  Leaderboard <br />
                  & Badges
                </h3>
                <p className="text-[#1A1A2E]/90 text-sm leading-relaxed max-w-[240px]">
                  Climb ranks, check your engagement levels, and earn certifications.
                </p>
              </div>
              <div className="relative w-full h-[240px] mt-6 self-center">
                <Image
                  src="/illustrations/student-jumping-red.png"
                  alt="Gamification illustration"
                  fill
                  className="object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-16 py-10 bg-[#FAF6EE] border-t border-[#EAE3D2]/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1A1A2E] flex items-center justify-center">
              <span className="text-[#FBF5E8] font-serif font-bold text-sm">I.</span>
            </div>
            <span className="text-sm font-serif font-bold text-[#1A1A2E]">
              IEDC Student Engagement Portal
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            © {new Date().getFullYear()} Innovation & Entrepreneurship Development Cell. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
