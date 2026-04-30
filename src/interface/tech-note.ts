// ─── Types ────────────────────────────────────────────────────────────────────
interface NoteSection {
  heading: string;
  body: string;
  image?: string;
  imageCaption?: string;
  isCallout?: boolean;
}

interface Note {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  tags: string[];
  date: string;
  readTime: string;
  heroImage?: string;
  heroCaption?: string;
  sections: NoteSection[];
}