import { useState } from "react";
import {
  Target,
  BrainCircuit,
  DollarSign,
  Briefcase,
  MapPin,
  Save,
  CheckCircle2,
  Plus,
  Compass,
  Trophy,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";

interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  status: "completed" | "in_progress" | "pending";
}

export function CareerGoalsPage() {
  const toast = useToast();
  const [targetTitle, setTargetTitle] = useState("Staff Frontend Engineer / Engineering Manager");
  const [desiredSalary, setDesiredSalary] = useState("$160,000 - $190,000");
  const [preferredLocation, setPreferredLocation] = useState("Remote / San Francisco, CA");
  const [targetIndustry, setTargetIndustry] = useState("Enterprise SaaS / Fintech");
  const [isSaving, setIsSaving] = useState(false);

  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: "m-1", title: "Complete AWS Certified Solutions Architect Certification", targetDate: "Q3 2026", status: "in_progress" },
    { id: "m-2", title: "Master System Design & Distributed Systems", targetDate: "Q4 2026", status: "in_progress" },
    { id: "m-3", title: "Lead 2 Major Frontend Architecture Refactors", targetDate: "Q2 2026", status: "completed" },
  ]);

  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Career Goals Updated", "Your target role preferences and milestone timeline have been saved.");
    }, 600);
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;
    const newM: Milestone = {
      id: `m-${Date.now()}`,
      title: newMilestoneTitle.trim(),
      targetDate: "Q4 2026",
      status: "pending",
    };
    setMilestones((prev) => [...prev, newM]);
    setNewMilestoneTitle("");
    toast.success("Milestone Added", "New milestone added to your career roadmap.");
  };

  const toggleMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: m.status === "completed" ? "in_progress" : "completed" }
          : m
      )
    );
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-6">
      <PageHeader
        title="Career Goals & Target Role Preferences"
        description="Define your long-term career trajectory, target position requirements, and progress milestones."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Card */}
        <Card className="lg:col-span-2 p-6 space-y-6 border-indigo-500/20 bg-card/90">
          <h3 className="text-base font-bold text-primary flex items-center gap-2.5 border-b border-border/60 pb-3.5">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Target className="w-4 h-4" />
            </span>
            Target Position Preferences
          </h3>

          <form onSubmit={handleSaveGoals} className="space-y-5">
            <FormField label="Target Job Title" htmlFor="target-title" required>
              <Input
                id="target-title"
                value={targetTitle}
                onChange={(e) => setTargetTitle(e.target.value)}
                placeholder="e.g. Senior Staff Engineer"
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Desired Salary Range" htmlFor="desired-salary">
                <Input
                  id="desired-salary"
                  value={desiredSalary}
                  onChange={(e) => setDesiredSalary(e.target.value)}
                  placeholder="e.g. $150k - $180k"
                />
              </FormField>

              <FormField label="Preferred Work Location" htmlFor="preferred-location">
                <Input
                  id="preferred-location"
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  placeholder="e.g. Remote / Hybrid"
                />
              </FormField>
            </div>

            <FormField label="Target Industry / Domain" htmlFor="target-industry">
              <Input
                id="target-industry"
                value={targetIndustry}
                onChange={(e) => setTargetIndustry(e.target.value)}
                placeholder="e.g. Enterprise Software, AI, Fintech"
              />
            </FormField>

            <div className="flex justify-end pt-3 border-t border-border/60">
              <Button type="submit" variant="gradient" disabled={isSaving} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Career Goals"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Career Trajectory Stats */}
        <Card className="p-6 space-y-5 border-border/80 bg-card/90 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-border/60 pb-3">
              <Compass className="w-4 h-4 text-cyan-400" /> Career Trajectory Sync
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface/70 border border-border/60 flex items-center justify-between">
                <span className="text-secondary font-semibold">Target Level:</span>
                <Badge tone="info">Senior / Staff</Badge>
              </div>
              <div className="p-3 rounded-xl bg-surface/70 border border-border/60 flex items-center justify-between">
                <span className="text-secondary font-semibold">Market Readiness:</span>
                <span className="font-bold text-emerald-400">88% Match</span>
              </div>
              <div className="p-3 rounded-xl bg-surface/70 border border-border/60 flex items-center justify-between">
                <span className="text-secondary font-semibold">Milestones Completed:</span>
                <span className="font-bold text-indigo-400">
                  {milestones.filter((m) => m.status === "completed").length} / {milestones.length}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
            <span className="font-bold block text-primary mb-1">AI Recommendation:</span>
            Your target title aligns with recent job saves. Consider completing your AWS certification to unlock 15% higher salary brackets.
          </div>
        </Card>
      </div>

      {/* Milestones Checklist */}
      <Card className="p-6 space-y-5 border-border/80 bg-card/90">
        <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
          <h3 className="text-base font-bold text-primary flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" /> Career Milestones & Progress
          </h3>
        </div>

        <form onSubmit={handleAddMilestone} className="flex gap-3">
          <Input
            placeholder="Add new career milestone (e.g. Master System Design)..."
            value={newMilestoneTitle}
            onChange={(e) => setNewMilestoneTitle(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="secondary" className="flex items-center gap-1.5 shrink-0">
            <Plus className="w-4 h-4" /> Add Milestone
          </Button>
        </form>

        <div className="space-y-3 pt-2">
          {milestones.map((m) => (
            <div
              key={m.id}
              onClick={() => toggleMilestone(m.id)}
              className="p-3.5 rounded-xl bg-surface/60 border border-border/60 flex items-center justify-between cursor-pointer hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    m.status === "completed"
                      ? "bg-emerald-500 border-emerald-400 text-white"
                      : "border-border text-transparent hover:border-indigo-400"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span
                  className={`text-xs font-semibold ${
                    m.status === "completed" ? "line-through text-secondary" : "text-primary"
                  }`}
                >
                  {m.title}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-secondary font-mono">{m.targetDate}</span>
                <Badge
                  tone={m.status === "completed" ? "success" : m.status === "in_progress" ? "warning" : "neutral"}
                  className="capitalize text-[10px]"
                >
                  {m.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
