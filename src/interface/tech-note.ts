// ─── Types ────────────────────────────────────────────────────────────────────
interface NoteSection {
  heading: string;
  headingEn?: string;
  body: string;
  bodyEn?: string;
  image?: string;
  imageCaption?: string;
  isCallout?: boolean;
}

interface Note {
  id: number;
  slug: string;
  title: string;
  titleEn?: string;
  subtitle: string;
  subtitleEn?: string;
  tags: string[];
  date: string;
  readTime: string;
  heroImage?: string;
  heroCaption?: string;
  heroCaptionEn?: string;
  sections: NoteSection[];
}
