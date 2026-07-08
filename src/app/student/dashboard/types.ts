export interface PointsEntry {
  activityType: string;
  points: number;
  referenceType: string | null;
  awardedAt: string;
  note: string | null;
}

export interface DashboardData {
  profile: {
    name: string;
    iecdId: string;
    totalPoints: number;
    department: string;
  } | null;
  events: Array<{
    id: string;
    title: string;
    eventType: string;
    venue: string | null;
    startDatetime: string;
    endDatetime: string;
    status: string | null;
    participationPoints: number | null;
    posterUrl: string | null;
  }>;
}
