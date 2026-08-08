import { useState } from "react";
import { Sparkles, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card } from "@/components/ui/card";
import { useGetJobMatch } from "../hooks/use-ai-coach";
import { useToast } from "@/components/ui/toast";
import type { JobMatchResponse } from "../types";

export function JobMatchCard() {
  const toast = useToast();
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [matchResult, setMatchResult] = useState<JobMatchResponse | null>(null);

  const matchMutation = useGetJobMatch();

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !companyName) {
      toast.error("Please fill in job title and company name.");
      return;
    }

    try {
      const res = await matchMutation.mutateAsync({ jobTitle, companyName });
      setMatchResult(res);
      toast.success("Job match evaluated.");
    } catch {
      toast.error("Failed to calculate job match.");
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-primary flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Job Match Evaluation
        </h3>
        <p className="text-xs text-secondary">
          Evaluate how strongly your profile aligns with a target job opportunity.
        </p>
      </div>

      <form onSubmit={handleMatch} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Job Title" htmlFor="jm-title" required>
          <Input id="jm-title" placeholder="e.g. Senior Product Manager" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
        </FormField>
        <FormField label="Company Name" htmlFor="jm-company" required>
          <Input id="jm-company" placeholder="e.g. Airbnb" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </FormField>
        <div className="flex items-end">
          <Button type="submit" disabled={matchMutation.isPending} className="w-full flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            {matchMutation.isPending ? "Evaluating..." : "Check Match"}
          </Button>
        </div>
      </form>

      {matchResult && (
        <div className="p-4 bg-hover/40 rounded-xl border border-border space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-base text-primary">
                {matchResult.jobTitle} at {matchResult.companyName}
              </h4>
              <p className="text-xs text-secondary mt-0.5">{matchResult.recommendation}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{matchResult.matchScore}%</span>
              <span className="block text-[10px] uppercase font-semibold text-secondary">Match Score</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
            <div>
              <h5 className="text-xs font-semibold text-success flex items-center gap-1 mb-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> Strengths
              </h5>
              <ul className="space-y-1">
                {matchResult.strengths.map((str, i) => (
                  <li key={i} className="text-xs text-secondary">
                    • {str}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-semibold text-warning flex items-center gap-1 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Areas to Highlight
              </h5>
              <ul className="space-y-1">
                {matchResult.gaps.map((gap, i) => (
                  <li key={i} className="text-xs text-secondary">
                    • {gap}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
