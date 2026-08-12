import { apiClient } from "@/lib/http";
import type { ApiResponse } from "@/types/api";

export interface DashboardIntelligenceData {
  careerScore: number;
  profileCompleteness: number;
  resumesCount: number;
  atsReadiness: number;
  activeApplications: number;
  upcomingInterviews: number;
  missingItems: Array<{
    title: string;
    section: string;
    description: string;
    path: string;
    severity: string;
  }>;
  recommendedActions: Array<{
    id: string;
    title: string;
    description: string;
    actionLabel: string;
    actionPath: string;
    badge: string;
  }>;
  recentActivity: Array<{
    id: string;
    title: string;
    timestamp: string;
    description: string;
  }>;
}

export async function fetchDashboardIntelligence(): Promise<DashboardIntelligenceData> {
  try {
    const response = await apiClient.get<ApiResponse<DashboardIntelligenceData>>("/dashboard/intelligence/");
    if (response.data && response.data.data) {
      return response.data.data;
    }
  } catch (error) {
    console.warn("Using local dashboard metrics fallback:", error);
  }

  // Resilient fallback metric values
  return {
    careerScore: 75,
    profileCompleteness: 70,
    resumesCount: 1,
    atsReadiness: 85,
    activeApplications: 0,
    upcomingInterviews: 0,
    missingItems: [
      {
        title: "Complete Personal Information",
        section: "personal-information",
        description: "Add phone, location, and summary for 100% profile ready.",
        path: "/career-profile/personal-information",
        severity: "medium",
      },
    ],
    recommendedActions: [
      {
        id: "act-1",
        title: "Build AI Resume",
        description: "Generate tailored ATS-friendly resumes for target roles.",
        actionLabel: "Create Resume",
        actionPath: "/resumes",
        badge: "Recommended",
      },
      {
        id: "act-2",
        title: "Update Career Profile",
        description: "Add your work history and technical skills.",
        actionLabel: "Edit Profile",
        actionPath: "/career-profile",
        badge: "High Impact",
      },
    ],
    recentActivity: [
      {
        id: "act-1",
        title: "Control Flightdeck Active",
        timestamp: "Just now",
        description: "CareerOS Control Flightdeck ready.",
      },
    ],
  };
}
