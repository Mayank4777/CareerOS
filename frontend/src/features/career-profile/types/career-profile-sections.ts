import { z } from "zod";

import { APP_ROUTES } from "@/constants/routes";
import type { SectionModuleConfig, SectionValidationRule } from "@/features/career-profile/types/section";

function textField(name: string, label: string, options: Partial<SectionModuleConfig["fields"][number]> = {}) {
  return { name, label, kind: "text" as const, ...options };
}

function comboboxField(name: string, label: string, options: Partial<SectionModuleConfig["fields"][number]> = {}) {
  return { name, label, kind: "combobox" as const, ...options };
}

function choiceOptions(items: Array<[string, string]>) {
  return items.map(([label, value]) => ({ label, value }));
}

function textareaField(name: string, label: string, options: Partial<SectionModuleConfig["fields"][number]> = {}) {
  return { name, label, kind: "textarea" as const, rows: 4, ...options };
}

function dateField(name: string, label: string, options: Partial<SectionModuleConfig["fields"][number]> = {}) {
  return { name, label, kind: "date" as const, ...options };
}

function urlField(name: string, label: string, options: Partial<SectionModuleConfig["fields"][number]> = {}) {
  return { name, label, kind: "url" as const, ...options };
}

function emailField(name: string, label: string, options: Partial<SectionModuleConfig["fields"][number]> = {}) {
  return { name, label, kind: "email" as const, ...options };
}

function numberField(name: string, label: string, options: Partial<SectionModuleConfig["fields"][number]> = {}) {
  return { name, label, kind: "number" as const, ...options };
}

function checkboxField(name: string, label: string, options: Partial<SectionModuleConfig["fields"][number]> = {}) {
  return { name, label, kind: "checkbox" as const, ...options };
}

const experienceRules: SectionValidationRule[] = [
  {
    validate: (values, ctx) => {
      const currentlyWorking = Boolean(values.currently_working);
      const startDate = readString(values.start_date);
      const endDate = readString(values.end_date);

      if (currentlyWorking && endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_date"],
          message: "End date must be empty when currently working is enabled.",
        });
      }

      if (!currentlyWorking && !endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_date"],
          message: "End date is required when currently working is disabled.",
        });
      }

      if (startDate && endDate && startDate > endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_date"],
          message: "End date cannot be before the start date.",
        });
      }
    },
  },
];

const projectRules: SectionValidationRule[] = [
  {
    validate: (values, ctx) => {
      const currentlyActive = Boolean(values.currently_active);
      const startDate = readString(values.start_date);
      const endDate = readString(values.end_date);

      if (currentlyActive && endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_date"],
          message: "End date must be empty when currently active is enabled.",
        });
      }

      if (startDate && endDate && startDate > endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_date"],
          message: "End date cannot be before the start date.",
        });
      }
    },
  },
];

const certificationRules: SectionValidationRule[] = [
  {
    validate: (values, ctx) => {
      const doesNotExpire = Boolean(values.does_not_expire);
      const issueDate = readString(values.issue_date);
      const expiryDate = readString(values.expiry_date);

      if (doesNotExpire && expiryDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["expiry_date"],
          message: "Expiry date must be empty when does not expire is enabled.",
        });
      }

      if (!doesNotExpire && issueDate && expiryDate && issueDate > expiryDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["expiry_date"],
          message: "Expiry date cannot be before the issue date.",
        });
      }
    },
  },
];

const volunteerRules: SectionValidationRule[] = [
  {
    validate: (values, ctx) => {
      const currentlyVolunteering = Boolean(values.currently_volunteering);
      const startDate = readString(values.start_date);
      const endDate = readString(values.end_date);

      if (currentlyVolunteering && endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_date"],
          message: "End date must be empty when currently volunteering is enabled.",
        });
      }

      if (!currentlyVolunteering && startDate && endDate && startDate > endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_date"],
          message: "End date cannot be before the start date.",
        });
      }
    },
  },
];

