import type { ResumeTemplateProps } from "./types";
import { getSectionRecords } from "./types";

export function ExecutiveTemplate({
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

  // Divide sections into left sidebar and right body (as defined in Template 3)
  const sidebarSectionTypes = ["skills", "languages", "certifications", "interests", "references", "education"];
  const leftSections = sortedSections.filter((s) => sidebarSectionTypes.includes(s.section_type));
  const rightSections = sortedSections.filter((s) => !sidebarSectionTypes.includes(s.section_type) && s.section_type !== "personal_information");

  return (
    <div className="flex h-full bg-white text-[#111827] font-sans leading-relaxed text-[9px] overflow-hidden">
      {/* 1. Left Sidebar Column (36% width, mimicking template 3 background) */}
      <div className="w-[36%] bg-[#eef5fb] border-r border-[#d1d5db] p-5 flex flex-col space-y-4 overflow-y-auto shrink-0">
        {/* Contact Info Area */}
        {primaryRecord ? (
          <div className="space-y-2 pb-3 border-b border-[#D1D5DB]">
            <h2 className="text-[13.5px] font-extrabold text-[#111827] uppercase leading-tight">
              {primaryRecord.title}
            </h2>
            {primaryRecord.subtitle ? (
              <p className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">
                {primaryRecord.subtitle}
              </p>
            ) : null}

            {primaryRecord.meta?.length ? (
              <div className="space-y-1.5 pt-2 text-[8px] text-slate-600 font-medium">
                {primaryRecord.meta.map((val, idx) => (
                  <p key={idx} className="break-all leading-normal">
                    {val}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="pb-3 border-b border-[#D1D5DB]">
            <h2 className="text-[11px] font-extrabold text-[#111827] uppercase">{resume.title}</h2>
            <p className="text-[8.5px] text-slate-400 uppercase tracking-widest mt-1">Executive CV</p>
          </div>
        )}

        {/* Sidebar Sections */}
        {leftSections.map((section) => {
          const records = getSectionRecords(section, allSectionItems, allSourceRecords);
          if (records.length === 0) return null;

          return (
            <div key={section.id} className="space-y-2 page-break-inside-avoid">
              <h3 className="text-[9px] font-extrabold uppercase tracking-wider text-[#1F4E79] border-b border-[#D1D5DB] pb-0.5">
                {section.title}
              </h3>
              <div className="space-y-2">
                {records.map((record) => {
                  const isSkills = section.section_type === "skills";

                  if (isSkills) {
                    return (
                      <div key={record.id} className="flex flex-wrap gap-1">
                        {record.meta?.map((val) => (
                          <span
                            key={val}
                            className="bg-white border border-[#D1D5DB] text-[8px] px-1.5 py-0.5 rounded text-slate-700 font-medium"
                          >
                            {val}
                          </span>
                        )) ?? (
                          <span className="font-bold text-slate-800 text-[8.5px]">{record.title}</span>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={record.id} className="space-y-0.5">
                      <p className="font-bold text-slate-800 leading-tight">{record.title}</p>
                      {record.subtitle ? (
                        <p className="text-[8px] text-slate-500 italic">{record.subtitle}</p>
                      ) : null}
                      {record.description ? (
                        <p className="text-[8px] text-slate-500 leading-normal">{record.description}</p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Right Main Column (64% width, white background) */}
      <div className="w-[64%] p-5 flex flex-col space-y-4 overflow-y-auto">
        {/* Executive Profile Summary Statement */}
        {primaryRecord?.description ? (
          <div className="space-y-1.5 page-break-inside-avoid">
            <h3 className="text-[9px] font-extrabold uppercase tracking-wider text-[#1F4E79] border-b border-[#D1D5DB] pb-0.5">
              Professional Summary
            </h3>
            <p className="text-[9px] text-slate-650 leading-relaxed text-justify">
              {primaryRecord.description}
            </p>
          </div>
        ) : null}

        {/* Right Columns Sections */}
        {rightSections.map((section) => {
          const records = getSectionRecords(section, allSectionItems, allSourceRecords);
          if (records.length === 0) return null;

          return (
            <div key={section.id} className="space-y-2 page-break-inside-avoid">
              <h3 className="text-[9px] font-extrabold uppercase tracking-wider text-[#1F4E79] border-b border-[#D1D5DB] pb-0.5">
                {section.title}
              </h3>
              <div className="space-y-3">
                {records.map((record) => (
                  <div key={record.id} className="space-y-1">
                    <div className="flex justify-between items-baseline gap-4">
                      <span className="text-[9.5px] font-bold text-slate-900">
                        {record.title}
                      </span>
                      {record.meta && record.meta.length > 0 ? (
                        <span className="text-[8px] font-semibold text-slate-500 text-right shrink-0">
                          {record.meta[record.meta.length - 1]}
                        </span>
                      ) : null}
                    </div>

                    {record.subtitle ? (
                      <p className="text-[8.5px] font-semibold text-slate-500 italic">
                        {record.subtitle}
                      </p>
                    ) : null}

                    {record.description ? (
                      <div className="text-[8.5px] text-slate-600 leading-normal pl-3 border-l border-slate-100 whitespace-pre-line text-justify">
                        {record.description}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
