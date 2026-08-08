import type { ResumeTemplateProps } from "./types";
import { getSectionRecords } from "./types";

export function ModernTemplate({
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

  // Find personal information section
  const personalInfoSection = sections.find((s) => s.section_type === "personal_information");
  const personalRecords = personalInfoSection
    ? getSectionRecords(personalInfoSection, allSectionItems, allSourceRecords)
    : [];
  const primaryRecord = personalRecords[0];

  return (
    <div className="flex h-full flex-col p-8 text-[#12212f] bg-white leading-normal text-[11px] overflow-y-auto font-sans">
      {/* Template 4 Header Layout */}
      {primaryRecord ? (
        <div className="border-b-[3px] border-[#1b4d78] pb-4 mb-4">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-[26px] font-extrabold text-[#163b5c] tracking-wide leading-tight uppercase">
                {primaryRecord.title}
              </h1>
              {primaryRecord.subtitle ? (
                <p className="text-[12px] font-bold text-[#345a7b] tracking-widest uppercase mt-1">
                  {primaryRecord.subtitle}
                </p>
              ) : null}
              {primaryRecord.meta?.length ? (
                <div className="flex flex-wrap items-center mt-2.5 text-[11px] text-[#2a3a48] font-medium">
                  {primaryRecord.meta.map((item, idx) => (
                    <span key={idx} className="flex items-center">
                      {idx > 0 && <span className="text-[#88a0b5] mx-2 font-normal">|</span>}
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          {primaryRecord.description ? (
            <p className="mt-3 text-[10px] text-slate-600 leading-relaxed italic">
              {primaryRecord.description}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="border-b-[3px] border-[#1b4d78] pb-4 mb-4">
          <h1 className="text-[26px] font-extrabold text-[#163b5c] tracking-wide uppercase">{resume.title}</h1>
          <p className="text-[12px] text-slate-500 tracking-wider uppercase mt-1">Draft Resume</p>
        </div>
      )}

      {/* Main Content Sections */}
      <div className="space-y-4 flex-1">
        {sortedSections
          .filter((section) => section.section_type !== "personal_information")
          .map((section) => {
            const records = getSectionRecords(section, allSectionItems, allSourceRecords);
            if (records.length === 0) return null;

            return (
              <div key={section.id} className="space-y-2 page-break-inside-avoid">
                {/* Section Header */}
                <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-[#163b5c] border-b-2 border-[#d7e2ea] pb-1">
                  {section.title}
                </h3>

                {/* Section Items */}
                <div className="space-y-3">
                  {records.map((record) => {
                    const isSkills = section.section_type === "skills";

                    if (isSkills) {
                      return (
                        <div key={record.id} className="flex flex-wrap gap-1.5 pt-0.5">
                          {record.meta?.map((val) => (
                            <span
                              key={val}
                              className="bg-[#eef5ff] text-[9.5px] text-[#1b4d78] px-2 py-0.5 rounded border border-[#d5e4f8] font-bold"
                            >
                              {val}
                            </span>
                          )) ?? (
                            <span className="font-bold text-slate-800 text-[10.5px]">{record.title}</span>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div key={record.id} className="space-y-1">
                        <div className="flex justify-between items-baseline gap-4">
                          <span className="text-[11px] font-bold text-[#12212f]">
                            {record.title}
                          </span>
                          {record.meta && record.meta.length > 0 ? (
                            <span className="text-[9.5px] font-bold text-slate-500 text-right shrink-0">
                              {record.meta[record.meta.length - 1]}
                            </span>
                          ) : null}
                        </div>

                        {record.subtitle ? (
                          <p className="text-[10px] font-medium text-slate-500 italic">
                            {record.subtitle}
                          </p>
                        ) : null}

                        {record.description ? (
                          <div className="text-[9.5px] text-slate-600 leading-normal pl-3 border-l border-slate-100 whitespace-pre-line text-justify">
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