export const experienceSectionConfig: SectionModuleConfig = {
  key: "experience",
  route: APP_ROUTES.careerProfileExperience,
  apiRoot: "/experience/",
  queryKey: ["career-profile", "experience"],
  title: "Experience",
  description: "List, create, edit, and delete work experience entries inside the Career Profile workspace.",
  singularLabel: "Experience",
  emptyStateTitle: "No experience records yet",
  emptyStateDescription: {
    withProfile: "Add your first experience entry to build a structured work history.",
    withoutProfile: "Create your career profile first, then add experience records.",
  },
  fields: [
    textField("designation", "Designation", { required: true, placeholder: "Product Designer" }),
    comboboxField("employment_type", "Employment Type", {
      required: true,
      placeholder: "Full-time",
      options: choiceOptions([
        ["Full-time", "full_time"],
        ["Part-time", "part_time"],
        ["Contract", "contract"],
        ["Freelance", "freelance"],
        ["Internship", "internship"],
        ["Temporary", "temporary"],
        ["Apprenticeship", "apprenticeship"],
      ]),
    }),
    textField("company", "Company", { required: true, placeholder: "CareerOS" }),
    textField("location", "Location", { required: true, placeholder: "Bengaluru, India" }),
    comboboxField("location_type", "Location Type", {
      required: true,
      placeholder: "Hybrid",
      options: choiceOptions([
        ["On-site", "onsite"],
        ["Remote", "remote"],
        ["Hybrid", "hybrid"],
      ]),
    }),
    dateField("start_date", "Start Date", { required: true }),
    dateField("end_date", "End Date", { required: false }),
    checkboxField("currently_working", "Currently Working"),
    textareaField("description", "Description", { required: true, placeholder: "Describe your impact and responsibilities." }),
  ],
  card: {
    titleField: "designation",
    subtitleField: "company",
    descriptionField: "description",
    metaFields: ["employment_type", "location", "location_type", "start_date", "end_date"],
    statusField: "currently_working",
    statusLabel: "Current",
  },
  validationRules: experienceRules,
  uniqueFields: ["designation", "company", "start_date"],
};

export const skillsSectionConfig: SectionModuleConfig = {
  key: "skills",
  route: APP_ROUTES.careerProfileSkills,
  apiRoot: "/skills/",
  queryKey: ["career-profile", "skills"],
  title: "Skills",
  description: "List, create, edit, and delete skill entries inside the Career Profile workspace.",
  singularLabel: "Skill",
  emptyStateTitle: "No skills yet",
  emptyStateDescription: {
    withProfile: "Add your first skill to make the profile more searchable.",
    withoutProfile: "Create your career profile first, then add skills.",
  },
  fields: [
    textField("name", "Name", { required: true, placeholder: "Design Systems" }),
    textField("category", "Category", { required: false, placeholder: "Design" }),
    comboboxField("proficiency_level", "Proficiency Level", {
      required: true,
      placeholder: "Advanced",
      options: choiceOptions([
        ["Beginner", "beginner"],
        ["Intermediate", "intermediate"],
        ["Advanced", "advanced"],
        ["Expert", "expert"],
      ]),
    }),
    numberField("years_of_experience", "Years of Experience", { required: false, placeholder: "5" }),
  ],
  card: {
    titleField: "name",
    subtitleField: "proficiency_level",
    metaFields: ["category", "years_of_experience"],
  },
  uniqueFields: ["name"],
};

