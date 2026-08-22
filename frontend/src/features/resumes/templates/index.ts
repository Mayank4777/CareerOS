import type { ComponentType } from "react";
import type { ResumeTemplateProps } from "./types";
import { ModernTemplate } from "./modern-template";
import { ProfessionalTemplate } from "./professional-template";
import { MinimalTemplate } from "./minimal-template";
import { ExecutiveTemplate } from "./executive-template";
import { AtsTemplate } from "./ats-template";

export * from "./types";
export { ModernTemplate } from "./modern-template";
export { ProfessionalTemplate } from "./professional-template";
export { MinimalTemplate } from "./minimal-template";
export { ExecutiveTemplate } from "./executive-template";
export { AtsTemplate } from "./ats-template";

export const RESUME_TEMPLATES: Record<string, ComponentType<ResumeTemplateProps>> = {
  modern: ModernTemplate,
  professional: ProfessionalTemplate,
  minimal: MinimalTemplate,
  executive: ExecutiveTemplate,
  ats: AtsTemplate,
};
