import type { ResumeTemplateProps } from "./types";
import { getNormalizedResumeData } from "./types";

export function AtsTemplate(props: ResumeTemplateProps) {
  const data = getNormalizedResumeData(props);
  const info = data.personal_info || {};
  const summary = data.summary;
  const sections = data.sections || [];

  const contactItems = [];
  if (info.phone) contactItems.push(<span key="phone">{info.phone}</span>);
  if (info.email) {
    contactItems.push(
      <a key="email" href={`mailto:${info.email}`} className="text-[#1d4ed8] hover:underline font-medium">
        {info.email}
      </a>
    );
  }
  if (info.linkedin) {
    contactItems.push(
      <a key="linkedin" href={info.linkedin.startsWith("http") ? info.linkedin : `https://${info.linkedin}`} target="_blank" rel="noreferrer" className="text-[#1d4ed8] hover:underline font-medium">
        LinkedIn
      </a>
    );
  }
  if (info.github) {
    contactItems.push(
      <a key="github" href={info.github.startsWith("http") ? info.github : `https://${info.github}`} target="_blank" rel="noreferrer" className="text-[#1d4ed8] hover:underline font-medium">
        Github
      </a>
    );
  }
  if (info.website) {
    contactItems.push(
      <a key="website" href={info.website.startsWith("http") ? info.website : `https://${info.website}`} target="_blank" rel="noreferrer" className="text-[#1d4ed8] hover:underline font-medium">
        Portfolio
      </a>
    );
  }

  return (
    <div className="printable-resume flex min-h-full flex-col p-8 bg-white text-[#1f2937] font-['Poppins','Segoe_UI',sans-serif] text-[11px] leading-relaxed select-text">
      {/* Executive Header (Exact Replica of Reference PDF 2) */}
      <div className="text-center pb-2 mb-3">
        <h1 className="text-[28px] font-bold tracking-tight text-[#1e4b7a] uppercase leading-none font-['Poppins',sans-serif]">
          {info.full_name || props.resume.title}
        </h1>

        {info.headline ? (
          <p className="text-[11px] font-semibold text-[#475569] tracking-wider uppercase mt-1">
            {info.headline}
          </p>
        ) : null}

        {contactItems.length > 0 && (
          <div className="flex flex-wrap items-center justify-center pt-1.5 text-[10.5px] text-[#4b5563] gap-2 font-medium">
            {contactItems.map((item, idx) => (
              <span key={idx} className="flex items-center gap-2">
                {idx > 0 && <span className="text-slate-400">•</span>}
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Sections */}
      <div className="space-y-4 flex-1">
        {/* Professional Summary */}
        {summary ? (
          <div className="space-y-1">
            <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-[#1e4b7a] border-b-2 border-[#a9c4ea] pb-0.5 font-['Poppins',sans-serif]">
              PROFESSIONAL SUMMARY
            </h2>
            <p className="text-[10.5px] text-[#1f2937] leading-relaxed text-justify">{summary}</p>
          </div>
        ) : null}

        {/* Dynamic Sections */}
        {sections
          .filter((sec: any) => sec.visible !== false && sec.items && sec.items.length > 0)
          .map((sec: any) => (
            <div key={sec.key || sec.title} className="space-y-2">
              <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-[#1e4b7a] border-b-2 border-[#a9c4ea] pb-0.5 font-['Poppins',sans-serif]">
                {sec.title}
              </h2>

              <div className="space-y-3">
                {sec.items?.map((item: any, idx: number) => {
                  /* Skills section (Executive Categorized Inline Pair Layout) */
                  if (sec.key === "skills") {
                    return (
                      <div key={idx} className="text-[10px] text-slate-800 py-0.5 border-b border-slate-50/50">
                        <strong className="text-[#0f172a] font-bold">{item.category}: </strong>
                        <span className="text-slate-700 font-normal">
                          {Array.isArray(item.skills) ? item.skills.join(", ") : item.skills}
                        </span>
                      </div>
                    );
                  }

                  /* Experience / Projects / Education / Achievements */
                  return (
                    <div key={idx} className="space-y-1">
                      {/* Title & Date */}
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="font-bold text-[#0f172a] text-[11px]">
                          {item.title || item.institution || item.name}
                        </span>
                        {(item.date_range || item.year_range || item.start_date || item.end_date || item.date || item.grade) && (
                          <span className="text-[10px] text-slate-500 font-semibold italic whitespace-nowrap text-right shrink-0">
                            {item.date_range || item.year_range || item.date || `${item.start_date} ${item.end_date ? `– ${item.end_date}` : ""}`}
                            {item.grade ? <strong className="not-italic text-[#1d4ed8] ml-2 font-bold">{item.grade}</strong> : null}
                          </span>
                        )}
                      </div>

                      {/* Subheading (Company / Degree / Stack) */}
                      {(item.company || item.degree || item.technologies || item.role) && (
                        <p className="text-[10px] text-slate-600 italic font-medium">
                          {item.company ? (
                            <>
                              <span className="text-[#1d4ed8] font-bold not-italic">{item.company}</span>
                              {item.role ? ` | ${item.role}` : ""}
                            </>
                          ) : null}

                          {item.degree ? (
                            <span>
                              {item.degree} {item.institution ? `— ${item.institution}` : ""} {item.field_of_study ? `(${item.field_of_study})` : ""}
                            </span>
                          ) : null}

                          {item.technologies ? (
                            <span>
                              <strong className="not-italic text-slate-700">Stack: </strong>
                              <span className="text-slate-600">{item.technologies}</span>
                            </span>
                          ) : null}
                        </p>
                      )}

                      {/* Bullet points */}
                      {item.bullets && item.bullets.length > 0 ? (
                        <ul className="list-disc pl-5 text-[9.5px] text-slate-700 space-y-1 text-justify">
                          {item.bullets.map((b: string, i: number) => (
                            <li key={i} className="leading-relaxed">{b}</li>
                          ))}
                        </ul>
                      ) : item.description ? (
                        <p className="text-[9.5px] text-slate-700 leading-relaxed text-justify">
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
