import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Plus,
  X,
  Calendar,
  MapPin,
  GraduationCap,
  Briefcase,
  Award,
  Link as LinkIcon,
  Mail,
  Phone,
  Building2,
  Wrench,
  Globe
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/class-name";
import type {
  ResumeEditorSectionItem,
  ResumeEditorSectionType,
  ResumeEditorSourceRecord,
} from "@/features/resumes/types/resume-editor";

interface ResumeEditorRecordCardProps {
  record: ResumeEditorSourceRecord;
  includedItem: ResumeEditorSectionItem | null;
  canEdit: boolean;
  sectionType?: ResumeEditorSectionType;
  orderNumber?: number;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onToggleInclude: (record: ResumeEditorSourceRecord, includedItem: ResumeEditorSectionItem | null) => void;
  onMoveUp?: (itemId: string) => void;
  onMoveDown?: (itemId: string) => void;
}

export function ResumeEditorRecordCard({
  record,
  includedItem,
  canEdit,
  sectionType,
  orderNumber,
  canMoveUp = false,
  canMoveDown = false,
  onToggleInclude,
  onMoveUp,
  onMoveDown,
}: ResumeEditorRecordCardProps) {
  const included = Boolean(includedItem);

  const renderExperienceCard = () => {
    const [designation, company] = record.title.split(" @ ");
    const location = record.meta?.[0];
    const employmentType = record.meta?.[1];
    const startDate = record.meta?.[2];
    const endDate = record.meta?.[3];

    return (
      <div className="space-y-2">
        <div>
          <h4 className="text-sm font-bold text-primary">{designation || record.title}</h4>
          {company ? (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-secondary/90 mt-1">
              <Building2 className="h-3.5 w-3.5 text-muted" />
              {company}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-secondary/80">
          {startDate || endDate ? (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted" />
              {startDate || "N/A"} — {endDate || "Present"}
            </span>
          ) : null}
          {location ? (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-muted" />
              {location}
            </span>
          ) : null}
          {employmentType ? (
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5 text-muted" />
              {employmentType}
            </span>
          ) : null}
        </div>

        {record.description ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted pt-0.5">{record.description}</p>
        ) : null}
      </div>
    );
  };

  const renderEducationCard = () => {
    const institution = record.title;
    const subtitle = record.subtitle;
    const startDate = record.meta?.[0];
    const endDate = record.meta?.[1];
    const grade = record.meta?.[2];

    return (
      <div className="space-y-2">
        <div>
          <h4 className="text-sm font-bold text-primary">{institution}</h4>
          {subtitle ? (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-secondary/90 mt-1">
              <GraduationCap className="h-3.5 w-3.5 text-muted" />
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-secondary/80">
          {startDate || endDate ? (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted" />
              {startDate || "N/A"} — {endDate || "Present"}
            </span>
          ) : null}
          {grade ? (
            <span className="flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-muted" />
              Grade/GPA: {grade}
            </span>
          ) : null}
        </div>
      </div>
    );
  };

  const renderSkillCard = () => {
    const skillName = record.title;
    const proficiency = record.subtitle;
    const category = record.description;
    const yoe = record.meta?.[0];

    return (
      <div className="space-y-2">
        <div>
          <h4 className="text-sm font-bold text-primary">{skillName}</h4>
          {category ? (
            <p className="text-xs text-secondary/80 mt-1">
              Category: <span className="font-semibold text-primary/80">{category}</span>
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-secondary/80">
          {proficiency ? (
            <span className="flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-muted" />
              {proficiency}
            </span>
          ) : null}
          {yoe ? (
            <span className="flex items-center gap-1">
              <Wrench className="h-3.5 w-3.5 text-muted" />
              {yoe} {Number(yoe) === 1 ? "year" : "years"} experience
            </span>
          ) : null}
        </div>
      </div>
    );
  };

  const renderProjectCard = () => {
    const title = record.title;
    const subtitle = record.subtitle;
    const technologies = record.meta?.[1];
    const projectUrl = record.meta?.[2];
    const githubUrl = record.meta?.[3];

    return (
      <div className="space-y-2">
        <div>
          <h4 className="text-sm font-bold text-primary">{title}</h4>
          {subtitle ? (
            <p className="text-xs font-semibold text-secondary/90 mt-1">{subtitle}</p>
          ) : null}
        </div>

        {record.description ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted">{record.description}</p>
        ) : null}

        {technologies ? (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {technologies.split(",").map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center rounded bg-surface/80 px-1.5 py-0.5 text-[10px] font-semibold text-secondary border border-border/40"
              >
                {tech.trim()}
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs pt-1">
          {projectUrl ? (
            <a
              href={projectUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-brand-400 hover:text-brand-300 font-semibold hover:underline"
            >
              <LinkIcon className="h-3 w-3" />
              Live Demo
            </a>
          ) : null}
          {githubUrl ? (
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-brand-400 hover:text-brand-300 font-semibold hover:underline"
            >
              <Globe className="h-3 w-3" />
              GitHub
            </a>
          ) : null}
        </div>
      </div>
    );
  };

  const renderCertificationCard = () => {
    const name = record.title;
    const issuer = record.subtitle;
    const credentialId = record.description;
    const issueDate = record.meta?.[0];
    const expiryDate = record.meta?.[1];
    const credentialUrl = record.meta?.[2];

    return (
      <div className="space-y-2">
        <div>
          <h4 className="text-sm font-bold text-primary">{name}</h4>
          {issuer ? (
            <p className="text-xs font-semibold text-secondary/90 mt-1">{issuer}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-secondary/80">
          {issueDate || expiryDate ? (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted" />
              Issued: {issueDate || "N/A"} {expiryDate ? `• Expiry: ${expiryDate}` : ""}
            </span>
          ) : null}
          {credentialId ? (
            <span className="font-mono text-[10px] text-secondary">
              ID: {credentialId}
            </span>
          ) : null}
        </div>

        {credentialUrl ? (
          <div className="pt-0.5">
            <a
              href={credentialUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-semibold hover:underline"
            >
              <LinkIcon className="h-3 w-3" />
              Verify Credential
            </a>
          </div>
        ) : null}
      </div>
    );
  };

  const renderReferenceCard = () => {
    const name = record.title;
    const designation = record.subtitle;
    const company = record.description;
    const email = record.meta?.[0];
    const phone = record.meta?.[1];
    const relationship = record.meta?.[2];

    return (
      <div className="space-y-2">
        <div>
          <h4 className="text-sm font-bold text-primary">{name}</h4>
          {designation || company ? (
            <p className="text-xs font-semibold text-secondary/95 mt-1">
              {[designation, company].filter(Boolean).join(" at ")}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-secondary/80">
          {email ? (
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-muted" />
              {email}
            </span>
          ) : null}
          {phone ? (
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 text-muted" />
              {phone}
            </span>
          ) : null}
          {relationship ? (
            <span className="text-[10px] bg-surface/50 border border-border/40 px-1.5 py-0.5 rounded text-secondary font-semibold">
              Ref: {relationship}
            </span>
          ) : null}
        </div>
      </div>
    );
  };

  const renderPersonalInformationCard = () => {
    const name = record.title;
    const headline = record.subtitle;
    const summary = record.description;
    const location = record.meta?.[0];
    const phone = record.meta?.[1];
    const website = record.meta?.[2];

    return (
      <div className="space-y-2">
        <div>
          <h4 className="text-sm font-bold text-primary">{name}</h4>
          {headline ? (
            <p className="text-xs font-semibold text-secondary/90 mt-1">{headline}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-secondary/80">
          {location ? (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-muted" />
              {location}
            </span>
          ) : null}
          {phone ? (
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 text-muted" />
              {phone}
            </span>
          ) : null}
          {website ? (
            <span className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5 text-muted" />
              {website}
            </span>
          ) : null}
        </div>

        {summary ? (
          <p className="line-clamp-3 text-xs leading-relaxed text-muted pt-0.5">{summary}</p>
        ) : null}
      </div>
    );
  };

  const renderFallbackCard = () => {
    return (
      <div className="space-y-2">
        <div>
          <h4 className="text-sm font-bold text-primary">{record.title}</h4>
          {record.subtitle ? (
            <p className="text-xs font-semibold text-secondary/80 mt-1">{record.subtitle}</p>
          ) : null}
        </div>

        {record.description ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted">{record.description}</p>
        ) : null}

        {record.meta?.length ? (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {record.meta.map((value) => (
              <span
                key={value}
                className="inline-flex items-center rounded bg-surface/80 px-1.5 py-0.5 text-[10px] font-medium text-secondary border border-border/40 max-w-full truncate"
              >
                {value}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  const getCardContent = () => {
    if (!sectionType) return renderFallbackCard();
    switch (sectionType) {
      case "experience":
        return renderExperienceCard();
      case "education":
        return renderEducationCard();
      case "skills":
        return renderSkillCard();
      case "projects":
        return renderProjectCard();
      case "certifications":
        return renderCertificationCard();
      case "references":
        return renderReferenceCard();
      case "personal_information":
        return renderPersonalInformationCard();
      default:
        return renderFallbackCard();
    }
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden border transition-all duration-300 hover:shadow-md",
        included
          ? "border-l-4 border-l-success/80 border-y-border border-r-border bg-surface/30 hover:border-y-borderHover hover:border-r-borderHover"
          : "border-border bg-background/40 hover:bg-surface/20 hover:border-borderHover"
      )}
    >
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <div
              className={cn(
                "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors",
                included
                  ? "bg-success/10 border-success/20 text-success"
                  : "bg-hover/50 border-border/70 text-secondary"
              )}
            >
              {included && canEdit ? <GripVertical className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </div>

            <div className="min-w-0 flex-1">
              {getCardContent()}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 border-t border-border/40 pt-3 sm:border-t-0 sm:pt-0">
            {included && canEdit ? (
              <div className="flex items-center rounded-lg border border-border bg-background/50 p-0.5">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 rounded-md hover:bg-hover hover:text-primary animate-none"
                  disabled={!canMoveUp}
                  onClick={() => onMoveUp?.(includedItem?.id ?? "")}
                  title="Move record up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <div className="h-4 w-px bg-border/60 mx-0.5" />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 rounded-md hover:bg-hover hover:text-primary animate-none"
                  disabled={!canMoveDown}
                  onClick={() => onMoveDown?.(includedItem?.id ?? "")}
                  title="Move record down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : null}

            <Button
              type="button"
              size="sm"
              variant={included ? "ghost" : "outline"}
              className={cn(
                "h-8 px-2.5 transition-all text-xs font-semibold shrink-0",
                included
                  ? "text-secondary hover:text-danger hover:bg-danger/10 border-transparent hover:border-danger/20"
                  : "border-brand-600/30 hover:border-brand-600 hover:bg-brand-600/10 text-brand-400 hover:text-brand-300"
              )}
              disabled={!canEdit}
              onClick={() => onToggleInclude(record, includedItem)}
              title={!canEdit ? "Create the section first to manage records." : undefined}
            >
              {included ? (
                <>
                  <X className="h-3.5 w-3.5" />
                  Remove
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  Include
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
