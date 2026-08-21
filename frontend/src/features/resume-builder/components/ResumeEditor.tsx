import React, { useState } from "react";
import {
  User,
  FileText,
  Briefcase,
  FolderGit2,
  Code2,
  GraduationCap,
  Award,
  Globe2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  ResumeBuilderData,
  SectionImprovement,
  SkillItem,
} from "../types/resume-builder";
import { ImprovementAlert } from "./ImprovementAlert";
import { ImprovementPopover } from "./ImprovementPopover";
import { SkillRelevancePanel } from "./SkillRelevancePanel";

interface ResumeEditorProps {
  data: ResumeBuilderData;
  improvements: SectionImprovement[];
  onUpdatePersonal: (fields: Partial<ResumeBuilderData["personal"]>) => void;
  onUpdateSummary: (summary: string) => void;
  onUpdateExperience: (exp: ExperienceEntry[]) => void;
  onUpdateProjects: (projects: ProjectEntry[]) => void;
  onUpdateSkills: (skills: SkillItem[]) => void;
  onUpdateEducation: (edu: EducationEntry[]) => void;
  onApplySkillOrdering: () => void;
  onImproveSectionWithAI: (sectionKey: string) => void;
  isGeneratingAI?: boolean;
}

export function ResumeEditor({
  data,
  improvements,
  onUpdatePersonal,
  onUpdateSummary,
  onUpdateExperience,
  onUpdateProjects,
  onUpdateSkills,
  onUpdateEducation,
  onApplySkillOrdering,
  onImproveSectionWithAI,
  isGeneratingAI = false,
}: ResumeEditorProps) {
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [showSkillRelevance, setShowSkillRelevance] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    summary: true,
    experience: true,
    skills: true,
    projects: true,
    education: true,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getImprovement = (key: string): SectionImprovement => {
    return (
      improvements.find((imp) => imp.sectionKey === key) || {
        sectionKey: key,
        title: key,
        level: "GREEN",
        issues: [],
      }
    );
  };

  // Experience Mutators
  const handleAddExperience = () => {
    const newExp: ExperienceEntry = {
      id: `exp-${Date.now()}`,
      title: "Software Engineer",
      company: "Company Name",
      location: "City, Country",
      startDate: "2024",
      endDate: "Present",
      current: true,
      description: "",
      bullets: ["Developed software features and backend API services."],
    };
    onUpdateExperience([...data.experience, newExp]);
  };

  const handleRemoveExperience = (id: string) => {
    onUpdateExperience(data.experience.filter((e) => e.id !== id));
  };

  const handleUpdateExperienceEntry = (id: string, fields: Partial<ExperienceEntry>) => {
    onUpdateExperience(
      data.experience.map((e) => (e.id === id ? { ...e, ...fields } : e))
    );
  };

  // Project Mutators
  const handleAddProject = () => {
    const newProj: ProjectEntry = {
      id: `proj-${Date.now()}`,
      title: "Project Title",
      organization: "Personal / Open Source",
      role: "Lead Developer",
      description: "Built a web application showcasing technical capabilities.",
      technologies: "React, TypeScript, Node.js",
      url: "",
      bullets: ["Designed and implemented full-stack feature architecture."],
    };
    onUpdateProjects([...data.projects, newProj]);
  };

  const handleRemoveProject = (id: string) => {
    onUpdateProjects(data.projects.filter((p) => p.id !== id));
  };

  const handleUpdateProjectEntry = (id: string, fields: Partial<ProjectEntry>) => {
    onUpdateProjects(
      data.projects.map((p) => (p.id === id ? { ...p, ...fields } : p))
    );
  };

  // Skill Mutators
  const [newSkillInput, setNewSkillInput] = useState("");
  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    const newSkill: SkillItem = {
      id: `skill-${Date.now()}`,
      name: newSkillInput.trim(),
      category: "Core Technical Skills",
    };
    onUpdateSkills([...data.skills, newSkill]);
    setNewSkillInput("");
  };

  const handleRemoveSkill = (id: string) => {
    onUpdateSkills(data.skills.filter((s) => s.id !== id));
  };

  // Education Mutators
  const handleAddEducation = () => {
    const newEdu: EducationEntry = {
      id: `edu-${Date.now()}`,
      institution: "University Name",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      startDate: "2020",
      endDate: "2024",
      grade: "",
    };
    onUpdateEducation([...data.education, newEdu]);
  };

  const handleRemoveEducation = (id: string) => {
    onUpdateEducation(data.education.filter((e) => e.id !== id));
  };

  const handleUpdateEducationEntry = (id: string, fields: Partial<EducationEntry>) => {
    onUpdateEducation(
      data.education.map((e) => (e.id === id ? { ...e, ...fields } : e))
    );
  };

  return (
    <div className="space-y-4 pb-12">
      {/* 1. PERSONAL INFORMATION */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all hover:border-border/80">
        <div className="relative flex items-center justify-between">
          <button
            type="button"
            onClick={() => toggleSection("personal")}
            className="flex items-center gap-2.5 text-left font-bold text-foreground focus:outline-none"
          >
            <User className="h-4 w-4 text-indigo-400" />
            <span>Personal Information</span>
            {expandedSections.personal ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          <div className="relative">
            <ImprovementAlert
              level={getImprovement("personal").level}
              issueCount={getImprovement("personal").issues.length}
              sectionTitle="Personal Information"
              onClick={() => setActivePopover(activePopover === "personal" ? null : "personal")}
              isOpen={activePopover === "personal"}
            />
            {activePopover === "personal" && (
              <ImprovementPopover
                improvement={getImprovement("personal")}
                onClose={() => setActivePopover(null)}
                onImproveWithAI={() => {
                  onImproveSectionWithAI("personal");
                  setActivePopover(null);
                }}
                isGeneratingAI={isGeneratingAI}
              />
            )}
          </div>
        </div>

        {expandedSections.personal && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
              <Input
                value={data.personal.fullName}
                onChange={(e) => onUpdatePersonal({ fullName: e.target.value })}
                placeholder="John Doe"
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Professional Headline</label>
              <Input
                value={data.personal.headline}
                onChange={(e) => onUpdatePersonal({ headline: e.target.value })}
                placeholder="Senior Frontend Developer"
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
              <Input
                value={data.personal.email}
                onChange={(e) => onUpdatePersonal({ email: e.target.value })}
                placeholder="john@example.com"
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
              <Input
                value={data.personal.phone}
                onChange={(e) => onUpdatePersonal({ phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Location</label>
              <Input
                value={data.personal.location}
                onChange={(e) => onUpdatePersonal({ location: e.target.value })}
                placeholder="San Francisco, CA"
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">LinkedIn URL</label>
              <Input
                value={data.personal.linkedin}
                onChange={(e) => onUpdatePersonal({ linkedin: e.target.value })}
                placeholder="linkedin.com/in/username"
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">GitHub URL</label>
              <Input
                value={data.personal.github}
                onChange={(e) => onUpdatePersonal({ github: e.target.value })}
                placeholder="github.com/username"
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Portfolio Website</label>
              <Input
                value={data.personal.website}
                onChange={(e) => onUpdatePersonal({ website: e.target.value })}
                placeholder="https://myportfolio.com"
                className="mt-1 h-9 text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. PROFESSIONAL SUMMARY */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all hover:border-border/80">
        <div className="relative flex items-center justify-between">
          <button
            type="button"
            onClick={() => toggleSection("summary")}
            className="flex items-center gap-2.5 text-left font-bold text-foreground focus:outline-none"
          >
            <FileText className="h-4 w-4 text-purple-400" />
            <span>Professional Summary</span>
            {expandedSections.summary ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          <div className="relative">
            <ImprovementAlert
              level={getImprovement("summary").level}
              issueCount={getImprovement("summary").issues.length}
              sectionTitle="Professional Summary"
              onClick={() => setActivePopover(activePopover === "summary" ? null : "summary")}
              isOpen={activePopover === "summary"}
            />
            {activePopover === "summary" && (
              <ImprovementPopover
                improvement={getImprovement("summary")}
                onClose={() => setActivePopover(null)}
                onImproveWithAI={() => {
                  onImproveSectionWithAI("summary");
                  setActivePopover(null);
                }}
                isGeneratingAI={isGeneratingAI}
              />
            )}
          </div>
        </div>

        {expandedSections.summary && (
          <div className="mt-4 space-y-2">
            <Textarea
              value={data.summary}
              onChange={(e) => onUpdateSummary(e.target.value)}
              placeholder="A high-impact professional summary highlighting technical skills, key accomplishments, and target role focus..."
              rows={4}
              className="text-xs leading-relaxed"
            />
            <div className="flex items-center justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onImproveSectionWithAI("summary")}
                disabled={isGeneratingAI}
                className="h-7 text-xs font-semibold text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
              >
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                Improve Summary with AI
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 3. WORK EXPERIENCE */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all hover:border-border/80">
        <div className="relative flex items-center justify-between">
          <button
            type="button"
            onClick={() => toggleSection("experience")}
            className="flex items-center gap-2.5 text-left font-bold text-foreground focus:outline-none"
          >
            <Briefcase className="h-4 w-4 text-emerald-400" />
            <span>Work Experience ({data.experience.length})</span>
            {expandedSections.experience ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          <div className="relative">
            <ImprovementAlert
              level={getImprovement("experience").level}
              issueCount={getImprovement("experience").issues.length}
              sectionTitle="Work Experience"
              onClick={() => setActivePopover(activePopover === "experience" ? null : "experience")}
              isOpen={activePopover === "experience"}
            />
            {activePopover === "experience" && (
              <ImprovementPopover
                improvement={getImprovement("experience")}
                onClose={() => setActivePopover(null)}
                onImproveWithAI={() => {
                  onImproveSectionWithAI("experience");
                  setActivePopover(null);
                }}
                isGeneratingAI={isGeneratingAI}
              />
            )}
          </div>
        </div>

        {expandedSections.experience && (
          <div className="mt-4 space-y-4">
            {data.experience.map((exp, index) => (
              <div key={exp.id} className="rounded-xl border border-border/80 bg-surface-elevated p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400">Entry #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(exp.id)}
                    className="text-muted-foreground hover:text-rose-400 p-1"
                    title="Remove experience"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground">Job Title</label>
                    <Input
                      value={exp.title}
                      onChange={(e) => handleUpdateExperienceEntry(exp.id, { title: e.target.value })}
                      placeholder="Senior Frontend Developer"
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground">Company</label>
                    <Input
                      value={exp.company}
                      onChange={(e) => handleUpdateExperienceEntry(exp.id, { company: e.target.value })}
                      placeholder="Acme Corp"
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground">Start Date</label>
                    <Input
                      value={exp.startDate}
                      onChange={(e) => handleUpdateExperienceEntry(exp.id, { startDate: e.target.value })}
                      placeholder="Jan 2022"
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground">End Date</label>
                    <Input
                      value={exp.endDate}
                      onChange={(e) => handleUpdateExperienceEntry(exp.id, { endDate: e.target.value })}
                      placeholder="Present"
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Key Accomplishments / Bullets</label>
                  <Textarea
                    value={exp.bullets.join("\n")}
                    onChange={(e) =>
                      handleUpdateExperienceEntry(exp.id, {
                        bullets: e.target.value.split("\n"),
                        description: e.target.value,
                      })
                    }
                    placeholder="Architected responsive React components using TypeScript and Tailwind..."
                    rows={3}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={handleAddExperience} className="w-full h-8 text-xs">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Experience Entry
            </Button>
          </div>
        )}
      </div>

      {/* 4. TECHNICAL SKILLS */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all hover:border-border/80">
        <div className="relative flex items-center justify-between">
          <button
            type="button"
            onClick={() => toggleSection("skills")}
            className="flex items-center gap-2.5 text-left font-bold text-foreground focus:outline-none"
          >
            <Code2 className="h-4 w-4 text-blue-400" />
            <span>Technical Skills ({data.skills.length})</span>
            {expandedSections.skills ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          <div className="relative">
            <ImprovementAlert
              level={getImprovement("skills").level}
              issueCount={getImprovement("skills").issues.length}
              sectionTitle="Skills & Expertise"
              onClick={() => setActivePopover(activePopover === "skills" ? null : "skills")}
              isOpen={activePopover === "skills"}
            />
            {activePopover === "skills" && (
              <ImprovementPopover
                improvement={getImprovement("skills")}
                onClose={() => setActivePopover(null)}
                onImproveWithAI={() => {
                  setShowSkillRelevance(true);
                  setActivePopover(null);
                }}
                isGeneratingAI={isGeneratingAI}
              />
            )}
          </div>
        </div>

        {expandedSections.skills && (
          <div className="mt-4 space-y-3">
            {showSkillRelevance && (
              <SkillRelevancePanel
                skills={data.skills}
                targetRole={data.targetRole}
                onApplyOrdering={onApplySkillOrdering}
                onClose={() => setShowSkillRelevance(false)}
              />
            )}

            <div className="flex items-center gap-2">
              <Input
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                placeholder="Add skill (e.g. React, TypeScript)..."
                className="h-8 text-xs"
              />
              <Button type="button" size="sm" onClick={handleAddSkill} className="h-8 text-xs font-semibold">
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSkillRelevance(!showSkillRelevance)}
                className="h-8 text-xs text-indigo-400"
              >
                Relevance
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {data.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-surface-elevated px-3 py-1 text-xs font-semibold text-foreground border border-border group hover:border-indigo-500/50"
                >
                  <span>{skill.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill.id)}
                    className="text-muted-foreground hover:text-rose-400 focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. PROJECTS */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all hover:border-border/80">
        <div className="relative flex items-center justify-between">
          <button
            type="button"
            onClick={() => toggleSection("projects")}
            className="flex items-center gap-2.5 text-left font-bold text-foreground focus:outline-none"
          >
            <FolderGit2 className="h-4 w-4 text-amber-400" />
            <span>Projects ({data.projects.length})</span>
            {expandedSections.projects ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          <div className="relative">
            <ImprovementAlert
              level={getImprovement("projects").level}
              issueCount={getImprovement("projects").issues.length}
              sectionTitle="Projects"
              onClick={() => setActivePopover(activePopover === "projects" ? null : "projects")}
              isOpen={activePopover === "projects"}
            />
            {activePopover === "projects" && (
              <ImprovementPopover
                improvement={getImprovement("projects")}
                onClose={() => setActivePopover(null)}
                onImproveWithAI={() => {
                  onImproveSectionWithAI("projects");
                  setActivePopover(null);
                }}
                isGeneratingAI={isGeneratingAI}
              />
            )}
          </div>
        </div>

        {expandedSections.projects && (
          <div className="mt-4 space-y-4">
            {data.projects.length === 0 && (
              <p className="text-xs text-amber-400/90 italic bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                Projects are missing — adding 1–2 relevant projects would strengthen this resume.
              </p>
            )}

            {data.projects.map((proj, index) => (
              <div key={proj.id} className="rounded-xl border border-border/80 bg-surface-elevated p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">Project #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(proj.id)}
                    className="text-muted-foreground hover:text-rose-400 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground">Project Title</label>
                    <Input
                      value={proj.title}
                      onChange={(e) => handleUpdateProjectEntry(proj.id, { title: e.target.value })}
                      placeholder="CareerOS Resume Builder"
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground">Technologies Used</label>
                    <Input
                      value={proj.technologies}
                      onChange={(e) => handleUpdateProjectEntry(proj.id, { technologies: e.target.value })}
                      placeholder="React, TypeScript, Tailwind, Django"
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Description</label>
                  <Textarea
                    value={proj.description}
                    onChange={(e) => handleUpdateProjectEntry(proj.id, { description: e.target.value })}
                    placeholder="Built a real-time interactive resume builder featuring AI quality analysis..."
                    rows={2}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={handleAddProject} className="w-full h-8 text-xs">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Project Entry
            </Button>
          </div>
        )}
      </div>

      {/* 6. EDUCATION */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all hover:border-border/80">
        <div className="relative flex items-center justify-between">
          <button
            type="button"
            onClick={() => toggleSection("education")}
            className="flex items-center gap-2.5 text-left font-bold text-foreground focus:outline-none"
          >
            <GraduationCap className="h-4 w-4 text-cyan-400" />
            <span>Education ({data.education.length})</span>
            {expandedSections.education ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          <div className="relative">
            <ImprovementAlert
              level={getImprovement("education").level}
              issueCount={getImprovement("education").issues.length}
              sectionTitle="Education"
              onClick={() => setActivePopover(activePopover === "education" ? null : "education")}
              isOpen={activePopover === "education"}
            />
            {activePopover === "education" && (
              <ImprovementPopover
                improvement={getImprovement("education")}
                onClose={() => setActivePopover(null)}
                onImproveWithAI={() => {
                  onImproveSectionWithAI("education");
                  setActivePopover(null);
                }}
                isGeneratingAI={isGeneratingAI}
              />
            )}
          </div>
        </div>

        {expandedSections.education && (
          <div className="mt-4 space-y-4">
            {data.education.map((edu, index) => (
              <div key={edu.id} className="rounded-xl border border-border/80 bg-surface-elevated p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400">Education #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(edu.id)}
                    className="text-muted-foreground hover:text-rose-400 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground">Institution</label>
                    <Input
                      value={edu.institution}
                      onChange={(e) => handleUpdateEducationEntry(edu.id, { institution: e.target.value })}
                      placeholder="University Name"
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground">Degree / Field of Study</label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => handleUpdateEducationEntry(edu.id, { degree: e.target.value })}
                      placeholder="B.S. Computer Science"
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground">Start Date</label>
                    <Input
                      value={edu.startDate}
                      onChange={(e) => handleUpdateEducationEntry(edu.id, { startDate: e.target.value })}
                      placeholder="2020"
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground">End Date</label>
                    <Input
                      value={edu.endDate}
                      onChange={(e) => handleUpdateEducationEntry(edu.id, { endDate: e.target.value })}
                      placeholder="2024"
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={handleAddEducation} className="w-full h-8 text-xs">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Education Entry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
