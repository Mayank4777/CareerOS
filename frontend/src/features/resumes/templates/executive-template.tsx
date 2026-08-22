import type { ResumeTemplateProps } from "./types";
import { getNormalizedResumeData } from "./types";

export function ExecutiveTemplate(props: ResumeTemplateProps) {
  const data = getNormalizedResumeData(props);
  const info = data.personal_info || {};
  const summary = data.summary;
  const sections = data.sections || [];

  const mainSections = sections.filter((s: any) => ["experience", "projects"].includes(s.key));
  const sideSections = sections.filter((s: any) => !["experience", "projects"].includes(s.key));

  return (
    <div className="printable-resume flex min-h-full flex-col p-6 bg-white text-[#1f2937] font-sans text-[10px] leading-relaxed">
      {/* Header Grid (Template 2 ex-header) */}
      <div className="grid grid-cols-[1.6fr_1fr] gap-4 border-b-2 border-[#c7d9f1] pb-3 mb-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#2a5ba5] tracking-tight leading-tight">
            {info.full_name || props.resume.title}
          </h1>
          {info.headline ? (
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1">
              {info.headline}
            </p>
          ) : null}
        </div>

        {/* Executive Contact Card */}
        <div className="bg-[#eef5ff] border border-[#d5e4f8] rounded-lg p-2.5 space-y-0.5 text-[9px] text-[#27496d]">
          {info.email ? <p className="font-semibold">{info.email}</p> : null}
          {info.phone ? <p>{info.phone}</p> : null}
          {info.location ? <p>{info.location}</p> : null}
          {info.linkedin ? <p className="text-[#1d4ed8] underline">{info.linkedin}</p> : null}
          {info.github ? <p className="text-[#1d4ed8] underline">{info.github}</p> : null}
        </div>
      </div>

      {/* 2-Column Layout Grid (Template 2 ex-grid) */}
      <div className="grid grid-cols-[1.7fr_1fr] gap-5 flex-1">
        {/* Main Column */}
        <div className="space-y-4">
          {summary ? (
            <div className="space-y-1">
              <h3 className="text-[10.5px] font-bold uppercase tracking-wider text-[#2a5ba5] border-b-2 border-[#a9c4ea] pb-0.5">
                Executive Summary
              </h3>
              <p className="text-[9.5px] text-slate-700 leading-relaxed text-justify">{summary}</p>
            </div>
          ) : null}

          {mainSections.map((sec: any) => (
            <div key={sec.key} className="space-y-2">
              <h3 className="text-[10.5px] font-bold uppercase tracking-wider text-[#2a5ba5] border-b-2 border-[#a9c4ea] pb-0.5">
                {sec.title}
              </h3>
              <div className="space-y-3">
                {sec.items?.map((item: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="font-bold text-slate-900 text-[10px]">
                        {item.title}
                      </span>
                      {(item.start_date || item.end_date) && (
                        <span className="text-[9px] text-slate-500 whitespace-nowrap font-medium">
                          {item.start_date} {item.end_date ? `- ${item.end_date}` : ""}
                        </span>
                      )}
                    </div>
                    {item.company ? (
                      <p className="text-[9px] text-[#2a5ba5] italic font-medium">{item.company}</p>
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
        </div>

        {/* Sidebar Column */}
        <div className="bg-[#eef5ff] border border-[#d5e4f8] rounded-xl p-3.5 space-y-4 self-start">
          {sideSections.map((sec: any) => (
            <div key={sec.key} className="space-y-1.5">
              <h3 className="text-[9.5px] font-bold uppercase tracking-wider text-[#2a5ba5] border-b border-[#a9c4ea] pb-0.5">
                {sec.title}
              </h3>
              <div className="space-y-2">
                {sec.items?.map((item: any, idx: number) => {
                  if (sec.key === "skills") {
                    return (
                      <div key={idx} className="space-y-1">
                        <span className="font-bold text-slate-800 text-[9px] block">{item.category}:</span>
                        <div className="flex flex-wrap gap-1">
                          {item.skills?.map((sk: string) => (
                            <span key={sk} className="bg-white border border-[#c7d9f1] text-slate-700 px-1.5 py-0.5 rounded text-[8.5px] font-medium">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className="space-y-0.5">
                      <p className="font-bold text-slate-800 text-[9px]">{item.institution || item.name || item.title}</p>
                      {item.degree ? (
                        <p className="text-[8.5px] text-slate-600 italic">{item.degree} ({item.field_of_study})</p>
                      ) : null}
                      {item.start_date || item.end_date ? (
                        <p className="text-[8px] text-[#27496d] font-semibold">{item.start_date} - {item.end_date}</p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
