import type { ResumeTemplateProps } from "./types";
import { getSectionRecords } from "./types";

export function AtsTemplate({
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
    <div className="flex h-full flex-col p-8 text-black bg-white font-sans leading-relaxed text-[9.5px] overflow-y-auto">
      {/* ATS Simple Left-Aligned Header Block */}
      {primaryRecord ? (
        <div className="pb-3 border-b border-black text-left mb-4">
          <h1 className="text-xl font-bold tracking-normal uppercase text-black">
            {primaryRecord.title}
          </h1>
          {primaryRecord.subtitle ? (
            <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wide mt-0.5">
              {primaryRecord.subtitle}
            </p>
          ) : null}
          {primaryRecord.meta?.length ? (
            <p className="mt-1 text-[9px] text-[#2c2c2c]">
              {primaryRecord.meta.join("  |  ")}
            </p>
          ) : null}
          {primaryRecord.description ? (
            <p className="mt-2 text-[9px] text-[#3c3c3c] leading-normal max-w-2xl text-justify">
              {primaryRecord.description}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="pb-2 border-b border-black mb-3">
          <h1 className="text-lg font-bold uppercase text-black">{resume.title}</h1>
          <p className="text-[9px] text-slate-500 uppercase mt-0.5">ATS Resume</p>
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
              <div key={section.id} className="space-y-1.5 page-break-inside-avoid">
                {/* Section Title */}
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-black border-b border-slate-350 pb-0.5">
                  {section.title}
                </h3>

                {/* Section Items */}
                <div className="space-y-3 pl-1">
                  {records.map((record) => {
                    const isSkills = section.section_type === "skills";

                    if (isSkills) {
                      return (
                        <div key={record.id} className="text-[9.5px] text-slate-800 font-medium">
                          {record.meta && record.meta.length > 0 ? (
                            <p className="leading-relaxed">
                              {record.meta.join(", ")}
                            </p>
                          ) : (
                            <p>{record.title}</p>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div key={record.id} className="space-y-0.5">
                        <div className="flex justify-between items-baseline gap-4">
                          <div>
                            <span className="text-[10px] font-bold text-black">
                              {record.title}
                            </span>
                            {record.subtitle ? (
                              <span className="text-[9.5px] text-slate-700 font-medium ml-2">
                                &mdash; {record.subtitle}
                              </span>
                            ) : null}
                          </div>
                          {record.meta && record.meta.length > 0 ? (
                            <span className="text-[9px] font-semibold text-slate-600 text-right shrink-0">
                              {record.meta[record.meta.length - 1]}
                            </span>
                          ) : null}
                        </div>

                        {record.description ? (
                          <div className="text-[9px] text-[#333333] leading-relaxed whitespace-pre-line text-justify pl-3">
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
