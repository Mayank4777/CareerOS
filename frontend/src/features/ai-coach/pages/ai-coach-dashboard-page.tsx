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
      <div className="p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-card/90 to-cyan-950/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" /> Ollama Local AI Engine: Active
            </div>
            <h2 className="text-2xl font-black text-primary tracking-tight">
              Welcome to your <span className="gradient-text">Career Flightdeck</span>
            </h2>
            <p className="text-xs text-secondary max-w-xl leading-relaxed">
              Interact with your local AI assistant for real-time career guidance, skill evaluation, and cover letter synthesis.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-surface/80 p-4 rounded-2xl border border-border/80 shrink-0">
            <div className="text-center">
              <span className="text-2xl font-black text-emerald-400">88%</span>
              <span className="block text-[10px] uppercase font-bold text-secondary">Profile Readiness</span>
            </div>
            <div className="h-8 w-px bg-border/60" />
            <div className="text-center">
              <span className="text-2xl font-black text-cyan-400">Local</span>
              <span className="block text-[10px] uppercase font-bold text-secondary">Ollama Model</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border/60">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "chat"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-secondary hover:text-primary hover:bg-hover"
            }`}
          >
            <Bot className="w-4 h-4" /> AI Chat Assistant
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "insights"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-secondary hover:text-primary hover:bg-hover"
            }`}
          >
            <Compass className="w-4 h-4" /> Strategic Advice
          </button>
          <button
            onClick={() => setActiveTab("cover_letter")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "cover_letter"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-secondary hover:text-primary hover:bg-hover"
            }`}
          >
            <FileText className="w-4 h-4" /> Cover Letter Generator
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
