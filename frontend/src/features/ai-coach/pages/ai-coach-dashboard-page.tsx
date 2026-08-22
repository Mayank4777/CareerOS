import { useEffect, useState } from "react";
import { Compass, Target, Lightbulb, MessageSquareCode, ShieldCheck, Zap, Bot, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { useGetCareerAdvice } from "../hooks/use-ai-coach";
import { AIChatInterface } from "../components/ai-chat-interface";
import { CoverLetterGenerator } from "../components/cover-letter-generator";
import type { CareerAdviceResponse } from "../types";

export function AICoachDashboardPage() {
  const [advice, setAdvice] = useState<CareerAdviceResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "insights" | "cover_letter">("chat");
  const adviceMutation = useGetCareerAdvice();

  useEffect(() => {
    adviceMutation.mutateAsync({ targetRole: "Senior Software Engineer" }).then((res) => {
      setAdvice(res);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const promptChips = [
    "Review my resume bullet points for impact",
    "How to prepare for System Design interviews?",
    "Evaluate salary offer negotiation strategy",
    "Identify missing skill gap for Principal Role",
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-6">
      <PageHeader
        title="AI Career Intelligence & Coach"
        description="Autonomous career strategist powered by local Ollama AI engine."
      />

      {/* Hero Widget Header */}
      <div className="p-4 sm:p-5 rounded-lg border border-border bg-card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-[11px] font-medium">
              <Zap className="w-3 h-3" /> Ollama Local AI Engine: Active
            </div>
            <h2 className="text-xl font-bold text-primary tracking-tight">
              Career Strategy Center
            </h2>
            <p className="text-xs text-secondary max-w-xl leading-normal">
              Interact with your local AI assistant for real-time career guidance, skill evaluation, and cover letter synthesis.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-surface p-3 rounded-md border border-border shrink-0">
            <div className="text-center">
              <span className="text-xl font-bold text-emerald-400">88%</span>
              <span className="block text-[10px] font-medium text-secondary">Readiness</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="text-center">
              <span className="text-xl font-bold text-cyan-400">Local</span>
              <span className="block text-[10px] font-medium text-secondary">Ollama Model</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "chat"
                ? "bg-indigo-600 text-white"
                : "text-secondary hover:text-primary hover:bg-hover"
            }`}
          >
            <Bot className="w-3.5 h-3.5" /> AI Chat Assistant
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "insights"
                ? "bg-indigo-600 text-white"
                : "text-secondary hover:text-primary hover:bg-hover"
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Strategic Advice
          </button>
          <button
            onClick={() => setActiveTab("cover_letter")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "cover_letter"
                ? "bg-indigo-600 text-white"
                : "text-secondary hover:text-primary hover:bg-hover"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Cover Letter Generator
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "chat" && <AIChatInterface />}

      {activeTab === "insights" && (
        adviceMutation.isPending && !advice ? (
          <LoadingState label="Synthesizing personalized career advice..." />
        ) : advice ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 md:col-span-2 space-y-4 border-indigo-500/20 bg-card/90">
              <h3 className="font-bold text-base text-primary flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Compass className="w-5 h-5" />
                </span>
                Strategic AI Insights
              </h3>
              <div className="space-y-3">
                {advice.actionableInsights.map((insight, idx) => (
                  <div key={idx} className="p-4 bg-surface/60 rounded-2xl border border-border/80 flex items-start gap-3.5 transition-all hover:border-indigo-500/30">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-200 leading-relaxed font-normal">{insight}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 space-y-4 border-emerald-500/20 bg-card/90">
              <h3 className="font-bold text-base text-primary flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Target className="w-5 h-5" />
                </span>
                High-Priority Action Plan
              </h3>
              <div className="space-y-3">
                {advice.recommendedNextSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-slate-300 bg-surface/40 p-3 rounded-xl border border-border/60">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : null
      )}

      {activeTab === "cover_letter" && <CoverLetterGenerator />}
    </div>
  );
}
