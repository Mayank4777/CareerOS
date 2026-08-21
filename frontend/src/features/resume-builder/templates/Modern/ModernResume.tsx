import React from "react";
import type { ResumeBuilderData } from "../../types/resume-builder";
import "./modern-resume.css";

interface ModernResumeProps {
  data: ResumeBuilderData;
}

export function ModernResume({ data }: ModernResumeProps) {
  const { personal, summary, experience, education, projects, skills, certifications } = data;

  return (
    <div id="resume-preview-document" className="resume-document-page shadow-2xl rounded-sm">
      {/* HEADER */}
      <header className="resume-header">
        <h1 className="resume-name">{personal.fullName || "Your Full Name"}</h1>
        {personal.headline && <div className="resume-headline">{personal.headline}</div>}

        <div className="resume-contact-bar">
          {personal.email && (
            <span className="resume-contact-item">
              ✉ {personal.email}
            </span>
          )}
          {personal.phone && (
            <span className="resume-contact-item">
              ☎ {personal.phone}
            </span>
          )}
          {personal.location && (
            <span className="resume-contact-item">
              📍 {personal.location}
            </span>
          )}
          {personal.linkedin && (
            <span className="resume-contact-item">
              🔗 {personal.linkedin.replace(/^https?:\/\//, "")}
            </span>
          )}
          {personal.github && (
            <span className="resume-contact-item">
              💻 {personal.github.replace(/^https?:\/\//, "")}
            </span>
          )}
          {personal.website && (
            <span className="resume-contact-item">
              🌐 {personal.website.replace(/^https?:\/\//, "")}
            </span>
          )}
        </div>
      </header>

      {/* SUMMARY */}
      {summary && (
        <section className="resume-section">
          <h2 className="resume-section-title">Professional Summary</h2>
          <p className="resume-summary-text">{summary}</p>
        </section>
      )}

      {/* EXPERIENCE */}
      {experience.length > 0 && (
        <section className="resume-section">
          <h2 className="resume-section-title">Work Experience</h2>
          {experience.map((exp) => (
            <div key={exp.id} className="resume-item">
              <div className="resume-item-header">
                <div>
                  <span className="resume-item-title">{exp.title}</span>
                  {exp.company && <span className="resume-item-company"> — {exp.company}</span>}
                  {exp.location && <span className="text-gray-500 text-xs font-normal"> ({exp.location})</span>}
                </div>
                <div className="resume-item-dates">
                  {exp.startDate} – {exp.endDate}
                </div>
              </div>
              {exp.bullets.length > 0 ? (
                <ul className="resume-bullets">
                  {exp.bullets.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              ) : (
                exp.description && <p className="resume-summary-text mt-1">{exp.description}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* TECHNICAL SKILLS */}
      {skills.length > 0 && (
        <section className="resume-section">
          <h2 className="resume-section-title">Technical Skills</h2>
          <div className="resume-skills-grid">
            {skills.map((skill) => (
              <span key={skill.id} className="resume-skill-tag">
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* PROJECTS */}
      {projects.length > 0 && (
        <section className="resume-section">
          <h2 className="resume-section-title">Projects</h2>
          {projects.map((proj) => (
            <div key={proj.id} className="resume-item">
              <div className="resume-item-header">
                <div>
                  <span className="resume-item-title">{proj.title}</span>
                  {proj.organization && (
                    <span className="resume-item-company"> | {proj.organization}</span>
                  )}
                </div>
                {proj.technologies && (
                  <span className="text-xs font-semibold text-blue-600">
                    [{proj.technologies}]
                  </span>
                )}
              </div>
              {proj.bullets.length > 0 ? (
                <ul className="resume-bullets">
                  {proj.bullets.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              ) : (
                proj.description && <p className="resume-summary-text mt-1">{proj.description}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* EDUCATION */}
      {education.length > 0 && (
        <section className="resume-section">
          <h2 className="resume-section-title">Education</h2>
          {education.map((edu) => (
            <div key={edu.id} className="resume-item">
              <div className="resume-item-header">
                <div>
                  <span className="resume-item-title">{edu.degree}</span>
                  {edu.fieldOfStudy && (
                    <span className="resume-item-company"> in {edu.fieldOfStudy}</span>
                  )}
                  {edu.institution && (
                    <div className="text-xs text-gray-700 font-medium">{edu.institution}</div>
                  )}
                </div>
                <div className="resume-item-dates">
                  {edu.startDate} – {edu.endDate}
                  {edu.grade && <span className="ml-2 font-semibold text-gray-800">| Grade: {edu.grade}</span>}
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* CERTIFICATIONS */}
      {certifications.length > 0 && (
        <section className="resume-section">
          <h2 className="resume-section-title">Certifications</h2>
          {certifications.map((cert) => (
            <div key={cert.id} className="text-xs mb-1">
              <span className="font-bold">{cert.name}</span>
              {cert.organization && <span> — {cert.organization}</span>}
              {cert.issueDate && <span className="text-gray-500"> ({cert.issueDate})</span>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
