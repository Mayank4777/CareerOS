import type {
  AlertLevel,
  ImprovementIssue,
  ResumeBuilderData,
  SectionImprovement,
  SkillItem,
} from "../types/resume-builder";

const ACTION_VERBS = new Set([
  "architected", "engineered", "spearheaded", "developed", "built", "designed",
  "implemented", "optimised", "optimized", "scaled", "led", "automated",
  "refactored", "delivered", "deployed", "improved", "launched", "reduced", "increased"
]);

const METRIC_PATTERNS = [
  /\d+(\.\d+)?%/, // percentages (e.g. 35%)
  /\$\d+(?:,\d{3})*(?:\.\d+)?\b/, // dollar amounts (e.g. $50,000)
  /\b\d+\s*(?:k|m|million|billion)\b/i, // scale metrics (e.g. 50k, 10M)
  /\b(reduced|reducing|decreased|increased|increasing|improved|grew|saved|achieved)\b.{1,30}?\b\d+/i,
  /\b\d+\s*(x|times)\b/i,
];

const TARGET_ROLE_SKILL_MAP: Record<string, string[]> = {
  frontend: ["react", "javascript", "typescript", "html", "css", "tailwind", "next.js", "nextjs", "vue", "angular", "redux", "vite", "webpack", "ui/ux", "frontend"],
  backend: ["python", "node.js", "nodejs", "java", "go", "golang", "c#", "django", "flask", "fastapi", "express", "postgresql", "mysql", "redis", "mongodb", "graphql", "rest api", "docker", "microservices"],
  fullstack: ["react", "node.js", "typescript", "javascript", "python", "postgresql", "rest api", "html", "css", "docker", "next.js", "express"],
  data: ["python", "sql", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "power bi", "tableau", "spark", "r", "machine learning", "data visualization"],
};

export function evaluateResumeImprovements(data: ResumeBuilderData): SectionImprovement[] {
  const improvements: SectionImprovement[] = [];

  // 1. Personal Information
  const personalIssues: ImprovementIssue[] = [];
  if (!data.personal.phone) {
    personalIssues.push({
      id: "personal-phone",
      message: "Phone number is missing. Adding contact phone helps recruiters reach you quickly.",
      severity: "critical",
      field: "phone",
    });
  }
  if (!data.personal.email) {
    personalIssues.push({
      id: "personal-email",
      message: "Email address is missing from header.",
      severity: "critical",
      field: "email",
    });
  }
  if (!data.personal.linkedin && !data.personal.github && !data.personal.website) {
    personalIssues.push({
      id: "personal-links",
      message: "Professional links (LinkedIn or GitHub) are missing. Adding profile links builds trust.",
      severity: "medium",
      field: "linkedin",
    });
  }

  improvements.push({
    sectionKey: "personal",
    title: "Personal Information",
    level: getAlertLevel(personalIssues),
    issues: personalIssues,
  });

  // 2. Summary
  const summaryIssues: ImprovementIssue[] = [];
  const summaryText = data.summary.trim();
  if (!summaryText) {
    summaryIssues.push({
      id: "summary-missing",
      message: "Professional summary statement is missing.",
      severity: "critical",
      suggestion: `Driven ${data.targetRole || "Software Engineer"} specializing in responsive web applications and clean software architecture.`,
    });
  } else if (summaryText.length < 40) {
    summaryIssues.push({
      id: "summary-short",
      message: "Summary statement is too brief. Expand on your core technical background and target focus.",
      severity: "medium",
    });
  } else if (data.targetRole) {
    const roleWords = data.targetRole.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const hasRoleMatch = roleWords.some((w) => summaryText.toLowerCase().includes(w));
    if (!hasRoleMatch) {
      summaryIssues.push({
        id: "summary-role-relevance",
        message: `Summary does not explicitly mention your target role '${data.targetRole}'.`,
        severity: "medium",
        suggestion: `Highlight experience aligned with ${data.targetRole}.`,
      });
    }
  }

  improvements.push({
    sectionKey: "summary",
    title: "Professional Summary",
    level: getAlertLevel(summaryIssues),
    issues: summaryIssues,
  });

  // 3. Experience
  const expIssues: ImprovementIssue[] = [];
  if (data.experience.length === 0) {
    expIssues.push({
      id: "exp-empty",
      message: "No work experience entries recorded.",
      severity: "critical",
    });
  } else {
    let weakBulletsCount = 0;
    let missingMetricsCount = 0;

    data.experience.forEach((entry, idx) => {
      if (!entry.title || !entry.company) {
        expIssues.push({
          id: `exp-${idx}-title`,
          message: `Work entry #${idx + 1} is missing job title or company name.`,
          severity: "critical",
        });
      }

      const allBullets = entry.bullets.length > 0 ? entry.bullets : [entry.description];
      allBullets.forEach((bullet) => {
        if (!bullet) return;
        const words = bullet.toLowerCase().match(/\b[a-z]+\b/g) || [];
        const hasVerb = words.some((w) => ACTION_VERBS.has(w));
        if (!hasVerb && words.length > 3) {
          weakBulletsCount++;
        }
        const hasMetric = METRIC_PATTERNS.some((pat) => pat.test(bullet));
        if (!hasMetric) {
          missingMetricsCount++;
        }
      });
    });

    if (weakBulletsCount > 0) {
      expIssues.push({
        id: "exp-weak-bullets",
        message: `${weakBulletsCount} experience bullet(s) start with weak or passive verbs. Use strong action verbs (e.g., Architected, Engineered, Spearheaded).`,
        severity: "medium",
      });
    }
    if (missingMetricsCount > 0 && data.experience.some((e) => (e.bullets.length || e.description))) {
      expIssues.push({
        id: "exp-missing-metrics",
        message: "Experience bullet points lack quantifiable metrics (e.g. percentages, team sizes, efficiency gains).",
        severity: "medium",
      });
    }
  }

  improvements.push({
    sectionKey: "experience",
    title: "Work Experience",
    level: getAlertLevel(expIssues),
    issues: expIssues,
  });

  // 4. Projects
  const projIssues: ImprovementIssue[] = [];
  if (data.projects.length === 0) {
    projIssues.push({
      id: "proj-missing-warning",
      message: "Projects are missing — adding 1–2 relevant projects would strengthen this resume.",
      severity: "medium",
    });
  } else {
    data.projects.forEach((proj, idx) => {
      if (!proj.description && proj.bullets.length === 0) {
        projIssues.push({
          id: `proj-${idx}-desc`,
          message: `Project '${proj.title}' is missing a detailed description and technologies used.`,
          severity: "medium",
        });
      }
    });
  }

  improvements.push({
    sectionKey: "projects",
    title: "Projects",
    level: getAlertLevel(projIssues),
    issues: projIssues,
  });

  // 5. Skills
  const skillIssues: ImprovementIssue[] = [];
  if (data.skills.length === 0) {
    skillIssues.push({
      id: "skill-empty",
      message: "No technical skills listed. Skills are essential for ATS keyword matching.",
      severity: "critical",
    });
  } else if (data.targetRole) {
    const reorderResult = evaluateSkillRelevance(data.skills, data.targetRole);
    if (reorderResult.hasMisordering) {
      skillIssues.push({
        id: "skill-ordering",
        message: `Skills ordering can be optimized for '${data.targetRole}'. Core skills like ${reorderResult.recommendedOrder.slice(0, 3).join(", ")} should appear first.`,
        severity: "medium",
      });
    }
  }

  improvements.push({
    sectionKey: "skills",
    title: "Skills & Expertise",
    level: getAlertLevel(skillIssues),
    issues: skillIssues,
  });

  // 6. Education
  const eduIssues: ImprovementIssue[] = [];
  if (data.education.length === 0) {
    eduIssues.push({
      id: "edu-empty",
      message: "No education entries recorded.",
      severity: "critical",
    });
  }

  improvements.push({
    sectionKey: "education",
    title: "Education",
    level: getAlertLevel(eduIssues),
    issues: eduIssues,
  });

  return improvements;
}

