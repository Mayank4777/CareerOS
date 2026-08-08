import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function CareerRoadmapPage() {
  const milestones = [
    {
      phase: "Phase 1: Foundation & Profile",
      status: "completed",
      items: [
        "Complete Career Profile details",
        "Add education, experience, and project entries",
        "List technical & soft skills",
      ],
    },
    {
      phase: "Phase 2: Resume Optimization",
      status: "completed",
      items: [
        "Generate tailored resume versions",
        "Run AI resume analysis & score checks",
        "Refine bullet points with quantitative impact metrics",
      ],
    },
    {
      phase: "Phase 3: Targeted Application Strategy",
      status: "in_progress",
      items: [
        "Track saved target job postings",
        "Evaluate AI job match scores",
        "Generate custom cover letters for top roles",
      ],
    },
    {
      phase: "Phase 4: Interview & Offer Management",
      status: "upcoming",
      items: [
        "Schedule and track technical rounds",
        "Record pre-interview prep notes & feedback",
        "Compare job offers and salary packages",
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      <PageHeader
        title="Career Roadmap"
        description="Structured step-by-step career progression milestones toward your target role."
      />

      <div className="space-y-6">
        {milestones.map((m, idx) => (
          <Card key={idx} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {m.status === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <Circle className="w-5 h-5 text-secondary" />
                )}
                <h3 className="font-semibold text-base text-primary">{m.phase}</h3>
              </div>
              <Badge tone={m.status === "completed" ? "success" : m.status === "in_progress" ? "info" : "neutral"}>
                {m.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {m.items.map((item, i) => (
                <div key={i} className="p-3 bg-hover/40 rounded-xl border border-border flex items-start gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-xs text-secondary">{item}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
