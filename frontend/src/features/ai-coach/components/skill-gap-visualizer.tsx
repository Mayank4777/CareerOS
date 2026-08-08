import { useState } from "react";
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalyzeSkillGap } from "../hooks/use-ai-coach";
import { useToast } from "@/components/ui/toast";
import type { SkillGapResponse } from "../types";

export function SkillGapVisualizer() {
  const toast = useToast();
  const [targetRole, setTargetRole] = useState("");
  const [customSkills, setCustomSkills] = useState("");
  const [analysis, setAnalysis] = useState<SkillGapResponse | null>(null);

  const analyzeMutation = useAnalyzeSkillGap();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole) {
      toast.error("Please enter a target role.");
      return;
    }

    const requiredSkillsList = customSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await analyzeMutation.mutateAsync({
        targetRole,
        requiredSkills: requiredSkillsList,
      });
      setAnalysis(res);
      toast.success("Skill gap analysis complete.");
    } catch {
      toast.error("Failed to analyze skill gaps.");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-purple-500/20 bg-card/90">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Target className="w-5 h-5" />
              </span>
              Skill Gap & Target Role Radar
            </h3>
            <p className="text-xs text-secondary mt-1">
              Cross-examine your active Career Profile skills against market benchmarks for target engineering & product roles.
            </p>
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Target Target Role Title" htmlFor="sg-role" className="sm:col-span-1" required>
            <Input
              id="sg-role"
              placeholder="e.g. Lead Backend Architect"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
          </FormField>

          <FormField label="Required Skills Benchmark (Comma-separated)" htmlFor="sg-skills" className="sm:col-span-1">
            <Input
              id="sg-skills"
              placeholder="e.g. Python, Docker, System Design"
              value={customSkills}
              onChange={(e) => setCustomSkills(e.target.value)}
            />
          </FormField>

          <div className="flex items-end sm:col-span-1">
            <Button type="submit" variant="gradient" disabled={analyzeMutation.isPending} className="w-full flex items-center justify-center gap-2 h-10">
              <Zap className="w-4 h-4" />
              {analyzeMutation.isPending ? "Evaluating Radar..." : "Evaluate Skill Gap"}
            </Button>
          </div>
        </form>
      </Card>

      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex flex-col items-center justify-center text-center border-indigo-500/30 bg-card/90 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <h4 className="text-xs uppercase tracking-widest font-bold text-secondary mb-3">Market Readiness Index</h4>
            
            <div className="relative flex items-center justify-center my-2">
              <div className="w-28 h-28 rounded-full border-4 border-indigo-500/20 flex items-center justify-center bg-surface/50 shadow-inner">
                <span className="text-4xl font-black gradient-text">{analysis.readinessScore}%</span>
              </div>
            </div>

            <div className="w-full bg-surface/80 rounded-full h-2 mt-4 overflow-hidden border border-border/60">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${analysis.readinessScore}%` }}
              />
            </div>
            <p className="text-xs font-medium text-secondary mt-3">Target Profile Match: {analysis.targetRole}</p>
          </Card>

          <Card className="p-6 md:col-span-2 space-y-5 border-border/80 bg-card/90">
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Profile Skill Strengths
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.matchingSkills.length > 0 ? (
                  analysis.matchingSkills.map((sk) => (
                    <Badge key={sk} tone="success">
                      {sk}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-secondary">No matching skills recorded in profile yet.</span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-border/60">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Benchmark Skill Gaps
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills.length > 0 ? (
                  analysis.missingSkills.map((sk) => (
                    <Badge key={sk} tone="warning">
                      {sk}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-emerald-400 font-semibold">100% Target Match Achieved!</span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-border/60">
              <h4 className="text-xs font-bold text-primary mb-3">AI Actionable Learning Strategy:</h4>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} className="text-xs text-secondary flex items-start gap-2.5 bg-surface/50 p-2.5 rounded-xl border border-border/60">
                    <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