export function evaluateSkillRelevance(
  skills: SkillItem[],
  targetRole: string
): {
  recommendedOrder: string[];
  lessRelevantOrder: string[];
  hasMisordering: boolean;
} {
  const roleLower = targetRole.toLowerCase();
  let roleKeywords: string[] = [];

  for (const [key, keywords] of Object.entries(TARGET_ROLE_SKILL_MAP)) {
    if (roleLower.includes(key)) {
      roleKeywords = roleKeywords.concat(keywords);
    }
  }

  if (roleKeywords.length === 0) {
    roleKeywords = roleLower.split(/\s+/).filter((w) => w.length > 2);
  }

  const recommended: SkillItem[] = [];
  const lessRelevant: SkillItem[] = [];

  skills.forEach((sk) => {
    const nameLower = sk.name.toLowerCase();
    const isTargetRelevant = roleKeywords.some((kw) => nameLower === kw || nameLower.includes(kw));
    if (isTargetRelevant) {
      recommended.push(sk);
    } else {
      lessRelevant.push(sk);
    }
  });

  // Check if less relevant skill currently appears before a recommended target role skill
  let hasMisordering = false;
  if (recommended.length > 0 && lessRelevant.length > 0) {
    const recommendedFirstIndex = skills.findIndex((s) => recommended.some((r) => r.id === s.id));
    const lessRelevantFirstIndex = skills.findIndex((s) => lessRelevant.some((l) => l.id === s.id));
    if (lessRelevantFirstIndex >= 0 && lessRelevantFirstIndex < recommendedFirstIndex) {
      hasMisordering = true;
    }
  }

  return {
    recommendedOrder: recommended.map((s) => s.name),
    lessRelevantOrder: lessRelevant.map((s) => s.name),
    hasMisordering,
  };
}

export function reorderSkillsForTargetRole(skills: SkillItem[], targetRole: string): SkillItem[] {
  const { recommendedOrder } = evaluateSkillRelevance(skills, targetRole);
  const recSet = new Set(recommendedOrder.map((s) => s.toLowerCase()));

  const recSkills: SkillItem[] = [];
  const otherSkills: SkillItem[] = [];

  skills.forEach((sk) => {
    if (recSet.has(sk.name.toLowerCase())) {
      recSkills.push(sk);
    } else {
      otherSkills.push(sk);
    }
  });

  return [...recSkills, ...otherSkills];
}

function getAlertLevel(issues: ImprovementIssue[]): AlertLevel {
  if (issues.some((i) => i.severity === "critical")) {
    return "RED";
  }
  if (issues.some((i) => i.severity === "medium")) {
    return "AMBER";
  }
  return "GREEN";
}
