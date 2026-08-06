import { BrainCircuit, BriefcaseBusiness, CheckCircle2, ClipboardList, Clock3, FileText, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/cards/section-card";
import { StatCard } from "@/components/cards/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { APP_ROUTES } from "@/constants/routes";
import { Link } from "react-router-dom";

const stats = [
  {
    title: "Career score",
    value: "84",
    change: "+6 this week",
    icon: Sparkles,
    tone: "success" as const,
    description: "Profile readiness across the core modules",
  },
  {
    title: "Active applications",
    value: "12",
    change: "+3 open",
    icon: ClipboardList,
    tone: "info" as const,
    description: "Applications currently under tracking",
  },
  {
    title: "Interviews scheduled",
    value: "4",
    change: "2 this week",
    icon: Clock3,
    tone: "warning" as const,
    description: "Upcoming conversations in the pipeline",
  },
  {
    title: "Resume versions",
    value: "7",
    change: "+1 saved",
    icon: FileText,
    tone: "neutral" as const,
    description: "Current and historical resume variants",
  },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A premium command center for the user's career operations, ready for live data."
        breadcrumbs={[{ label: "Dashboard" }]}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to={APP_ROUTES.careerProfile}>Update profile</Link>
            </Button>
            <Button asChild>
              <Link to={APP_ROUTES.resume}>Review resume</Link>
            </Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <SectionCard
          title="AI guidance"
          description="A short overview of the kind of insight the next AI modules will provide."
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-hover/40 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
                  <BrainCircuit className="h-4 w-4" />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-primary">Profile gap detected</p>
                    <Badge tone="info">High impact</Badge>
                  </div>
                  <p className="text-sm leading-6 text-secondary">
                    Add more detail to recent experience and projects to improve matching quality
                    for upcoming job applications.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button variant="secondary" className="justify-start">
                <CheckCircle2 className="h-4 w-4" />
                Complete profile sections
              </Button>
              <Button variant="secondary" className="justify-start">
                <BriefcaseBusiness className="h-4 w-4" />
                Review saved jobs
              </Button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Recent activity" description="A lightweight placeholder for the activity feed.">
          <div className="space-y-4">
            <EmptyState
              title="No activity loaded yet"
              description="Once the first module queries are wired up, this area will surface recent actions, updates, and reminders."
              icon={<ClipboardList className="h-6 w-6" />}
            />
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Quick actions"
        description="A small set of common career-management actions ready for future expansion."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            "Create resume version",
            "Track a new application",
            "Prepare for interview",
            "Open career coach",
          ].map((label) => (
            <Button key={label} variant="secondary" className="justify-start">
              {label}
            </Button>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
