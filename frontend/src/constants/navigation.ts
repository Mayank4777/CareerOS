import {
  BrainCircuit,
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  Settings2,
  Sparkles,
  UserRound,
  ClipboardList,
  CalendarDays,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { APP_ROUTES } from "@/constants/routes";

export interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
  description?: string;
  children?: NavigationItem[];
}

export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    path: APP_ROUTES.dashboard,
    icon: LayoutDashboard,
    description: "Career overview and next actions",
  },
  {
    label: "Career Profile",
    path: APP_ROUTES.careerProfile,
    icon: UserRound,
    description: "Profile, skills, and experience",
    children: [
      {
        label: "Personal Information",
        path: APP_ROUTES.careerProfilePersonalInformation,
        icon: UserRound,
      },
      {
        label: "Education",
        path: APP_ROUTES.careerProfileEducation,
        icon: ClipboardList,
      },
      {
        label: "Experience",
        path: APP_ROUTES.careerProfileExperience,
        icon: BriefcaseBusiness,
      },
      {
        label: "Skills",
        path: APP_ROUTES.careerProfileSkills,
        icon: Sparkles,
      },
      {
        label: "Projects",
        path: APP_ROUTES.careerProfileProjects,
        icon: FileText,
      },
      {
        label: "Certifications",
        path: APP_ROUTES.careerProfileCertifications,
        icon: ClipboardList,
      },
      {
        label: "Career Goals",
        path: APP_ROUTES.careerProfileGoals,
        icon: BrainCircuit,
      },
    ],
  },
  {
    label: "Resume",
    path: APP_ROUTES.resume,
    icon: FileText,
    description: "Resume drafts, reviews, and versions",
    children: [
      {
        label: "Resume Library",
        path: APP_ROUTES.resumeLibrary,
        icon: FileText,
      },
      {
        label: "Resume Editor",
        path: APP_ROUTES.resumeEditor,
        icon: FileText,
      },
      {
        label: "Resume Review",
        path: APP_ROUTES.resumeReview,
        icon: Sparkles,
      },
      {
        label: "Version History",
        path: APP_ROUTES.resumeVersionHistory,
        icon: ClipboardList,
      },
    ],
  },
  {
    label: "Jobs",
    path: APP_ROUTES.jobs,
    icon: BriefcaseBusiness,
    description: "Saved opportunities and sourcing",
    children: [
      {
        label: "Saved Jobs",
        path: APP_ROUTES.jobsSaved,
        icon: BriefcaseBusiness,
      },
      {
        label: "New Job",
        path: APP_ROUTES.jobsNew,
        icon: ClipboardList,
      },
    ],
  },
  {
    label: "Applications",
    path: APP_ROUTES.applications,
    icon: ClipboardList,
    description: "Applications and follow-ups",
    children: [
      {
        label: "Applications",
        path: APP_ROUTES.applicationsList,
        icon: ClipboardList,
      },
      {
        label: "New Application",
        path: APP_ROUTES.applicationsNew,
        icon: ClipboardList,
      },
    ],
  },
  {
    label: "Interviews",
    path: APP_ROUTES.interviews,
    icon: CalendarDays,
    description: "Interview scheduling and prep",
    children: [
      {
        label: "Interviews",
        path: APP_ROUTES.interviewsList,
        icon: CalendarDays,
      },
      {
        label: "Schedule Interview",
        path: APP_ROUTES.interviewsSchedule,
        icon: CalendarDays,
      },
    ],
  },
  {
    label: "AI Career Coach",
    path: APP_ROUTES.aiCoach,
    icon: BrainCircuit,
    description: "Guidance, analysis, and planning",
    children: [
      {
        label: "Dashboard",
        path: APP_ROUTES.aiCoachDashboard,
        icon: BrainCircuit,
      },
      {
        label: "Skill Gap",
        path: APP_ROUTES.aiCoachSkillGap,
        icon: Sparkles,
      },
      {
        label: "Job Match",
        path: APP_ROUTES.aiCoachJobMatch,
        icon: BriefcaseBusiness,
      },
      {
        label: "Career Roadmap",
        path: APP_ROUTES.aiCoachRoadmap,
        icon: ClipboardList,
      },
    ],
  },
  {
    label: "Settings",
    path: APP_ROUTES.settings,
    icon: Settings2,
    description: "Account and workspace preferences",
  },
];
