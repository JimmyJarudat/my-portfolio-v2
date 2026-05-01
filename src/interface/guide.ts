type Difficulty = "beginner" | "intermediate" | "advanced";
type Category = "infrastructure" | "docker-swarm" | "observability";

interface GuideStep {
    title: string;
    body: string;
    code?: string;
    lang?: string;
    note?: string;
    images?: { src: string; caption?: string }[];
}

interface Guide {
    id: number;
    slug: string;
    category: Category;
    title: string;
    description: string;
    difficulty: Difficulty;
    time: string;
    tags: string[];
    updated: string;
    steps: GuideStep[];
    prerequisites?: string[];
}