export const projectsSectionConfig: SectionModuleConfig = {
  key: "projects",
  route: APP_ROUTES.careerProfileProjects,
  apiRoot: "/projects/",
  queryKey: ["career-profile", "projects"],
  title: "Projects",
  description: "List, create, edit, and delete project entries inside the Career Profile workspace.",
  singularLabel: "Project",
  emptyStateTitle: "No projects yet",
  emptyStateDescription: {
    withProfile: "Add your first project to show the work behind your skills.",
    withoutProfile: "Create your career profile first, then add projects.",
  },
  fields: [
    textField("title", "Title", { required: true, placeholder: "CareerOS Design System" }),
    textField("organization", "Organization", { required: false, placeholder: "CareerOS" }),
    textField("role", "Role", { required: false, placeholder: "Lead designer" }),
    textareaField("description", "Description", { required: true, placeholder: "Explain the project impact and scope." }),
    textField("technologies", "Technologies", { required: false, placeholder: "React, TypeScript, Tailwind" }),
    urlField("project_url", "Project URL", { required: false, placeholder: "https://example.com" }),
    urlField("github_url", "GitHub URL", { required: false, placeholder: "https://github.com/..." }),
    dateField("start_date", "Start Date", { required: false }),
    dateField("end_date", "End Date", { required: false }),
    checkboxField("currently_active", "Currently Active"),
  ],
  card: {
    titleField: "title",
    subtitleField: "organization",
    descriptionField: "description",
    metaFields: ["role", "technologies", "project_url", "github_url", "start_date", "end_date"],
    statusField: "currently_active",
    statusLabel: "Active",
  },
  validationRules: projectRules,
  uniqueFields: ["title"],
};

export const certificationsSectionConfig: SectionModuleConfig = {
  key: "certifications",
  route: APP_ROUTES.careerProfileCertifications,
  apiRoot: "/certifications/",
  queryKey: ["career-profile", "certifications"],
  title: "Certifications",
  description: "List, create, edit, and delete certification entries inside the Career Profile workspace.",
  singularLabel: "Certification",
  emptyStateTitle: "No certifications yet",
  emptyStateDescription: {
    withProfile: "Add your first certification to strengthen the profile.",
    withoutProfile: "Create your career profile first, then add certifications.",
  },
  fields: [
    textField("name", "Name", { required: true, placeholder: "AWS Certified Developer" }),
    textField("issuing_organization", "Issuing Organization", { required: true, placeholder: "Amazon Web Services" }),
    textField("credential_id", "Credential ID", { required: false, placeholder: "ABC-123" }),
    urlField("credential_url", "Credential URL", { required: false, placeholder: "https://example.com/verify" }),
    dateField("issue_date", "Issue Date", { required: true }),
    dateField("expiry_date", "Expiry Date", { required: false }),
    checkboxField("does_not_expire", "Does Not Expire"),
  ],
  card: {
    titleField: "name",
    subtitleField: "issuing_organization",
    metaFields: ["credential_id", "issue_date", "expiry_date"],
    statusField: "does_not_expire",
    statusLabel: "No Expiry",
  },
  validationRules: certificationRules,
  uniqueFields: ["name", "issuing_organization"],
};

export const languagesSectionConfig: SectionModuleConfig = {
  key: "languages",
  route: APP_ROUTES.careerProfileLanguages,
  apiRoot: "/languages/",
  queryKey: ["career-profile", "languages"],
  title: "Languages",
  description: "List, create, edit, and delete language entries inside the Career Profile workspace.",
  singularLabel: "Language",
  emptyStateTitle: "No languages yet",
  emptyStateDescription: {
    withProfile: "Add your first language so the profile covers more than one market.",
    withoutProfile: "Create your career profile first, then add languages.",
  },
  fields: [
    textField("language", "Language", { required: true, placeholder: "English" }),
    comboboxField("proficiency", "Proficiency", {
      required: true,
      placeholder: "Native",
      options: choiceOptions([
        ["Beginner", "beginner"],
        ["Intermediate", "intermediate"],
        ["Professional", "professional"],
        ["Native", "native"],
      ]),
    }),
  ],
  card: {
    titleField: "language",
    subtitleField: "proficiency",
  },
  uniqueFields: ["language"],
};

