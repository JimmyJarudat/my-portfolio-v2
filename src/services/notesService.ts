// src/services/notesService.ts
import { supabase } from '@/lib/supabase'

export async function getNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select(`
      id,
      slug,
      title,
      title_en,
      subtitle,
      subtitle_en,
      tags,
      note_year,
      read_time,
      hero_image,
      hero_caption,
      hero_caption_en,
      sections:note_sections (
        id,
        section_order,
        heading,
        heading_en,
        body,
        body_en,
        is_callout,
        image,
        image_caption
      )
    `)
    .order('id', { ascending: true })
    .order('section_order', {
      foreignTable: 'note_sections',
      ascending: true,
    })

  if (error) throw error

  return (data ?? []).map((note: any) => ({
    id: note.id,
    slug: note.slug,
    title: note.title,
    titleEn: note.title_en,
    subtitle: note.subtitle,
    subtitleEn: note.subtitle_en,
    tags: note.tags ?? [],
    date: note.note_year,
    readTime: note.read_time,
    heroImage: note.hero_image,
    heroCaption: note.hero_caption,
    heroCaptionEn: note.hero_caption_en,
    sections: (note.sections ?? []).map((section: any) => ({
      heading: section.heading,
      headingEn: section.heading_en,
      body: section.body,
      bodyEn: section.body_en,
      isCallout: section.is_callout,
      image: section.image,
      imageCaption: section.image_caption,
    })),
  }))
}
