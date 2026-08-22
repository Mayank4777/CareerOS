import type { ResumeTemplateProps } from "./types";
import { getNormalizedResumeData } from "./types";

export function ProfessionalTemplate(props: ResumeTemplateProps) {
  const data = getNormalizedResumeData(props);
  const info = data.personal_info || {};
  const summary = data.summary;
  const sections = data.sections || [];

  return (
    <div className="printable-resume flex min-h-full flex-col bg-white text-[#1f2937] font-sans text-[10px] leading-normal">
      {/* Corporate Dark Banner Header (Template 8 / 4 style) */}
      <div className="bg-gradient-to-r from-[#0b2540] to-[#114b5f] text-white p-6 pb-5 space-y-2">
        <h1 className="text-[26px] font-extrabold tracking-wide uppercase leading-tight text-white">
          {info.full_name || props.resume.title}
        </h1>
        {info.headline ? (
          <p className="text-[11px] font-bold text-[#dff6ff] tracking-widest uppercase">
            {info.headline}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center pt-1 text-[9.5px] text-[#d9edf7] gap-3 font-medium">
          {info.email ? <span>{info.email}</span> : null}
          {info.phone ? <span>• {info.phone}</span> : null}
          {info.location ? <span>• {info.location}</span> : null}
          {info.linkedin ? <span>• {info.linkedin}</span> : null}
          {info.github ? <span>• {info.github}</span> : null}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 space-y-4 flex-1">
        {summary ? (
          <div className="space-y-1">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#0f3a57] border-b-2 border-[#0f3a57] pb-0.5">
              Professional Overview
            </h3>
            <p className="text-[9.5px] text-slate-700 leading-relaxed italic border-l-2 border-[#0f3a57] pl-3">
              {summary}
            </p>
          </div>
        ) : null}

        {sections
          .filter((sec: any) => sec.visible !== false && sec.items && sec.items.length > 0)
          .map((sec: any) => (
            <div key={sec.key || sec.title} className="space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#0f3a57] border-b-2 border-[#d5e4f8] pb-0.5">
                {sec.title}
              </h3>

              <div className="space-y-3">
                {sec.items?.map((item: any, idx: number) => {
                  if (sec.key === "skills") {
                    return (
                      <div key={idx} className="grid grid-cols-[140px_1fr] gap-2 items-start py-0.5">
                        <span className="font-bold text-[#0f3a57] text-[10px]">{item.category}:</span>
                        <div className="flex flex-wrap gap-1">
                          {item.skills?.map((sk: string) => (
                            <span key={sk} className="bg-[#f0f7ff] text-[#0f3a57] px-2 py-0.5 rounded border border-[#c7d9f1] text-[8.5px] font-semibold">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-bold text-[#0b2540] text-[10.5px]">
                          {item.title || item.institution || item.name}
                        </span>
                        {(item.start_date || item.end_date || item.issue_date) && (
                          <span className="text-[9px] font-bold text-slate-500 text-right shrink-0">
                            {item.start_date} {item.end_date ? `- ${item.end_date}` : ""} {item.issue_date}
                          </span>
                        )}
                      </div>

                      {(item.company || item.degree || item.organization) && (
                        <p className="text-[9.5px] font-medium text-[#114b5f] italic">
                          {item.company || item.organization} {item.degree ? `— ${item.degree} (${item.field_of_study})` : ""}
                        </p>
                      )}

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
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
