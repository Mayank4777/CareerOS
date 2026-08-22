import type { Resume } from "@/features/resumes/types/resume";
import type {
  ResumeEditorSection,
  ResumeEditorSectionItem,
  ResumeEditorSectionType,
  ResumeEditorSourceRecord,
} from "@/features/resumes/types/resume-editor";

export interface ResumeTemplateProps {
  resume: Resume;
  sections: ResumeEditorSection[];
  allSectionItems: Record<string, ResumeEditorSectionItem[]>;
  allSourceRecords: Record<ResumeEditorSectionType, ResumeEditorSourceRecord[]>;
}

export interface NormalizedPersonalInfo {
  full_name?: string;
  headline?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

export interface NormalizedResumeData {
  personal_info: NormalizedPersonalInfo;
  summary?: string;
  target_role?: string;
  job_description?: string;
  sections: Array<{
    key: string;
    title: string;
    visible?: boolean;
    items?: any[];
  }>;
  missing_info?: Array<{ message: string }>;
}

export function getSectionRecords(
  section: ResumeEditorSection,
  allSectionItems: Record<string, ResumeEditorSectionItem[]>,
  allSourceRecords: Record<ResumeEditorSectionType, ResumeEditorSourceRecord[]>
): ResumeEditorSourceRecord[] {
  const items = allSectionItems[section.id] ?? [];
  const records = allSourceRecords[section.section_type] ?? [];
  const itemMap = new Map(items.map((item) => [item.source_object_id, item]));

  const linked = records
    .filter((record) => itemMap.has(record.id))
    .slice()
    .sort((left, right) => (itemMap.get(left.id)?.display_order ?? 0) - (itemMap.get(right.id)?.display_order ?? 0));

  return linked.length > 0 ? linked : records;
}

export function getNormalizedResumeData({
  resume,
  sections,
  allSectionItems,
  allSourceRecords,
}: ResumeTemplateProps): NormalizedResumeData {
  if (resume.content_data && resume.content_data.personal_info) {
    return resume.content_data as NormalizedResumeData;
  }

  // Fallback auto-builder: Automatically construct normalized resume data from source records
  const personalSection = sections.find((s) => s.section_type === "personal_information");
  const personalRecords = personalSection ? getSectionRecords(personalSection, allSectionItems, allSourceRecords) : [];
  const pRecord = personalRecords[0] || (allSourceRecords["personal_information"] ?? [])[0];

  const metaList = pRecord?.meta || [];

  const personal_info: NormalizedPersonalInfo = {
    full_name: pRecord?.title || resume.title || "Career Profile Resume",
    headline: pRecord?.subtitle || "Professional Candidate",
    email: metaList[0] || "",
    phone: metaList[1] || "",
    location: metaList[2] || "",
    website: metaList[3] || "",
    linkedin: metaList[4] || "",
    github: "",
  };

  const summary = pRecord?.description || "Results-driven professional with a proven track record of performance and technical excellence.";

  const expRecords = allSourceRecords["experience"] ?? [];
  const expItems = expRecords.map((r) => ({
    id: r.id,
    title: r.title,
    company: r.subtitle || "Company",
    location: "",
    start_date: (r.meta && r.meta[0]) || "",
    end_date: (r.meta && r.meta[1]) || "",
    description: r.description || "",
    bullets: (r.description || "").split("\n").filter((b) => b.trim().length > 0),
  }));

  const eduRecords = allSourceRecords["education"] ?? [];
  const eduItems = eduRecords.map((r) => ({
    id: r.id,
    institution: r.title,
    degree: r.subtitle || "",
    field_of_study: "",
    start_date: (r.meta && r.meta[0]) || "",
    end_date: (r.meta && r.meta[1]) || "",
    grade: "",
  }));

  const skillRecords = allSourceRecords["skills"] ?? [];
  const skillCategoryMap: Record<string, string[]> = {};
  
  const knownCategories: Record<string, string[]> = {
    "Languages": ["python", "javascript", "typescript", "html", "css", "html5", "css3", "sql", "c++", "c#", "java", "php", "go", "rust", "ruby"],
    "Frameworks & Libraries": ["flask", "django", "react", "next.js", "nextjs", "vue", "angular", "node.js", "express", "pandas", "numpy", "jinja2", "tailwind", "tailwindcss", "bootstrap", "redux"],
    "Databases & Storage": ["mysql", "postgresql", "pl/sql", "sqlite", "mongodb", "redis", "elasticsearch"],
    "Automation & Tools": ["n8n", "git", "github", "vs code", "vscode", "jupyter", "jupyter notebook", "postman", "docker", "kubernetes", "webpack", "vite"],
    "Data & Analytics": ["power bi", "powerbi", "tableau", "excel", "data visualization"],
    "Platforms & OS": ["linux", "windows", "macos", "aws", "azure", "gcp"]
  };

  skillRecords.forEach((r) => {
    const name = r.title ? r.title.trim() : "";
    const nameLower = name.toLowerCase();
    let catKey = r.subtitle && !["technical skills", "skills", "general", "other", ""].includes(r.subtitle.toLowerCase())
      ? r.subtitle
      : "Core Technical Skills";

    if (catKey === "Core Technical Skills") {
      for (const [cat, keywords] of Object.entries(knownCategories)) {
        if (keywords.some((kw) => kw === nameLower || nameLower.includes(kw))) {
          catKey = cat;
          break;
        }
      }
    }

    if (!skillCategoryMap[catKey]) skillCategoryMap[catKey] = [];
    const skillsList = r.meta && r.meta.length > 0 ? r.meta : [name];
    skillsList.forEach((sk) => {
      if (!skillCategoryMap[catKey].includes(sk)) skillCategoryMap[catKey].push(sk);
    });
  });

  const skillItems = Object.entries(skillCategoryMap).map(([category, skills]) => ({
    category,
    skills,
  }));

  const projRecords = allSourceRecords["projects"] ?? [];
  const projItems = projRecords.map((r) => ({
    id: r.id,
    title: r.title,
    role: r.subtitle || "",
    description: r.description || "",
    technologies: (r.meta && r.meta[0]) || "",
    url: "",
  }));

  const certRecords = allSourceRecords["certifications"] ?? [];
  const certItems = certRecords.map((r) => ({
    id: r.id,
    name: r.title,
    organization: r.subtitle || "",
    issue_date: (r.meta && r.meta[0]) || "",
  }));

  const achRecords = allSourceRecords["achievements"] ?? [];
  const achItems = achRecords.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description || "",
  }));

  const normalizedSections = [];
  if (expItems.length > 0) normalizedSections.push({ key: "experience", title: "Work Experience", visible: true, items: expItems });
  if (eduItems.length > 0) normalizedSections.push({ key: "education", title: "Education", visible: true, items: eduItems });
  if (skillItems.length > 0) normalizedSections.push({ key: "skills", title: "Skills & Expertise", visible: true, items: skillItems });
  if (projItems.length > 0) normalizedSections.push({ key: "projects", title: "Key Projects", visible: true, items: projItems });
  if (certItems.length > 0) normalizedSections.push({ key: "certifications", title: "Certifications", visible: true, items: certItems });
  if (achItems.length > 0) normalizedSections.push({ key: "achievements", title: "Achievements", visible: true, items: achItems });

  return {
    personal_info,
    summary,
    target_role: "Target Role",
    job_description: "",
    sections: normalizedSections,
    missing_info: [],
  };
}
