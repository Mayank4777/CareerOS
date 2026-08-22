// Comprehensive IT & Software Engineering Skills List with Canonical Capitalization

export const IT_SKILLS = [
  // Programming Languages
  "Python",
  "JavaScript",
  "TypeScript",
  "Java",
  "C++",
  "C#",
  "C",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "R",
  "MATLAB",
  "Dart",
  "Scala",
  "Perl",
  "Shell",
  "Bash",
  "PowerShell",
  "HTML5",
  "CSS3",
  "SQL",
  "PL/SQL",
  "T-SQL",
  "GraphQL",
  "Assembly",
  "Haskell",
  "Elixir",
  "Erlang",
  "Lua",
  "Julia",
  "Groovy",
  "Objective-C",
  "F#",
  "Clojure",
  "VHDL",
  "Verilog",
  "Solidity",

  // Data Science, Machine Learning & AI
  "Pandas",
  "PyTorch",
  "TensorFlow",
  "Keras",
  "Scikit-learn",
  "NumPy",
  "SciPy",
  "OpenCV",
  "Hugging Face",
  "LangChain",
  "LlamaIndex",
  "OpenAI API",
  "Ollama",
  "Machine Learning",
  "Deep Learning",
  "Natural Language Processing",
  "Computer Vision",
  "Data Analysis",
  "Data Engineering",
  "Apache Spark",
  "Airflow",
  "Databricks",
  "Snowflake",
  "BigQuery",
  "Dbt",
  "Jupyter",
  "Jupyter Notebook",

  // Web Frontend Frameworks & Libraries
  "React",
  "Next.js",
  "Vue.js",
  "Nuxt.js",
  "Angular",
  "Svelte",
  "SvelteKit",
  "Redux",
  "Redux Toolkit",
  "Zustand",
  "MobX",
  "Tailwind CSS",
  "Bootstrap",
  "Material UI",
  "Chakra UI",
  "Ant Design",
  "Shadcn UI",
  "Styled Components",
  "Sass",
  "LESS",
  "Vite",
  "Webpack",
  "Babel",
  "jQuery",
  "Alpine.js",
  "Ember.js",
  "Backbone.js",
  "HTMX",
  "WebAssembly",
  "PWA",
  "WebSockets",
  "Three.js",
  "D3.js",

  // Web Backend Frameworks & Runtimes
  "Node.js",
  "Express.js",
  "NestJS",
  "Django",
  "Flask",
  "FastAPI",
  "Ruby on Rails",
  "Spring",
  "Spring Boot",
  "ASP.NET Core",
  "Laravel",
  "Symfony",
  "CodeIgniter",
  "Gin",
  "Fiber",
  "Echo",
  "Phoenix",
  "Fastify",
  "Koa",
  "RESTful APIs",
  "Microservices",
  "Celery",
  "RabbitMQ",
  "Apache Kafka",

  // Databases & Caching
  "PostgreSQL",
  "MySQL",
  "MariaDB",
  "SQLite",
  "MongoDB",
  "Redis",
  "Elasticsearch",
  "DynamoDB",
  "Cassandra",
  "Neo4j",
  "Oracle Database",
  "Microsoft SQL Server",
  "Supabase",
  "Firebase",
  "Realm",
  "ArangoDB",
  "CouchDB",
  "InfluxDB",
  "CockroachDB",
  "TimescaleDB",
  "Memcached",

  // DevOps & Cloud Platform
  "AWS",
  "Amazon Web Services",
  "Microsoft Azure",
  "Google Cloud Platform",
  "GCP",
  "Docker",
  "Kubernetes",
  "Terraform",
  "Ansible",
  "Jenkins",
  "GitHub Actions",
  "GitLab CI/CD",
  "CircleCI",
  "Helm",
  "ArgoCD",
  "Prometheus",
  "Grafana",
  "ELK Stack",
  "Nginx",
  "Apache",
  "Cloudflare",
  "Vercel",
  "Netlify",
  "DigitalOcean",
  "Heroku",
  "OpenShift",
  "Podman",

  // Mobile & Cross-Platform
  "React Native",
  "Flutter",
  "iOS Development",
  "Android Development",
  "Jetpack Compose",
  "SwiftUI",
  "Expo",
  "Ionic",
  "Cordova",

  // Testing & Quality Assurance
  "Jest",
  "Vitest",
  "React Testing Library",
  "Cypress",
  "Playwright",
  "Selenium",
  "JUnit",
  "PyTest",
  "Mocha",
  "Chai",
  "Postman",
  "SonarQube",

  // Tools, Security & Concepts
  "Git",
  "GitHub",
  "GitLab",
  "Bitbucket",
  "VS Code",
  "IntelliJ IDEA",
  "PyCharm",
  "WebStorm",
  "Jira",
  "Confluence",
  "Figma",
  "Linux",
  "Windows",
  "macOS",
  "System Design",
  "Agile",
  "Scrum",
  "CI/CD",
  "Cybersecurity",
  "Ethical Hacking",
  "Penetration Testing",
  "Wireshark",
  "OWASP",
];

// Fast lookup map for lowercased skill name -> exact canonical spelling
export const IT_SKILLS_CANONICAL_MAP = new Map<string, string>();

IT_SKILLS.forEach((skill) => {
  IT_SKILLS_CANONICAL_MAP.set(skill.toLowerCase(), skill);
});

/**
 * Normalizes skill capitalization:
 * - If skill is in known IT skills map, return its exact canonical spelling (e.g. "javascript" -> "JavaScript", "postgresql" -> "PostgreSQL", "next.js" -> "Next.js").
 * - Otherwise for custom skills, capitalize the first letter of each word (e.g. "career coaching" -> "Career Coaching", "python" -> "Python").
 */
export function normalizeSkillName(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  const lower = trimmed.toLowerCase();
  if (IT_SKILLS_CANONICAL_MAP.has(lower)) {
    return IT_SKILLS_CANONICAL_MAP.get(lower)!;
  }

  // Capitalize first letter of each word for custom skills
  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (!word) return "";
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Filters skills based on typed prefix (case-insensitive).
 * Example:
 * - "p" -> ["Pandas", "Perl", "PHP", "PL/SQL", "Playwright", "Podman", "PostgreSQL", "Postman", "PowerShell", "Prometheus", "PyCharm", "PyTest", "Python", "PyTorch", ...]
 * - "py" -> ["PyCharm", "PyTest", "Python", "PyTorch"]
 */
export function getSkillSuggestions(input: string): string[] {
  const query = input.trim().toLowerCase();
  if (!query) return [];

  return IT_SKILLS.filter((skill) =>
    skill.toLowerCase().startsWith(query)
  );
}
