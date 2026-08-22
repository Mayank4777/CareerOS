import type { ResumeEditorSectionDefinition, ResumeEditorSectionType } from "@/features/resumes/types/resume-editor";

export const RESUME_EDITOR_SECTIONS: ResumeEditorSectionDefinition[] = [
  { type: "personal_information", label: "Personal Information", description: "Profile details shown at the top of the resume." },
  { type: "education", label: "Education", description: "School and degree history." },
  { type: "experience", label: "Experience", description: "Work history and career timeline." },
  { type: "skills", label: "Skills", description: "Technical and professional strengths." },
  { type: "projects", label: "Projects", description: "Selected portfolio and product work." },
  { type: "certifications", label: "Certifications", description: "Verified credentials." },
  { type: "languages", label: "Languages", description: "Language fluency and proficiency." },
  { type: "achievements", label: "Achievements", description: "Notable outcomes and accomplishments." },
  { type: "awards", label: "Awards", description: "Recognition and honors." },
  { type: "volunteer", label: "Volunteer", description: "Volunteer work and community impact." },
  { type: "publications", label: "Publications", description: "Published writing, research, and articles." },
  { type: "interests", label: "Interests", description: "Personal interests and focus areas." },
  { type: "references", label: "References", description: "Professional references." },
  { type: "custom_sections", label: "Custom Sections", description: "User-defined content blocks." },
];

export function getResumeEditorSectionDefinition(sectionType: ResumeEditorSectionType) {
  return RESUME_EDITOR_SECTIONS.find((section) => section.type === sectionType);
}

