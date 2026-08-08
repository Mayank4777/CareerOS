import type { ResumeTemplateProps } from "./types";
import { getSectionRecords } from "./types";

export function MinimalTemplate({
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
    <div className="flex h-full flex-col p-8 text-[#151515] bg-white leading-normal text-[11px] overflow-y-auto font-sans">
      {/* Template 5 Centered Header Layout */}
      {primaryRecord ? (
        <header className="text-center mb-5">
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#111111]">
            {primaryRecord.title}
          </h1>
          {primaryRecord.subtitle ? (
            <p className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mt-1">
              {primaryRecord.subtitle}
            </p>
          ) : null}
          {primaryRecord.meta?.length ? (
            <p className="mt-2 text-[10.5px] text-[#2c2c2c] space-x-2">
              {primaryRecord.meta.map((val, idx) => (
                <span key={idx}>
                  {idx > 0 && <span className="text-slate-300 mx-1.5">•</span>}
                  {val}
                </span>
              ))}
            </p>
          ) : null}
          {primaryRecord.description ? (
            <p className="mt-3 text-[10px] text-slate-500 max-w-xl mx-auto italic leading-normal">
              {primaryRecord.description}
            </p>
          ) : null}
        </header>
      ) : (
        <header className="text-center mb-4">
          <h1 className="text-[24px] font-extrabold text-[#111111]">{resume.title}</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Minimal CV</p>
        </header>
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
                {/* Section Title */}
                <h3 className="text-[11.5px] font-extrabold uppercase tracking-widest text-[#111111] border-b-2 border-slate-200 pb-1">
                  {section.title}
                </h3>

                {/* Section Items */}
                <div className="space-y-3 pl-0.5">
                  {records.map((record) => {
                    const isSkills = section.section_type === "skills";

                    if (isSkills) {
                      return (
                        <div key={record.id} className="flex flex-wrap gap-x-3 gap-y-1.5 pt-0.5 text-slate-700">
                          {record.meta?.map((val, i) => (
                            <span key={val} className="flex items-center gap-1.5 text-[10px]">
                              {i > 0 && <span className="text-slate-200">•</span>}
                              {val}
                            </span>
                          )) ?? (
                            <span className="font-semibold text-slate-900 text-[10.5px]">{record.title}</span>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div key={record.id} className="space-y-1">
                        <div className="flex justify-between items-baseline gap-4">
                          <span className="text-[11px] font-bold text-[#111111]">
                            {record.title}
                          </span>
                          {record.meta && record.meta.length > 0 ? (
                            <span className="text-[9.5px] text-slate-500 text-right shrink-0">
                              {record.meta[record.meta.length - 1]}
                            </span>
                          ) : null}
                        </div>

                        {record.subtitle ? (
                          <p className="text-[10px] text-slate-500 font-medium italic">
                            {record.subtitle}
                          </p>
                        ) : null}

                        {record.description ? (
                          <div className="text-[9.5px] text-slate-600 leading-normal pl-3">
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
