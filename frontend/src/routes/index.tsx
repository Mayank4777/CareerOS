import { createBrowserRouter, type RouteObject } from "react-router-dom";

import { AuthLayout } from "@/layouts/auth-layout";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { ProtectedRoute } from "@/routes/protected";
import { PublicRoute } from "@/routes/public";
import { APP_ROUTES } from "@/constants/routes";
import { navigationItems } from "@/constants/navigation";
import { LoginPage } from "@/features/authentication/pages/login-page";
import { RegisterPage } from "@/features/authentication/pages/register-page";
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { CareerProfilePage } from "@/features/career-profile/pages/career-profile-page";
import { EducationPage } from "@/features/career-profile/pages/education-page";
import { PersonalInformationPage } from "@/features/career-profile/pages/personal-information-page";
import { ExperiencePage } from "@/features/career-profile/pages/experience-page";
import { SkillsPage } from "@/features/career-profile/pages/skills-page";
import { ProjectsPage } from "@/features/career-profile/pages/projects-page";
import { CertificationsPage } from "@/features/career-profile/pages/certifications-page";
import { LanguagesPage } from "@/features/career-profile/pages/languages-page";
import { AchievementsPage } from "@/features/career-profile/pages/achievements-page";
import { AwardsPage } from "@/features/career-profile/pages/awards-page";
import { VolunteerPage } from "@/features/career-profile/pages/volunteer-page";
import { PublicationsPage } from "@/features/career-profile/pages/publications-page";
import { InterestsPage } from "@/features/career-profile/pages/interests-page";
import { ReferencesPage } from "@/features/career-profile/pages/references-page";
import { CustomSectionsPage } from "@/features/career-profile/pages/custom-sections-page";
import { CareerGoalsPage } from "@/features/career-profile/pages/career-goals-page";
import { ResumeDashboardPage, ResumeEditorPage } from "@/features/resumes";
import { ResumeReviewPage } from "@/features/resumes/pages/resume-review-page";
import { ResumeVersionHistoryPage } from "@/features/resumes/pages/resume-version-history-page";
import { SavedJobsPage, NewJobPage } from "@/features/jobs";
import { ApplicationsListPage, NewApplicationPage } from "@/features/applications";
import { InterviewsListPage, ScheduleInterviewPage } from "@/features/interviews";
import {
  AICoachDashboardPage,
  SkillGapPage,
  JobMatchPage,
  CareerRoadmapPage,
} from "@/features/ai-coach";
import { SettingsPage } from "@/features/settings";
import { ResumeEditorRedirectPage } from "@/features/resumes/pages/resume-editor-redirect-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { RootRedirectPage } from "@/pages/root-redirect-page";

