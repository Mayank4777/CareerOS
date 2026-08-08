import type { ResumeTemplateProps } from "./types";
import { getSectionRecords } from "./types";

export function ProfessionalTemplate({
  resume,
  sections,
  allSectionItems,
  allSourceRecords,
}: ResumeTemplateProps) {
  // Sort sections by display order
  const sortedSections = sections
    .filter((s) => s.is_visible)
    .slice()
    .sort((a, b) => a.display_order - b.display_order);

  // Find personal information
  const personalInfoSection = sections.find((s) => s.section_type === "personal_information");
  const personalRecords = personalInfoSection
    ? getSectionRecords(personalInfoSection, allSectionItems, allSourceRecords)
    : [];
  const primaryRecord = personalRecords[0];

  return (
    <div className="flex h-full flex-col p-9 text-[#374151] bg-white leading-normal text-[11px] overflow-y-auto font-serif">
      {/* Template 7 Header Layout */}
      {primaryRecord ? (
        <header className="text-center mb-6">
          <h1 className="text-[28px] font-bold text-[#111827] tracking-normal uppercase font-serif">
            {primaryRecord.title}
          </h1>
          {primaryRecord.subtitle ? (
            <p className="text-[11px] font-bold text-slate-500 tracking-widest uppercase mt-1 font-sans">
              {primaryRecord.subtitle}
            </p>
          ) : null}
          {primaryRecord.meta?.length ? (
            <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 mt-2.5 text-[10.5px] text-slate-500 font-sans">
              {primaryRecord.meta.map((item, idx) => (
                <span key={idx} className="flex items-center gap-2">
                  {idx > 0 && <span className="text-slate-300 font-bold">•</span>}
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </header>
      ) : (
        <header className="text-center mb-5">
          <h1 className="text-[24px] font-bold text-[#111827] uppercase font-serif">{resume.title}</h1>
          <p className="text-[10px] text-slate-400 tracking-wider uppercase mt-1 font-sans">Professional Resume</p>
        </header>
      )}

      {/* Main Content Sections */}
      <div className="space-y-5 flex-1">
        {/* Summary (if present) */}
        {primaryRecord?.description ? (
          <div className="space-y-1.5 page-break-inside-avoid">
            <h5 className="text-[12.5px] font-bold uppercase tracking-wider text-[#111827] border-b-2 border-[#3f3f46] pb-1 font-sans">
              Professional Summary
            </h5>
            <p className="text-[10.5px] text-slate-700 leading-relaxed text-justify italic">
              {primaryRecord.description}
            </p>
          </div>
        ) : null}

        {sortedSections
          .filter((section) => section.section_type !== "personal_information")
          .map((section) => {
            const records = getSectionRecords(section, allSectionItems, allSourceRecords);
            if (records.length === 0) return null;

            return (
              <div key={section.id} className="space-y-2 page-break-inside-avoid">
                {/* Section Title */}
                <h5 className="text-[12.5px] font-bold uppercase tracking-wider text-[#111827] border-b-2 border-[#3f3f46] pb-1 font-sans">
                  {section.title}
                </h5>

                {/* Section Items */}
                <div className="space-y-3">
                  {records.map((record) => {
                    const isSkills = section.section_type === "skills";

                    if (isSkills) {
                      return (
                        <div key={record.id} className="flex flex-wrap gap-x-3 gap-y-1.5 pt-0.5 font-sans font-medium text-slate-700">
                          {record.meta?.map((val) => (
                            <span
                              key={val}
                              className="text-[10px] px-2 py-0.5 border border-slate-200 rounded-sm"
                            >
                              {val}
                            </span>
                          )) ?? (
                            <span className="font-bold text-slate-900 text-[11px]">{record.title}</span>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div key={record.id} className="space-y-1">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <strong className="text-[11.5px] font-bold text-slate-900 leading-tight">
                              {record.title}
                            </strong>
                            {record.subtitle ? (
                              <div className="text-[10px] font-medium text-slate-500 italic mt-0.5">
                                {record.subtitle}
                              </div>
                            ) : null}
                          </div>
                          {record.meta && record.meta.length > 0 ? (
                            <div className="text-[10px] text-slate-500 font-sans italic text-right shrink-0">
                              {record.meta[record.meta.length - 1]}
                            </div>
                          ) : null}
                        </div>

                        {record.description ? (
                          <div className="text-[10px] text-slate-650 leading-relaxed text-justify whitespace-pre-line pl-3 border-l border-slate-100 font-serif">
                            {record.description}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
