import type { ResumeTemplateProps } from "./types";
import { getNormalizedResumeData } from "./types";

export function ModernTemplate(props: ResumeTemplateProps) {
  const data = getNormalizedResumeData(props);
  const info = data.personal_info || {};
  const summary = data.summary;
  const sections = data.sections || [];
  const missingInfo = data.missing_info || [];

  return (
    <div className="printable-resume flex min-h-full flex-col p-8 text-[#12212f] bg-white leading-normal text-[11px] font-sans">
      {/* Header (Template 1 Header Block) */}
      <div className="border-b-[3px] border-[#1b4d78] pb-4 mb-4">
        <h1 className="text-[26px] font-extrabold text-[#163b5c] tracking-wide uppercase leading-tight">
          {info.full_name || props.resume.title}
        </h1>
        {info.headline ? (
          <p className="text-[12.5px] font-bold text-[#345a7b] tracking-wider uppercase mt-0.5">
            {info.headline}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center mt-2.5 text-[10.5px] text-slate-600 font-medium gap-2">
          {info.email ? <span>{info.email}</span> : null}
          {info.phone ? <span>• {info.phone}</span> : null}
          {info.location ? <span>• {info.location}</span> : null}
          {info.linkedin ? <span>• {info.linkedin}</span> : null}
          {info.github ? <span>• {info.github}</span> : null}
          {info.website ? <span>• {info.website}</span> : null}
        </div>

        {summary ? (
          <p className="mt-3 text-[10px] text-slate-600 leading-relaxed italic border-l-2 border-[#1b4d78] pl-3">
            {summary}
          </p>
        ) : null}
      </div>

      {/* Missing Info Warning Callout */}
      {missingInfo.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[10px] space-y-1 no-print">
          <span className="font-bold block uppercase tracking-wide text-amber-700">
            Career Profile Missing Details:
          </span>
          {missingInfo.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between">
              <span>• {item.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Dynamic Sections */}
      <div className="space-y-4 flex-1">
        {sections
          .filter((sec: any) => sec.visible !== false && sec.items && sec.items.length > 0)
          .map((sec: any) => (
            <div key={sec.key || sec.title} className="space-y-2">
              <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-[#163b5c] border-b-2 border-[#d7e2ea] pb-1">
                {sec.title}
              </h3>

              <div className="space-y-3">
                {sec.items.map((item: any, idx: number) => {
                  if (sec.key === "skills") {
                    return (
                      <div key={idx} className="flex flex-wrap gap-1.5 pt-0.5">
                        <span className="font-bold text-[#163b5c] text-[10.5px] w-full">{item.category}:</span>
                        {item.skills?.map((sk: string) => (
                          <span key={sk} className="bg-[#eef5ff] text-[9.5px] text-[#1b4d78] px-2 py-0.5 rounded border border-[#d5e4f8] font-bold">
                            {sk}
                          </span>
                        ))}
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-[11px] font-bold text-[#12212f]">
                          {item.title || item.institution || item.name}
                        </span>
                        {(item.start_date || item.end_date || item.issue_date) && (
                          <span className="text-[9.5px] font-bold text-slate-500 text-right shrink-0">
                            {item.start_date} {item.end_date ? `- ${item.end_date}` : ""} {item.issue_date}
                          </span>
                        )}
                      </div>

                      {(item.company || item.degree || item.organization) && (
                        <p className="text-[10px] font-medium text-slate-500 italic">
                          {item.company || item.organization} {item.degree ? `— ${item.degree} (${item.field_of_study})` : ""}
                        </p>
                      )}

                      {item.bullets && item.bullets.length > 0 ? (
                        <ul className="list-disc pl-4 text-[9.5px] text-slate-600 space-y-0.5">
                          {item.bullets.map((b: string, i: number) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      ) : item.description ? (
                        <p className="text-[9.5px] text-slate-600 leading-normal pl-2 border-l border-slate-100 whitespace-pre-line">
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
