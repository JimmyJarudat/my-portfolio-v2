const FILTERS = ["ALL", "LIVE", "CLIENT", "INTERNAL", "SAAS"] as const;
type Filter = (typeof FILTERS)[number];


interface ProjectText {
  th: string;
  en: string;
}

interface Project {
  id: number;
  index: string;
  title: string;
  subtitle: string;
  overview: ProjectText;
  tags: Filter[];
  techStack: string[];
  architecture: ProjectText;
  infrastructure: string;
  challenges: ProjectText;
  liveUrl?: string;
  githubUrl?: string;
  videoUrl?: string;
  images: string[];
  year: number;
  status: "live" | "internal" | "client";
}