export const achievementsSectionConfig: SectionModuleConfig = {
  key: "achievements",
  route: APP_ROUTES.careerProfileAchievements,
  apiRoot: "/achievements/",
  queryKey: ["career-profile", "achievements"],
  title: "Achievements",
  description: "List, create, edit, and delete achievement entries inside the Career Profile workspace.",
  singularLabel: "Achievement",
  emptyStateTitle: "No achievements yet",
  emptyStateDescription: {
    withProfile: "Add your first achievement to highlight measurable wins.",
    withoutProfile: "Create your career profile first, then add achievements.",
  },
  fields: [
    textField("title", "Title", { required: true, placeholder: "Top performer award" }),
    textareaField("description", "Description", { required: true, placeholder: "Summarize the accomplishment and impact." }),
    dateField("achievement_date", "Achievement Date", { required: false }),
  ],
  card: {
    titleField: "title",
    descriptionField: "description",
    metaFields: ["achievement_date"],
  },
  uniqueFields: ["title"],
};

export const awardsSectionConfig: SectionModuleConfig = {
  key: "awards",
  route: APP_ROUTES.careerProfileAwards,
  apiRoot: "/awards/",
  queryKey: ["career-profile", "awards"],
  title: "Awards",
  description: "List, create, edit, and delete award entries inside the Career Profile workspace.",
  singularLabel: "Award",
  emptyStateTitle: "No awards yet",
  emptyStateDescription: {
    withProfile: "Add your first award to keep recognitions in one place.",
    withoutProfile: "Create your career profile first, then add awards.",
  },
  fields: [
    textField("title", "Title", { required: true, placeholder: "Employee of the Month" }),
    textField("issuer", "Issuer", { required: true, placeholder: "CareerOS" }),
    dateField("award_date", "Award Date", { required: true }),
    textareaField("description", "Description", { required: false, placeholder: "Optional details about the award." }),
  ],
  card: {
    titleField: "title",
    subtitleField: "issuer",
    descriptionField: "description",
    metaFields: ["award_date"],
  },
  uniqueFields: ["title", "issuer"],
};

export const volunteerSectionConfig: SectionModuleConfig = {
  key: "volunteer",
  route: APP_ROUTES.careerProfileVolunteer,
  apiRoot: "/volunteer-experience/",
  queryKey: ["career-profile", "volunteer"],
  title: "Volunteer",
  description: "List, create, edit, and delete volunteer entries inside the Career Profile workspace.",
  singularLabel: "Volunteer",
  emptyStateTitle: "No volunteer records yet",
  emptyStateDescription: {
    withProfile: "Add your first volunteer entry to show community involvement.",
    withoutProfile: "Create your career profile first, then add volunteer records.",
  },
  fields: [
    textField("organization", "Organization", { required: true, placeholder: "Local NGO" }),
    textField("role", "Role", { required: true, placeholder: "Mentor" }),
    textareaField("description", "Description", { required: true, placeholder: "Describe the work and contribution." }),
    dateField("start_date", "Start Date", { required: true }),
    dateField("end_date", "End Date", { required: false }),
    checkboxField("currently_volunteering", "Currently Volunteering"),
  ],
  card: {
    titleField: "organization",
    subtitleField: "role",
    descriptionField: "description",
    metaFields: ["start_date", "end_date"],
    statusField: "currently_volunteering",
    statusLabel: "Active",
  },
  validationRules: volunteerRules,
  uniqueFields: ["organization", "role", "start_date"],
};

export const publicationsSectionConfig: SectionModuleConfig = {
  key: "publications",
  route: APP_ROUTES.careerProfilePublications,
  apiRoot: "/publications/",
  queryKey: ["career-profile", "publications"],
  title: "Publications",
  description: "List, create, edit, and delete publication entries inside the Career Profile workspace.",
  singularLabel: "Publication",
  emptyStateTitle: "No publications yet",
  emptyStateDescription: {
    withProfile: "Add your first publication to show published work.",
    withoutProfile: "Create your career profile first, then add publications.",
  },
  fields: [
    textField("title", "Title", { required: true, placeholder: "Research Paper" }),
    textField("publisher", "Publisher", { required: true, placeholder: "Medium" }),
    dateField("publication_date", "Publication Date", { required: true }),
    urlField("publication_url", "Publication URL", { required: false, placeholder: "https://example.com/article" }),
    textareaField("description", "Description", { required: false, placeholder: "Optional summary of the publication." }),
  ],
  card: {
    titleField: "title",
    subtitleField: "publisher",
    descriptionField: "description",
    metaFields: ["publication_date", "publication_url"],
  },
  uniqueFields: ["title", "publisher"],
};

