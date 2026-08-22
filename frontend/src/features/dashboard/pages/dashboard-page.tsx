import { useQuery } from "@tanstack/react-query";
import { BrainCircuit, CheckCircle2, ClipboardList, Clock3, FileText, Sparkles, ArrowRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/cards/section-card";
import { StatCard } from "@/components/cards/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { APP_ROUTES } from "@/constants/routes";
import { fetchDashboardIntelligence } from "../services/dashboard";

export function DashboardPage() {
  const intelligenceQuery = useQuery({
    queryKey: ["dashboard", "intelligence"],
    queryFn: fetchDashboardIntelligence,
  });

  if (intelligenceQuery.isLoading) {
    return <LoadingState label="Analyzing career intelligence..." />;
  }

  if (intelligenceQuery.isError || !intelligenceQuery.data) {
    return (
      <ErrorState
        description="Could not load career intelligence metrics."
        onRetry={() => {
          void intelligenceQuery.refetch();
        }}
      />
    );
  }

  const data = intelligenceQuery.data;

  const stats = [
    {
      title: "Career score",
      value: `${data.careerScore}%`,
      change: `${data.profileCompleteness}% profile ready`,
      icon: Sparkles,
      tone: "success" as const,
      description: "Overall profile completeness & career health",
    },
    {
      title: "ATS readiness",
      value: `${data.atsReadiness}%`,
      change: `${data.resumesCount} resumes created`,
      icon: FileText,
      tone: "info" as const,
      description: "Average ATS score across active resume drafts",
    },
    {
      title: "Active applications",
      value: String(data.activeApplications),
      change: "Tracking open",
      icon: ClipboardList,
      tone: "warning" as const,
      description: "Job applications currently in your pipeline",
    },
    {
      title: "Upcoming interviews",
      value: String(data.upcomingInterviews),
      change: "Scheduled",
      icon: Clock3,
      tone: "neutral" as const,
      description: "Upcoming conversations with recruiters",
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Career Dashboard"
        description="Real-time career progress tracking, ATS readiness, and recommended actions."
        breadcrumbs={[{ label: "Dashboard" }]}
        actions={
          <>
            <Button asChild variant="secondary" size="sm">
              <Link to={APP_ROUTES.careerProfile}>Update Career Profile</Link>
            </Button>
            <Button asChild size="sm">
              <Link to={APP_ROUTES.resume}>Create Resume</Link>
            </Button>
          </>
        }
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      {/* Missing Information Banners */}
      {data.missingItems.length > 0 && (
        <SectionCard
          title="Missing Profile Information"
          description="CareerOS detected missing career profile fields that impact your AI resume generation score."
        >
          <div className="grid gap-2.5 md:grid-cols-2">
            {data.missingItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-md border border-amber-500/30 bg-amber-500/5">
                <div className="space-y-0.5 pr-3 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-xs font-semibold text-primary truncate">{item.title}</span>
                    <Badge tone="warning" className="text-[9px] uppercase">{item.severity}</Badge>
                  </div>
                  <p className="text-[11px] text-secondary leading-snug truncate">{item.description}</p>
                </div>
                <Button asChild variant="secondary" size="sm" className="shrink-0 text-xs">
                  <Link to={item.path}>Add {item.section.replace("-", " ")}</Link>
                </Button>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
        <SectionCard
          title="Recommended Actions"
          description="Actionable career recommendations calculated by CareerOS."
        >
          <div className="space-y-2.5">
            {data.recommendedActions.map((action) => (
              <div key={action.id} className="rounded-md border border-border bg-surface/60 p-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded bg-indigo-600/90 text-white shrink-0">
                      <BrainCircuit className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-primary truncate">{action.title}</p>
                        <Badge tone="info">{action.badge}</Badge>
                      </div>
                      <p className="text-xs leading-normal text-secondary mt-0.5">{action.description}</p>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="primary" className="shrink-0 flex items-center gap-1">
                    <Link to={action.actionPath}>
                      {action.actionLabel} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent Activity" description="Timeline of career updates and resume generation logs.">
          <div className="space-y-2 text-xs">
            {data.recentActivity.map((act) => (
              <div key={act.id} className="p-2.5 rounded-md border border-border bg-hover/30 space-y-0.5">
                <div className="flex items-center justify-between text-primary font-medium">
                  <span className="truncate">{act.title}</span>
                  <span className="text-[10px] text-muted font-mono shrink-0 ml-2">{act.timestamp}</span>
                </div>
                <p className="text-secondary text-[11px] truncate">{act.description}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Quick Actions"
        description="Accelerate your job search workflow."
      >
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          <Button asChild variant="secondary" size="sm" className="justify-start">
            <Link to="/resumes">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400 mr-2" /> Create Tailored Resume
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm" className="justify-start">
            <Link to="/resumes/review">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mr-2" /> Run AI ATS Audit
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm" className="justify-start">
            <Link to="/applications">
              <ClipboardList className="h-3.5 w-3.5 text-cyan-400 mr-2" /> Track New Application
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm" className="justify-start">
            <Link to="/ai-coach">
              <BrainCircuit className="h-3.5 w-3.5 text-amber-400 mr-2" /> Open AI Career Coach
            </Link>
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

