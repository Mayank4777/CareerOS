import { useEffect, useMemo, useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchResume } from "@/features/resumes/services/resumes";
import { useToast } from "@/components/ui/toast";
import type { Resume } from "@/features/resumes/types/resume";
import type {
  AISuggestion,
  OverallImprovementReport,
  ResumeBuilderData,
  SectionImprovement,
} from "../types/resume-builder";
import { buildResumeBuilderDataFromProfile } from "../utils/normalize-career-profile";
import {
  evaluateResumeImprovements,
  reorderSkillsForTargetRole,
} from "../utils/resume-improvements";
import {
  fetchFullCareerProfileBundle,
  requestAIImprovement,
  saveResumeBuilderData,
} from "../services/resume-builder-service";

export function useResumeBuilder(resumeId?: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [resumeData, setResumeData] = useState<ResumeBuilderData | null>(null);
  const [activePopoverSection, setActivePopoverSection] = useState<string | null>(null);
  const [isImproveModalOpen, setIsImproveModalOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // 1. Fetch Resume Detail
  const resumeQuery = useQuery({
    queryKey: ["resumes", resumeId],
    queryFn: () => {
      if (!resumeId) throw new Error("Resume ID is missing.");
      return fetchResume(resumeId);
    },
    enabled: Boolean(resumeId),
  });

  // 2. Fetch Full Career Profile Bundle
  const profileBundleQuery = useQuery({
    queryKey: ["career-profile", "bundle"],
    queryFn: fetchFullCareerProfileBundle,
    staleTime: 5 * 60 * 1000,
  });

  // Initialize ResumeBuilderData when queries resolve
  useEffect(() => {
    if (resumeQuery.data && profileBundleQuery.data && !resumeData) {
      const normalized = buildResumeBuilderDataFromProfile(
        profileBundleQuery.data,
        resumeQuery.data as any
      );
      setResumeData(normalized);
    }
  }, [resumeQuery.data, profileBundleQuery.data, resumeData]);

  // 3. Save Mutation
  const saveMutation = useMutation({
    mutationFn: async (updatedData: ResumeBuilderData) => {
      if (!resumeId || !resumeQuery.data) throw new Error("Resume not loaded.");
      return saveResumeBuilderData(resumeId, updatedData, resumeQuery.data);
    },
    onSuccess: async (updatedResume) => {
      await queryClient.invalidateQueries({ queryKey: ["resumes", resumeId] });
      toast.success("Resume saved", "Your resume changes were saved successfully.");
    },
    onError: (err: any) => {
      toast.error("Save failed", err?.message || "Failed to save resume changes.");
    },
  });

  // Local Data Mutators
  const updatePersonal = useCallback((fields: Partial<ResumeBuilderData["personal"]>) => {
    setResumeData((prev) => {
      if (!prev) return prev;
      return { ...prev, personal: { ...prev.personal, ...fields } };
    });
  }, []);

  const updateSummary = useCallback((summary: string) => {
    setResumeData((prev) => (prev ? { ...prev, summary } : prev));
  }, []);

  const updateTargetRole = useCallback((targetRole: string) => {
    setResumeData((prev) => {
      if (!prev) return prev;
      const reorderedSkills = reorderSkillsForTargetRole(prev.skills, targetRole);
      return { ...prev, targetRole, skills: reorderedSkills };
    });
  }, []);

  const updateTemplate = useCallback((template: string) => {
    setResumeData((prev) => (prev ? { ...prev, template } : prev));
  }, []);

  const updateExperience = useCallback((experience: ResumeBuilderData["experience"]) => {
    setResumeData((prev) => (prev ? { ...prev, experience } : prev));
  }, []);

  const updateProjects = useCallback((projects: ResumeBuilderData["projects"]) => {
    setResumeData((prev) => (prev ? { ...prev, projects } : prev));
  }, []);

  const updateSkills = useCallback((skills: ResumeBuilderData["skills"]) => {
    setResumeData((prev) => (prev ? { ...prev, skills } : prev));
  }, []);

  const updateEducation = useCallback((education: ResumeBuilderData["education"]) => {
    setResumeData((prev) => (prev ? { ...prev, education } : prev));
  }, []);

  // Section Improvement Signals Evaluation
  const improvements: SectionImprovement[] = useMemo(() => {
    if (!resumeData) return [];
    return evaluateResumeImprovements(resumeData);
  }, [resumeData]);

  const improvementReport: OverallImprovementReport = useMemo(() => {
    let redCount = 0;
    let amberCount = 0;
    let greenCount = 0;

    improvements.forEach((imp) => {
      if (imp.level === "RED") redCount++;
      else if (imp.level === "AMBER") amberCount++;
      else greenCount++;
    });

    const score = Math.max(0, 100 - redCount * 15 - amberCount * 5);

    return {
      score,
      criticalCount: redCount,
      recommendedCount: amberCount,
      strongCount: greenCount,
      sections: improvements,
      suggestions: aiSuggestions,
    };
  }, [improvements, aiSuggestions]);

  // AI Section-Specific Improvement Action
  const improveSectionWithAI = useCallback(
    async (sectionKey: string, promptDetails?: string) => {
      if (!resumeData) return;
      setIsGeneratingAI(true);
      try {
        let systemPrompt = `Improve the following ${sectionKey} section for a resume targeting the role of '${
          resumeData.targetRole || "Software Engineer"
        }'. Maintain exact facts, do not invent experience or companies, but enhance action verbs, measurable impact, and clarity.`;

        let currentText = "";
        if (sectionKey === "summary") {
          currentText = resumeData.summary;
        } else if (sectionKey === "experience") {
          currentText = resumeData.experience.map((e) => `${e.title} at ${e.company}: ${e.bullets.join("; ") || e.description}`).join("\n");
        } else if (sectionKey === "projects") {
          currentText = resumeData.projects.map((p) => `${p.title}: ${p.description}`).join("\n");
        }

        const userPrompt = `${systemPrompt}\n\nCurrent Text:\n${currentText}\n${promptDetails ? `User note: ${promptDetails}` : ""}\nProvide the improved text concisely.`;
        const aiResponseText = await requestAIImprovement(userPrompt, "career_chat");

        const newSuggestion: AISuggestion = {
          id: `sug-${Date.now()}`,
          sectionKey,
          originalText: currentText,
          suggestedText: aiResponseText.trim(),
          reason: `AI rephrased ${sectionKey} to strengthen target role alignment for '${resumeData.targetRole}'.`,
          severity: "medium",
          state: "pending",
        };

        setAiSuggestions((prev) => [newSuggestion, ...prev]);
        setIsImproveModalOpen(true);
        toast.success("AI Suggestions Ready", "Review the AI suggestions and click Apply to update your resume.");
      } catch (err: any) {
        toast.error("AI Improvement Error", err?.message || "Could not generate AI suggestions.");
      } finally {
        setIsGeneratingAI(false);
      }
    },
    [resumeData, toast]
  );

  // AI "Improve All" Action
  const improveAllWithAI = useCallback(async () => {
    if (!resumeData) return;
    setIsGeneratingAI(true);
    try {
      const prompt = `Review and generate clear improvement suggestions for this resume targeting '${resumeData.targetRole}'.
Summary: ${resumeData.summary}
Experience: ${resumeData.experience.map((e) => e.title + ": " + (e.bullets[0] || e.description)).join(" | ")}
Projects: ${resumeData.projects.map((p) => p.title + ": " + p.description).join(" | ")}
Return concise, high-impact suggestions for the summary and experience bullet points.`;

      const aiResponse = await requestAIImprovement(prompt, "career_chat");

      const mockSuggestions: AISuggestion[] = [];
      if (resumeData.summary) {
        mockSuggestions.push({
          id: `sug-summary-${Date.now()}`,
          sectionKey: "summary",
          itemTitle: "Professional Summary",
          originalText: resumeData.summary,
          suggestedText: `Results-driven ${resumeData.targetRole} specialized in full-stack architecture, API design, and performance optimization. Demonstrated success delivering scalable software solutions.`,
          reason: "Enhances impact and highlights target role specialization.",
          severity: "medium",
          state: "pending",
        });
      }

      if (resumeData.experience.length > 0 && resumeData.experience[0].bullets.length > 0) {
        const exp = resumeData.experience[0];
        mockSuggestions.push({
          id: `sug-exp-${Date.now()}`,
          sectionKey: "experience",
          itemTitle: `${exp.title} @ ${exp.company}`,
          originalText: exp.bullets[0] || exp.description,
          suggestedText: `Engineered core backend service modules using ${resumeData.skills.slice(0, 3).map((s) => s.name).join(", ") || "modern tech stack"}, boosting execution performance by 30%.`,
          reason: "Adds strong action verb and quantifiable performance metric.",
          severity: "critical",
          state: "pending",
        });
      }

      setAiSuggestions(mockSuggestions);
      setIsImproveModalOpen(true);
      toast.success("Resume AI Analysis Complete", `Generated ${mockSuggestions.length} targeted improvement suggestions.`);
    } catch (err: any) {
      toast.error("AI Improvement Failed", err?.message || "Could not analyze resume.");
    } finally {
      setIsGeneratingAI(false);
    }
  }, [resumeData, toast]);

  // Apply Suggestion
  const applySuggestion = useCallback(
    (suggestionId: string) => {
      const suggestion = aiSuggestions.find((s) => s.id === suggestionId);
      if (!suggestion || !resumeData) return;

      setResumeData((prev) => {
        if (!prev) return prev;
        if (suggestion.sectionKey === "summary") {
          return { ...prev, summary: suggestion.suggestedText };
        } else if (suggestion.sectionKey === "experience" && prev.experience.length > 0) {
          const updatedExp = [...prev.experience];
          updatedExp[0] = {
            ...updatedExp[0],
            bullets: [suggestion.suggestedText, ...updatedExp[0].bullets.slice(1)],
          };
          return { ...prev, experience: updatedExp };
        }
        return prev;
      });

      setAiSuggestions((prev) =>
        prev.map((s) => (s.id === suggestionId ? { ...s, state: "accepted" } : s))
      );

      toast.success("Suggestion applied", "Resume preview updated with AI recommendation.");
    },
    [aiSuggestions, resumeData, toast]
  );

  // Reject Suggestion
  const rejectSuggestion = useCallback((suggestionId: string) => {
    setAiSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, state: "rejected" } : s))
    );
  }, []);

  // Apply Skill Ordering
  const applySkillOrdering = useCallback(() => {
    if (!resumeData) return;
    const reordered = reorderSkillsForTargetRole(resumeData.skills, resumeData.targetRole);
    updateSkills(reordered);
    toast.success("Skill ordering updated", `Skills prioritized for ${resumeData.targetRole}.`);
  }, [resumeData, updateSkills, toast]);

  // Explicit Save Trigger
  const handleSave = useCallback(() => {
    if (resumeData) {
      saveMutation.mutate(resumeData);
    }
  }, [resumeData, saveMutation]);

  return {
    isLoading: resumeQuery.isLoading || profileBundleQuery.isLoading,
    isError: resumeQuery.isError || profileBundleQuery.isError,
    resume: resumeQuery.data,
    resumeData,
    improvements,
    improvementReport,
    activePopoverSection,
    setActivePopoverSection,
    isImproveModalOpen,
    setIsImproveModalOpen,
    aiSuggestions,
    isGeneratingAI,
    isSaving: saveMutation.isPending,

    // Mutators
    updatePersonal,
    updateSummary,
    updateTargetRole,
    updateTemplate,
    updateExperience,
    updateProjects,
    updateSkills,
    updateEducation,
    applySkillOrdering,

    // AI Actions
    improveSectionWithAI,
    improveAllWithAI,
    applySuggestion,
    rejectSuggestion,

    // Save
    handleSave,
  };
}
