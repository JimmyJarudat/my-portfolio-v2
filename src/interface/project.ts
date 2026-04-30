const FILTERS = ["ALL", "LIVE", "CLIENT", "INTERNAL", "SAAS"] as const;
type Filter = (typeof FILTERS)[number];


interface Project {
  id: number;
  index: string;
  title: string;
  subtitle: string;
  overview: string;
  tags: Filter[];
  techStack: string[];
  architecture: string;
  infrastructure: string;
  challenges: string;
  liveUrl?: string;
  githubUrl?: string;
  videoUrl?: string;
  images: string[];
  year: number;
  status: "live" | "internal" | "client";
}