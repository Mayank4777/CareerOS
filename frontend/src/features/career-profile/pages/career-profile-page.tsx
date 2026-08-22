import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BadgeCheck,
  BrainCircuit,
  BookOpenText,
  BriefcaseBusiness,
  Compass,
  FileText,
  GraduationCap,
  HandHeart,
  Languages,
  LayoutGrid,
  Sparkles,
  Trophy,
  UserRound,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/cards/section-card";
import { StatCard } from "@/components/cards/stat-card";
import { APP_ROUTES } from "@/constants/routes";
import { fetchCareerProfile } from "@/features/career-profile/services/career-profile";
import { fetchEducations } from "@/features/career-profile/services/education";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import type { CareerProfile } from "@/features/career-profile/types/career-profile";

const PROFILE_FIELDS: Array<keyof CareerProfile> = [
  "firstName",
  "lastName",
  "headline",
  "phone",
  "location",
  "website",
  "linkedin",
  "github",
  "summary",
];

const careerProfileSections = [
  {
    label: "Personal Information",
    path: APP_ROUTES.careerProfilePersonalInformation,
    icon: UserRound,
    description: "Your core identity, contact details, and summary live here.",
    status: "Ready",
  },
  {
    label: "Education",
    path: APP_ROUTES.careerProfileEducation,
    icon: GraduationCap,
    description: "Capture degrees, institutions, and academic timelines.",
    status: "Ready",
  },
  {
    label: "Experience",
    path: APP_ROUTES.careerProfileExperience,
    icon: BriefcaseBusiness,
    description: "Build a structured work history for future applications.",
    status: "Planned",
  },
  {
    label: "Skills",
    path: APP_ROUTES.careerProfileSkills,
    icon: Sparkles,
    description: "Group your capabilities so matching and summaries stay sharp.",
    status: "Planned",
  },
  {
    label: "Projects",
    path: APP_ROUTES.careerProfileProjects,
    icon: FileText,
    description: "Showcase product work, side projects, and portfolios.",
    status: "Planned",
  },
  {
    label: "Certifications",
    path: APP_ROUTES.careerProfileCertifications,
    icon: BadgeCheck,
    description: "Store credentials that reinforce your expertise.",
    status: "Planned",
  },
  {
    label: "Languages",
    path: APP_ROUTES.careerProfileLanguages,
    icon: Languages,
    description: "Capture language fluency for roles and locations.",
    status: "Planned",
  },
  {
    label: "Achievements",
    path: APP_ROUTES.careerProfileAchievements,
    icon: Trophy,
    description: "Highlight milestones, wins, and measurable outcomes.",
    status: "Planned",
  },
  {
    label: "Awards",
    path: APP_ROUTES.careerProfileAwards,
    icon: Award,
    description: "Keep formal recognitions and distinctions in one place.",
    status: "Planned",
  },
  {
    label: "Volunteer",
    path: APP_ROUTES.careerProfileVolunteer,
    icon: HandHeart,
    description: "Document service work and community contributions.",
    status: "Planned",
  },
  {
    label: "Publications",
    path: APP_ROUTES.careerProfilePublications,
    icon: BookOpenText,
    description: "List articles, papers, and published work.",
    status: "Planned",
  },
  {
    label: "Interests",
    path: APP_ROUTES.careerProfileInterests,
    icon: Compass,
    description: "Surface the subjects and directions you care about.",
    status: "Planned",
  },
  {
    label: "References",
    path: APP_ROUTES.careerProfileReferences,
    icon: UsersRound,
    description: "Organize people who can speak to your work.",
    status: "Planned",
  },
  {
    label: "Custom Sections",
    path: APP_ROUTES.careerProfileCustomSections,
    icon: LayoutGrid,
    description: "Add flexible sections as the workspace grows.",
    status: "Planned",
  },
  {
    label: "Career Goals",
    path: APP_ROUTES.careerProfileGoals,
    icon: BrainCircuit,
    description: "Track targets that guide the rest of the workspace.",
    status: "Planned",
  },
] as const;

