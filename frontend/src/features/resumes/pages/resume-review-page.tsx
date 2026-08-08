import { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Wand2,
  RefreshCw,
  Search,
  BookOpen,
  Zap,
  ArrowRight,
  Gauge,
  Check,
  Building2,
  Eye,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import type { ResumeReviewReport, GrammarIssue } from "../types/review";

const mockReviewData: ResumeReviewReport = {
  resumeId: "res-1",
  resumeTitle: "Senior Frontend Engineer Resume",
  overallScore: 88,
  grade: "A",
  targetRole: "Senior Frontend Engineer / Tech Lead",
  missingKeywords: ["GraphQL", "Micro-frontends", "CI/CD Pipeline", "Web Vitals", "Unit Testing"],
  presentKeywords: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Redux", "REST API", "State Management", "Performance Optimization"],
  actionVerbsCount: 38,
  readabilityScore: "Advanced Professional (Grade 12)",
  metrics: [
    { category: "Keyword Match Rate", score: 82, maxScore: 100, status: "optimal", details: "18 out of 23 target keywords present" },
    { category: "Formatting & Structure", score: 95, maxScore: 100, status: "optimal", details: "Clean hierarchy with parseable section headers" },
    { category: "Quantifiable Impact", score: 78, maxScore: 100, status: "warning", details: "5 bullet points need numeric metrics (% or $)" },
    { category: "Action Verb Strength", score: 90, maxScore: 100, status: "optimal", details: "High density of active verbs (Architected, Engineered)" },
  ],
  sectionAnalyses: [
    {
      sectionName: "Experience Section",
      score: 85,
      status: "strong",
      feedback: ["Strong technical action verbs used", "Clear timeline continuity"],
      recommendations: ["Add metrics to Senior Developer role (e.g. boosted lighthouse score by 35%)"],
    },
    {
      sectionName: "Skills & Technical Stack",
      score: 92,
      status: "strong",
      feedback: ["Well grouped by frontend core, frameworks, tools"],
      recommendations: ["Include GraphQL and Docker if applying for fullstack positions"],
    },
    {
      sectionName: "Education & Credentials",
      score: 90,
      status: "strong",
      feedback: ["Degree and university clearly specified with graduation year"],
      recommendations: ["Consider adding recent AWS or Frontend certifications"],
    },
  ],
  issues: [
    {
      id: "iss-1",
      section: "Experience Bullet 3",
      originalText: "Responsible for managing the team and fixing bugs in the frontend repo.",
      suggestedText: "Spearheaded frontend bug resolution and led a team of 4 engineers to improve application stability by 40%.",
      explanation: "Replace passive phrasing 'Responsible for' with active leadership verb 'Spearheaded' and quantifiable result.",
      issueType: "action_verb",
    },
    {
      id: "iss-2",
      section: "Summary Statement",
      originalText: "Passionate developer who works hard and learns fast.",
      suggestedText: "Results-driven Senior Frontend Engineer with 6+ years of expertise building high-performance React architectures.",
      explanation: "Elevate tone from generic personal traits to specific technical identity and experience level.",
      issueType: "readability",
    },
    {
      id: "iss-3",
      section: "Projects Section",
      originalText: "Built a app for job tracking using web tech.",
      suggestedText: "Engineered a full-stack career workspace using Next.js, Django REST Framework, and Tailwind CSS.",
      explanation: "Fix grammar ('a app' -> 'an app') and specify concrete tech stack.",
      issueType: "grammar",
    },
  ],
  strengths: [
    "High keyword alignment for React and TypeScript engineering roles",
    "Flawless contact and social links header formatting",
    "Consistent tense usage across present and past roles",
  ],
  weaknesses: [
    "Missing GraphQL and Micro-frontend keywords for target Lead roles",
    "3 bullet points use passive 'Worked on' phrasing",
  ],
};

export function ResumeReviewPage() {
  const toast = useToast();
  const [report, setReport] = useState<ResumeReviewReport>(mockReviewData);
  const [isAuditing, setIsAuditing] = useState(false);
  const [fixedIssues, setFixedIssues] = useState<string[]>([]);
  const [addedKeywords, setAddedKeywords] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "issues" | "keywords" | "sections">("overview");

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      toast.success("AI Resume Audit Complete", "Your ATS score and keyword analysis have been refreshed.");
    }, 1200);
  };

  const handleFixWithAI = (issue: GrammarIssue) => {
    if (fixedIssues.includes(issue.id)) return;
    setFixedIssues((prev) => [...prev, issue.id]);
    setReport((prev) => ({
      ...prev,
      overallScore: Math.min(100, prev.overallScore + 3),
      issues: prev.issues.filter((i) => i.id !== issue.id),
    }));
    toast.success("Issue Auto-Fixed", `Applied suggestion for ${issue.section}. ATS score improved!`);
  };

  const handleAddKeyword = (kw: string) => {
    if (addedKeywords.includes(kw)) return;
    setAddedKeywords((prev) => [...prev, kw]);
    setReport((prev) => ({
      ...prev,
      missingKeywords: prev.missingKeywords.filter((k) => k !== kw),
      presentKeywords: [...prev.presentKeywords, kw],
      overallScore: Math.min(100, prev.overallScore + 2),
    }));
    toast.success("Keyword Added to Draft", `"${kw}" integrated into technical skills section.`);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-6">
      <PageHeader
        title="Resume Review & ATS Optimization"
        description="Comprehensive AI audit of your resume structure, keyword density, action verbs, and ATS compatibility."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRunAudit} disabled={isAuditing} className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${isAuditing ? "animate-spin" : ""}`} />
              {isAuditing ? "Auditing..." : "Run AI Audit"}
            </Button>
            <Button variant="gradient" size="sm" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" /> Auto-Optimize Draft
            </Button>
          </div>
        }
      />

      {/* Target Role Selector & Overall Score Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score Dial */}
        <Card className="p-6 flex flex-col justify-between items-center text-center border-indigo-500/30 bg-gradient-to-br from-card/90 via-card/70 to-indigo-950/20 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Gauge className="w-32 h-32 text-indigo-400" />
          </div>
          <div className="space-y-1 w-full text-left border-b border-border/60 pb-3">
            <span className="text-[11px] font-semibold tracking-wider text-indigo-400 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Overall ATS Match Rating
            </span>
            <h3 className="text-base font-bold text-primary truncate">{report.resumeTitle}</h3>
          </div>

          <div className="my-6 relative flex flex-col items-center justify-center">
            <div className="w-36 h-36 rounded-full border-8 border-indigo-500/20 flex items-center justify-center relative bg-surface/50 shadow-inner">
              <div
                className="absolute inset-0 rounded-full border-8 border-indigo-500 border-t-transparent animate-spin-slow"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 88%, 0 88%)" }}
              />
              <div className="text-center">
                <span className="text-4xl font-extrabold text-primary tracking-tight">{report.overallScore}</span>
                <span className="text-xs text-secondary block font-medium">/ 100</span>
              </div>
            </div>
            <Badge tone="success" className="mt-4 px-3 py-1 text-xs font-bold">
              Grade {report.grade} — Optimal ATS Fit
            </Badge>
          </div>

          <p className="text-xs text-secondary leading-relaxed">
            Your resume is in the top <strong className="text-primary font-semibold">12%</strong> of applicants for {report.targetRole}.
          </p>
        </Card>

        {/* Quick Metrics Bento */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-5 flex flex-col justify-between border-border/80 bg-card/80">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-secondary block">Missing Keywords</span>
                <span className="text-2xl font-bold text-amber-400 mt-1 block">
                  {report.missingKeywords.length} Critical
                </span>
              </div>
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle className="w-5 h-5" />
              </span>
            </div>
            <p className="text-xs text-secondary mt-3">
              Integrating missing keywords can boost your ATS interview callback rate by up to 34%.
            </p>
          </Card>

          <Card className="p-5 flex flex-col justify-between border-border/80 bg-card/80">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-secondary block">Action Verbs Count</span>
                <span className="text-2xl font-bold text-emerald-400 mt-1 block">
                  {report.actionVerbsCount} Active Verbs
                </span>
              </div>
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Zap className="w-5 h-5" />
              </span>
            </div>
            <p className="text-xs text-secondary mt-3">
              Strong leadership action verbs (Spearheaded, Architected) detected in experience bullet points.
            </p>
          </Card>

          <Card className="p-5 flex flex-col justify-between border-border/80 bg-card/80">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-secondary block">Readability Score</span>
                <span className="text-base font-bold text-primary mt-1 block truncate">
                  {report.readabilityScore}
                </span>
              </div>
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <BookOpen className="w-5 h-5" />
              </span>
            </div>
            <p className="text-xs text-secondary mt-3">
              Optimal text density and bullet lengths for recruiter skimability (average 6 seconds).
            </p>
          </Card>

          <Card className="p-5 flex flex-col justify-between border-border/80 bg-card/80">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-secondary block">Grammar & Formatting</span>
                <span className="text-2xl font-bold text-indigo-400 mt-1 block">
                  {report.issues.length} Fixes Ready
                </span>
              </div>
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Wand2 className="w-5 h-5" />
              </span>
            </div>
            <p className="text-xs text-secondary mt-3">
              One-click AI auto-fix options available for instant bullet improvement.
            </p>
          </Card>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "overview"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-secondary hover:text-primary hover:bg-hover"
          }`}
        >
          ATS Metrics Breakdown
        </button>
        <button
          onClick={() => setActiveTab("issues")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === "issues"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-secondary hover:text-primary hover:bg-hover"
          }`}
        >
          AI Suggestions & Fixes
          {report.issues.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-bold">
              {report.issues.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("keywords")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "keywords"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-secondary hover:text-primary hover:bg-hover"
          }`}
        >
          Keyword Match Inspector
        </button>
        <button
          onClick={() => setActiveTab("sections")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "sections"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-secondary hover:text-primary hover:bg-hover"
          }`}
        >
          Section Analysis
        </button>
      </div>

      {/* Tab 1: ATS Metrics Breakdown */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4 border-border/80 bg-card/80">
              <h4 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-border/60 pb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Key Resume Strengths
              </h4>
              <ul className="space-y-2.5">
                {report.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-secondary">
                    <span className="p-0.5 rounded bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                    {str}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 space-y-4 border-border/80 bg-card/80">
              <h4 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-border/60 pb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Areas for Improvement
              </h4>
              <ul className="space-y-2.5">
                {report.weaknesses.map((wk, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-secondary">
                    <span className="p-0.5 rounded bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                      <AlertTriangle className="w-3 h-3" />
                    </span>
                    {wk}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="p-6 space-y-5 border-border/80 bg-card/80">
            <h4 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-border/60 pb-3">
              <FileCheck2 className="w-4 h-4 text-indigo-400" /> ATS Compatibility Category Analysis
            </h4>
            <div className="space-y-4">
              {report.metrics.map((m, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-primary">{m.category}</span>
                    <span className="text-indigo-400">{m.score} / {m.maxScore}</span>
                  </div>
                  <div className="w-full bg-surface/80 h-2 rounded-full overflow-hidden border border-border/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        m.score >= 85
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : m.score >= 70
                          ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                          : "bg-gradient-to-r from-rose-500 to-red-400"
                      }`}
                      style={{ width: `${m.score}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-secondary">{m.details}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: AI Suggestions & Fixes */}
      {activeTab === "issues" && (
        <div className="space-y-4">
          {report.issues.length === 0 ? (
            <Card className="p-8 text-center border-emerald-500/30 bg-emerald-500/5">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-base font-bold text-primary">All Issues Resolved!</h4>
              <p className="text-xs text-secondary mt-1 max-w-md mx-auto">
                Your resume bullet points and section phrasing have been optimized for ATS scanning.
              </p>
            </Card>
          ) : (
            report.issues.map((issue) => (
              <Card key={issue.id} className="p-6 border-indigo-500/20 bg-card/90 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge tone="warning" className="text-[10px] uppercase font-bold">
                        {issue.issueType.replace("_", " ")}
                      </Badge>
                      <span className="text-xs font-semibold text-indigo-400">{issue.section}</span>
                    </div>
                    <p className="text-xs text-secondary mt-1">{issue.explanation}</p>
                  </div>
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => handleFixWithAI(issue)}
                    className="shrink-0 flex items-center gap-1.5"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Fix with AI
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-3 border-t border-border/60">
                  <div className="p-3 rounded-xl bg-surface/80 border border-border/80">
                    <span className="text-[10px] font-semibold text-rose-400 block mb-1 uppercase tracking-wider">
                      Current Phrasing
                    </span>
                    <p className="text-primary font-mono text-[11px] leading-relaxed">{issue.originalText}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                    <span className="text-[10px] font-semibold text-emerald-400 block mb-1 uppercase tracking-wider flex items-center gap-1">
                      AI Suggested Enhancement <ArrowRight className="w-3 h-3" />
                    </span>
                    <p className="text-primary font-mono text-[11px] leading-relaxed font-semibold">
                      {issue.suggestedText}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Missing Keywords Inspector */}
      {activeTab === "keywords" && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4 border-border/80 bg-card/80">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-400" /> Missing Target Role Keywords
                </h4>
                <p className="text-xs text-secondary mt-0.5">
                  Click any missing keyword to automatically append it into your resume technical skills block.
                </p>
              </div>
              <Badge tone="warning">{report.missingKeywords.length} Remaining</Badge>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {report.missingKeywords.length === 0 ? (
                <p className="text-xs text-emerald-400 font-semibold">
                  All critical job description keywords are present in your resume!
                </p>
              ) : (
                report.missingKeywords.map((kw) => (
                  <button
                    key={kw}
                    onClick={() => handleAddKeyword(kw)}
                    className="px-3 py-1.5 rounded-xl bg-surface border border-amber-500/30 text-amber-300 hover:border-amber-400 hover:bg-amber-500/10 text-xs font-semibold transition-all flex items-center gap-1.5 group"
                  >
                    + {kw}
                    <span className="text-[10px] opacity-70 group-hover:opacity-100">(Add)</span>
                  </button>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6 space-y-4 border-border/80 bg-card/80">
            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Matched Keywords ({report.presentKeywords.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {report.presentKeywords.map((kw) => (
                <span
                  key={kw}
                  className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> {kw}
                </span>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: Section Analysis */}
      {activeTab === "sections" && (
        <div className="space-y-4">
          {report.sectionAnalyses.map((sec, idx) => (
            <Card key={idx} className="p-6 border-border/80 bg-card/80 space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" /> {sec.sectionName}
                </h4>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-indigo-400">Score: {sec.score}%</span>
                  <Badge tone="success" className="capitalize">
                    {sec.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <span className="font-semibold text-primary block">Positive Highlights:</span>
                  <ul className="space-y-1 text-secondary">
                    {sec.feedback.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <span className="font-semibold text-primary block">AI Recommendation:</span>
                  <ul className="space-y-1 text-secondary">
                    {sec.recommendations.map((r, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Wand2 className="w-3.5 h-3.5 text-amber-400 shrink-0" /> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
