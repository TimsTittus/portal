import { db } from "@/db";
import { badges } from "@/db/schema";
import type { BadgeCriteria } from "@/lib/points";

/**
 * Default badge definitions for the IEDC Portal.
 * Seeded on first run; safe to re-run (uses ON CONFLICT DO NOTHING).
 */
const SEED_BADGES: Array<{
  name: string;
  description: string;
  icon: string;
  criteria: BadgeCriteria;
}> = [
    // Points-based
    { name: "Starter", icon: "🌱", description: "Took the first step on your innovation journey", criteria: { type: "points", threshold: 25 } },
    { name: "Rising Star", icon: "⭐", description: "Crossed the 100-point milestone", criteria: { type: "points", threshold: 100 } },
    { name: "Innovator", icon: "💡", description: "A force of innovation with 250+ points", criteria: { type: "points", threshold: 250 } },
    { name: "Trailblazer", icon: "🔥", description: "Blazing through with 500+ points", criteria: { type: "points", threshold: 500 } },
    { name: "Legend", icon: "👑", description: "Achieved legendary status — 1000+ points", criteria: { type: "points", threshold: 1000 } },

    // Event attendance
    { name: "First Steps", icon: "👣", description: "Attended your very first IEDC event", criteria: { type: "event_count", min: 1 } },
    { name: "Explorer", icon: "🧭", description: "Explored 5 different events", criteria: { type: "event_count", min: 5 } },
    { name: "Event Enthusiast", icon: "🎯", description: "A regular at IEDC events — 10 attended", criteria: { type: "event_count", min: 10 } },
    { name: "Event Veteran", icon: "🏆", description: "A true veteran of 25+ events", criteria: { type: "event_count", min: 25 } },

    // Projects
    { name: "Builder", icon: "🛠️", description: "Got your first project approved", criteria: { type: "project_count", min: 1 } },
    { name: "Architect", icon: "🏗️", description: "Built and shipped 3 approved projects", criteria: { type: "project_count", min: 3 } },
    { name: "Prolific Creator", icon: "🚀", description: "A prolific builder with 5+ projects", criteria: { type: "project_count", min: 5 } },

    // Volunteering
    { name: "Helping Hand", icon: "🤝", description: "Volunteered at your first event", criteria: { type: "volunteer_count", min: 1 } },
    { name: "Community Pillar", icon: "🏛️", description: "The backbone of the community — 3+ volunteered", criteria: { type: "volunteer_count", min: 3 } },
    { name: "IEDC Champion", icon: "💎", description: "A true champion — volunteered at 5+ events", criteria: { type: "volunteer_count", min: 5 } },

    // Streak
    { name: "Consistent", icon: "📈", description: "Attended 3 events in a row", criteria: { type: "streak", min: 3 } },
    { name: "Unstoppable", icon: "⚡", description: "5-event attendance streak — unstoppable!", criteria: { type: "streak", min: 5 } },
  ];

export async function seedBadges(): Promise<number> {
  let inserted = 0;
  for (const badge of SEED_BADGES) {
    try {
      await db
        .insert(badges)
        .values(badge)
        .onConflictDoNothing();
      inserted++;
    } catch {
      // Badge with this name already exists
    }
  }
  return inserted;
}