export function CareerProfilePage() {
  const profileQuery = useQuery({
    queryKey: ["career-profile"],
    queryFn: fetchCareerProfile,
  });

  const educationQuery = useQuery({
    queryKey: ["career-profile", "educations"],
    queryFn: fetchEducations,
  });

  const profile = profileQuery.data ?? null;
  const educations = educationQuery.data ?? [];

  const profileFieldCompletion = useMemo(() => {
    if (!profile) {
      return { completed: 0, total: PROFILE_FIELDS.length, percentage: 0 };
    }

    const completed = PROFILE_FIELDS.filter((field) => {
      const value = profile[field];
      return typeof value === "string" && value.trim().length > 0;
    }).length;

    return {
      completed,
      total: PROFILE_FIELDS.length,
      percentage: Math.round((completed / PROFILE_FIELDS.length) * 100),
    };
  }, [profile]);

  const educationCompletion = educations.length > 0 ? 100 : 0;
  const sectionCompletion = careerProfileSections.filter((section) => section.status === "Ready").length;
  const totalSections = careerProfileSections.length;
  const overviewCompletion = Math.round((profileFieldCompletion.percentage + educationCompletion) / 2);

  if (profileQuery.isLoading || educationQuery.isLoading) {
    return <LoadingState label="Loading career profile overview..." />;
  }

  if (profileQuery.isError || educationQuery.isError) {
    return (
      <ErrorState
        description="We could not load the career profile overview right now. Please try again in a moment."
        onRetry={() => {
          void profileQuery.refetch();
          void educationQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: APP_ROUTES.dashboard }, { label: "Career Profile" }]}
        title="Career Profile"
        description="Your profile workspace overview, with quick access to each section and a summary of completion."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to={APP_ROUTES.careerProfilePersonalInformation}>Personal Information</Link>
            </Button>
            <Button asChild>
              <Link to={APP_ROUTES.careerProfileEducation}>Education</Link>
            </Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Profile completion"
          value={`${overviewCompletion}%`}
          change={profileFieldCompletion.completed === profileFieldCompletion.total ? "Complete" : "In progress"}
          icon={Sparkles}
          tone={overviewCompletion >= 75 ? "success" : "info"}
          description="Based on the personal profile fields and education coverage"
        />
        <StatCard
          title="Profile fields"
          value={`${profileFieldCompletion.completed}/${profileFieldCompletion.total}`}
          change={profile ? "Profile exists" : "Not created"}
          icon={UserRound}
          tone={profile ? "success" : "warning"}
          description="Core identity and contact details"
        />
        <StatCard
          title="Education records"
          value={`${educations.length}`}
          change={educations.length > 0 ? "Added" : "Empty"}
          icon={GraduationCap}
          tone={educations.length > 0 ? "success" : "neutral"}
          description="Structured academic history"
        />
        <StatCard
          title="Sections ready"
          value={`${sectionCompletion}/${totalSections}`}
          change="Overview only"
          icon={LayoutGrid}
          tone="info"
          description="Pages already wired into the workspace"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <SectionCard
          title="Progress"
          description="A simple read on how much of the profile workspace is ready today."
        >
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-primary">Overall completion</p>
                  <p className="text-sm leading-6 text-secondary">
                    Personal information and education drive the current profile progress score.
                  </p>
                </div>
                <p className="text-3xl font-semibold tracking-tight text-primary">{overviewCompletion}%</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-hover">
                <div
                  className="h-full rounded-full bg-brand-600 transition-[width] duration-normal"
                  style={{ width: `${overviewCompletion}%` }}
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <ProgressPill
                label="Personal information"
                value={`${profileFieldCompletion.percentage}%`}
                detail={`${profileFieldCompletion.completed}/${profileFieldCompletion.total} fields complete`}
              />
              <ProgressPill
                label="Education"
                value={educationCompletion === 100 ? "Ready" : "Empty"}
                detail={
                  educationCompletion === 100
                    ? `${educations.length} record${educations.length === 1 ? "" : "s"} available`
                    : "No education records yet"
                }
              />
              <ProgressPill
                label="Future sections"
                value={`${sectionCompletion}/${totalSections}`}
                detail="Planned sections remain available from the sidebar"
              />
            </div>
          </div>
        </SectionCard>

        <Card>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-base font-semibold text-primary">Short section guide</p>
              <p className="text-sm leading-6 text-secondary">
                Each sidebar item has its own page, and this overview links into the same layout without
                changing the design system.
              </p>
            </div>
            <div className="space-y-3 text-sm leading-6 text-secondary">
              {careerProfileSections.slice(0, 5).map((section) => (
                <div key={section.path} className="rounded-xl border border-border bg-hover/30 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-primary">{section.label}</p>
                      <p className="mt-1">{section.description}</p>
                    </div>
                    <Badge tone={section.status === "Ready" ? "success" : "neutral"}>{section.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <SectionCard
        title="Navigation cards"
        description="Jump into any Career Profile section from here. The overview stays read-only."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {careerProfileSections.map((section) => {
            const Icon = section.icon;

            return (
              <Link
                key={section.path}
                to={section.path}
                className="group flex h-full flex-col justify-between rounded-xl border border-border bg-surface p-4 transition-colors duration-normal hover:border-borderHover hover:bg-hover"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-primary">{section.label}</p>
                      <p className="mt-1 text-sm leading-6 text-secondary">{section.description}</p>
                    </div>
                  </div>
                  <Badge tone={section.status === "Ready" ? "success" : "neutral"}>{section.status}</Badge>
                </div>
              </Link>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}

function ProgressPill({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-hover/20 px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold text-primary">{value}</p>
      <p className="mt-1 text-sm leading-6 text-secondary">{detail}</p>
    </div>
  );
}