export const interestsSectionConfig: SectionModuleConfig = {
  key: "interests",
  route: APP_ROUTES.careerProfileInterests,
  apiRoot: "/interests/",
  queryKey: ["career-profile", "interests"],
  title: "Interests",
  description: "List, create, edit, and delete interest entries inside the Career Profile workspace.",
  singularLabel: "Interest",
  emptyStateTitle: "No interests yet",
  emptyStateDescription: {
    withProfile: "Add your first interest to help shape future recommendations.",
    withoutProfile: "Create your career profile first, then add interests.",
  },
  fields: [textField("name", "Name", { required: true, placeholder: "Machine Learning" })],
  card: {
    titleField: "name",
  },
  uniqueFields: ["name"],
};

export const referencesSectionConfig: SectionModuleConfig = {
  key: "references",
  route: APP_ROUTES.careerProfileReferences,
  apiRoot: "/references/",
  queryKey: ["career-profile", "references"],
  title: "References",
  description: "List, create, edit, and delete reference entries inside the Career Profile workspace.",
  singularLabel: "Reference",
  emptyStateTitle: "No references yet",
  emptyStateDescription: {
    withProfile: "Add your first reference so the profile is ready for applications.",
    withoutProfile: "Create your career profile first, then add references.",
  },
  fields: [
    textField("name", "Name", { required: true, placeholder: "Jane Smith" }),
    textField("designation", "Designation", { required: true, placeholder: "Engineering Manager" }),
    textField("company", "Company", { required: true, placeholder: "CareerOS" }),
    emailField("email", "Email", { required: false, placeholder: "jane@example.com" }),
    textField("phone", "Phone", { required: false, placeholder: "+91 98765 43210" }),
    textField("relationship", "Relationship", { required: false, placeholder: "Former manager" }),
  ],
  card: {
    titleField: "name",
    subtitleField: "designation",
    descriptionField: "company",
    metaFields: ["email", "phone", "relationship"],
  },
  uniqueFields: ["name", "company"],
};

export const customSectionsConfig: SectionModuleConfig = {
  key: "custom-sections",
  route: APP_ROUTES.careerProfileCustomSections,
  apiRoot: "/custom-sections/",
  queryKey: ["career-profile", "custom-sections"],
  title: "Custom Sections",
  description: "List, create, edit, and delete custom section entries inside the Career Profile workspace.",
  singularLabel: "Custom Section",
  emptyStateTitle: "No custom sections yet",
  emptyStateDescription: {
    withProfile: "Add your first custom section when you need extra structure.",
    withoutProfile: "Create your career profile first, then add custom sections.",
  },
  fields: [
    textField("title", "Title", { required: true, placeholder: "Leadership" }),
    textareaField("content", "Content", { required: true, placeholder: "Add the custom content here." }),
  ],
  card: {
    titleField: "title",
    descriptionField: "content",
  },
  uniqueFields: ["title"],
};

export const careerProfileSectionConfigs = [
  experienceSectionConfig,
  skillsSectionConfig,
  projectsSectionConfig,
  certificationsSectionConfig,
  languagesSectionConfig,
  achievementsSectionConfig,
  awardsSectionConfig,
  volunteerSectionConfig,
  publicationsSectionConfig,
  interestsSectionConfig,
  referencesSectionConfig,
  customSectionsConfig,
] as const;

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}
