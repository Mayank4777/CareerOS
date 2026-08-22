import type { ResumeTemplateProps } from "./types";
import { getNormalizedResumeData } from "./types";

export function MinimalTemplate(props: ResumeTemplateProps) {
  const data = getNormalizedResumeData(props);
  const info = data.personal_info || {};
  const summary = data.summary;
  const sections = data.sections || [];

  const sideSections = sections.filter((s: any) => ["skills", "education", "certifications", "achievements"].includes(s.key));
  const mainSections = sections.filter((s: any) => !["skills", "education", "certifications", "achievements"].includes(s.key));

  return (
    <div className="printable-resume flex min-h-full bg-white text-[#111827] font-sans text-[10px] leading-relaxed">
      {/* Tinted Left Sidebar (Template 3 33% sidebar) */}
      <aside className="w-[33%] bg-[#eef5fb] p-5 space-y-4 border-r border-[#d1d5db] shrink-0">
        {/* Header Name inside Sidebar */}
        <div className="border-b border-[#cbd5e1] pb-3">
          <h1 className="text-[20px] font-extrabold text-[#1F4E79] tracking-tight leading-tight">
            {info.full_name || props.resume.title}
          </h1>
          {info.headline ? (
            <p className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              {info.headline}
            </p>
          ) : null}
        </div>

        {/* Contact Info */}
        <div className="space-y-1.5 text-[9px] text-slate-600">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#1F4E79] border-b border-[#D1D5DB] pb-0.5 mb-1.5">
            Contact
          </h3>
          {info.email ? <p className="break-all">• {info.email}</p> : null}
          {info.phone ? <p>• {info.phone}</p> : null}
          {info.location ? <p>• {info.location}</p> : null}
          {info.linkedin ? <p className="text-[#1d4ed8] break-all">• {info.linkedin}</p> : null}
          {info.github ? <p className="text-[#1d4ed8] break-all">• {info.github}</p> : null}
        </div>

        {/* Sidebar Sections (Education, Skills, Certifications) */}
        {sideSections.map((sec: any) => (
          <div key={sec.key} className="space-y-1.5">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#1F4E79] border-b border-[#D1D5DB] pb-0.5">
              {sec.title}
            </h3>
            <div className="space-y-2">
              {sec.items?.map((item: any, idx: number) => {
                if (sec.key === "skills") {
                  return (
                    <div key={idx} className="space-y-0.5">
                      <span className="font-bold text-slate-800 text-[9px] block">{item.category}:</span>
                      <p className="text-[8.5px] text-slate-600 leading-snug">
                        {item.skills?.join(", ")}
                      </p>
                    </div>
                  );
                }

                return (
                  <div key={idx} className="space-y-0.5">
                    <p className="font-bold text-slate-900 text-[9px]">{item.institution || item.name || item.title}</p>
                    {item.degree ? (
                      <p className="text-[8.5px] text-slate-600 italic">{item.degree} ({item.field_of_study})</p>
                    ) : null}
                    {item.start_date || item.end_date ? (
                      <p className="text-[8px] text-[#4B5563]">{item.start_date} {item.end_date ? `- ${item.end_date}` : ""}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </aside>

      {/* Main Content Area (67% width) */}
      <main className="w-[67%] p-6 space-y-4 flex-1">
        {summary ? (
          <div className="space-y-1">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#1F4E79] border-b border-[#D1D5DB] pb-1">
              Professional Summary
            </h3>
            <p className="text-[9.5px] text-slate-700 leading-relaxed text-justify">{summary}</p>
          </div>
        ) : null}

        {mainSections.map((sec: any) => (
          <div key={sec.key} className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#1F4E79] border-b border-[#D1D5DB] pb-1">
              {sec.title}
            </h3>
            <div className="space-y-3">
              {sec.items?.map((item: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="font-bold text-slate-900 text-[10.5px]">
                      {item.title}
                    </span>
                    {(item.start_date || item.end_date) && (
                      <span className="text-[9px] text-[#4B5563] whitespace-nowrap font-medium">
                        {item.start_date} {item.end_date ? `- ${item.end_date}` : ""}
                      </span>
                    )}
                  </div>
                  {item.company ? (
                    <p className="text-[9.5px] text-[#1F4E79] italic font-semibold">{item.company}</p>
                  ) : null}
                  {item.bullets && item.bullets.length > 0 ? (
                    <ul className="list-disc pl-4 text-[9px] text-slate-650 space-y-0.5">
                      {item.bullets.map((b: string, i: number) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  ) : item.description ? (
                    <p className="text-[9px] text-slate-600 leading-normal pl-2 border-l border-slate-200">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