function flattenNavigationRoutes() {
  const routes: RouteObject[] = [
    {
      path: APP_ROUTES.dashboard,
      element: <DashboardPage />,
    },
    {
      path: APP_ROUTES.careerProfile,
      element: <CareerProfilePage />,
    },
    {
      path: APP_ROUTES.resumeEditor,
      element: <ResumeEditorRedirectPage />,
    },
    {
      path: APP_ROUTES.resumeEditorDetail,
      element: <ResumeEditorPage />,
    },
  ];

  const careerProfileChildRoutes = new Map<string, RouteObject["element"]>([
    [APP_ROUTES.careerProfilePersonalInformation, <PersonalInformationPage />],
    [APP_ROUTES.careerProfileEducation, <EducationPage />],
    [APP_ROUTES.careerProfileExperience, <ExperiencePage />],
    [APP_ROUTES.careerProfileSkills, <SkillsPage />],
    [APP_ROUTES.careerProfileProjects, <ProjectsPage />],
    [APP_ROUTES.careerProfileCertifications, <CertificationsPage />],
    [APP_ROUTES.careerProfileLanguages, <LanguagesPage />],
    [APP_ROUTES.careerProfileAchievements, <AchievementsPage />],
    [APP_ROUTES.careerProfileAwards, <AwardsPage />],
    [APP_ROUTES.careerProfileVolunteer, <VolunteerPage />],
    [APP_ROUTES.careerProfilePublications, <PublicationsPage />],
    [APP_ROUTES.careerProfileInterests, <InterestsPage />],
    [APP_ROUTES.careerProfileReferences, <ReferencesPage />],
    [APP_ROUTES.careerProfileCustomSections, <CustomSectionsPage />],
    [APP_ROUTES.careerProfileGoals, <CareerGoalsPage />],
  ]);

  const resumeChildRoutes: Record<string, JSX.Element> = {
    [APP_ROUTES.resumeLibrary]: <ResumeDashboardPage />,
    [APP_ROUTES.resumeReview]: <ResumeReviewPage />,
    [APP_ROUTES.resumeVersionHistory]: <ResumeVersionHistoryPage />,
  };

  for (const item of navigationItems) {
    if (item.path === APP_ROUTES.dashboard) {
      continue;
    }

    if (item.path === APP_ROUTES.careerProfile) {
      for (const child of item.children ?? []) {
        routes.push({
          path: child.path,
          element: careerProfileChildRoutes.get(child.path) ?? <CareerProfilePage />,
        });
      }
      continue;
    }

    if (item.path === APP_ROUTES.resume) {
      routes.push({
        path: item.path,
        element: <ResumeDashboardPage />,
      });

      for (const child of item.children ?? []) {
        routes.push({
          path: child.path,
          element: resumeChildRoutes[child.path] ?? <ResumeDashboardPage />,
        });
      }
      continue;
    }

    if (item.path === APP_ROUTES.jobs) {
      routes.push({
        path: item.path,
        element: <SavedJobsPage />,
      });

      for (const child of item.children ?? []) {
        routes.push({
          path: child.path,
          element: child.path === APP_ROUTES.jobsNew ? <NewJobPage /> : <SavedJobsPage />,
        });
      }
      continue;
    }

    if (item.path === APP_ROUTES.applications) {
      routes.push({
        path: item.path,
        element: <ApplicationsListPage />,
      });

      for (const child of item.children ?? []) {
        routes.push({
          path: child.path,
          element: child.path === APP_ROUTES.applicationsNew ? <NewApplicationPage /> : <ApplicationsListPage />,
        });
      }
      continue;
    }

    if (item.path === APP_ROUTES.interviews) {
      routes.push({
        path: item.path,
        element: <InterviewsListPage />,
      });

      for (const child of item.children ?? []) {
        routes.push({
          path: child.path,
          element: child.path === APP_ROUTES.interviewsSchedule ? <ScheduleInterviewPage /> : <InterviewsListPage />,
        });
      }
      continue;
    }

    if (item.path === APP_ROUTES.aiCoach) {
      routes.push({
        path: item.path,
        element: <AICoachDashboardPage />,
      });

      const aiChildRoutes: Record<string, JSX.Element> = {
        [APP_ROUTES.aiCoachDashboard]: <AICoachDashboardPage />,
        [APP_ROUTES.aiCoachSkillGap]: <SkillGapPage />,
        [APP_ROUTES.aiCoachJobMatch]: <JobMatchPage />,
        [APP_ROUTES.aiCoachRoadmap]: <CareerRoadmapPage />,
      };

      for (const child of item.children ?? []) {
        routes.push({
          path: child.path,
          element: aiChildRoutes[child.path] ?? <AICoachDashboardPage />,
        });
      }
      continue;
    }

    if (item.path === APP_ROUTES.settings) {
      routes.push({
        path: item.path,
        element: <SettingsPage />,
      });
      continue;
    }
  }

  return routes;
}

export const router = createBrowserRouter([
  {
    path: APP_ROUTES.root,
    element: <RootRedirectPage />,
  },
  {
    element: <PublicRoute />,
    children: [
      {
        path: APP_ROUTES.login,
        element: (
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        ),
      },
      {
        path: APP_ROUTES.register,
        element: (
          <AuthLayout>
            <RegisterPage />
          </AuthLayout>
        ),
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: flattenNavigationRoutes(),
      },
    ],
  },
  {
    path: APP_ROUTES.notFound,
    element: <NotFoundPage />,
  },
]);
