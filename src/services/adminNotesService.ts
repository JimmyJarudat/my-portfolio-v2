// src/services/adminNotesService.ts
import { supabase } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NoteSection {
  id?:           number
  section_order: number
  heading:       string
  body:          string
  is_callout:    boolean
  image:         string | null
  image_caption: string | null
}

export interface NoteRow {
  id?:          number
  slug:         string
  title:        string
  subtitle:     string
  tags:         string[]
  note_year:    string
  read_time:    string
  hero_image:   string | null
  hero_caption: string | null
  sections:     NoteSection[]
}

// ─── List (admin — same as public but with section id) ────────────────────────

export async function adminGetNotes(): Promise<NoteRow[]> {
  const { data, error } = await supabase
    .from('notes')
    .select(`
      id, slug, title, subtitle, tags,
      note_year, read_time, hero_image, hero_caption,
      sections:note_sections (
        id, section_order, heading, body,
        is_callout, image, image_caption
      )
    `)
    .order('id', { ascending: true })
    .order('section_order', { foreignTable: 'note_sections', ascending: true })

  if (error) throw error
  return (data ?? []) as NoteRow[]
}

// ─── Get single note ──────────────────────────────────────────────────────────

export async function adminGetNote(id: number): Promise<NoteRow> {
  const { data, error } = await supabase
    .from('notes')
    .select(`
      id, slug, title, subtitle, tags,
      note_year, read_time, hero_image, hero_caption,
      sections:note_sections (
        id, section_order, heading, body,
        is_callout, image, image_caption
      )
    `)
    .eq('id', id)
    .order('section_order', { foreignTable: 'note_sections', ascending: true })
    .single()

  if (error) throw error
  return data as NoteRow
}

// ─── Create note ──────────────────────────────────────────────────────────────

export async function adminCreateNote(note: Omit<NoteRow, 'id'>): Promise<number> {
  const { sections, ...noteFields } = note

  const { data, error } = await supabase
    .from('notes')
    .insert(noteFields)
    .select('id')
    .single()

  if (error) throw error

  const noteId = data.id

  if (sections.length > 0) {
    const { error: secErr } = await supabase
      .from('note_sections')
      .insert(sections.map((s, i) => ({ ...s, note_id: noteId, section_order: i + 1 })))
    if (secErr) throw secErr
  }

  return noteId
}

// ─── Update note ──────────────────────────────────────────────────────────────

export async function adminUpdateNote(id: number, note: NoteRow): Promise<void> {
  const { sections, ...noteFields } = note

  // 1. update notes row
  const { error } = await supabase
    .from('notes')
    .update({ ...noteFields })
    .eq('id', id)

  if (error) throw error

  // 2. delete existing sections then re-insert (simplest strategy)
  const { error: delErr } = await supabase
    .from('note_sections')
    .delete()
    .eq('note_id', id)

  if (delErr) throw delErr

  if (sections.length > 0) {
    const { error: secErr } = await supabase
      .from('note_sections')
      .insert(
        sections.map((s, i) => ({
          note_id:       id,
          section_order: i + 1,
          heading:       s.heading,
          body:          s.body,
          is_callout:    s.is_callout,
          image:         s.image,
          image_caption: s.image_caption,
        }))
      )
    if (secErr) throw secErr
  }
}

// ─── Delete note ──────────────────────────────────────────────────────────────

export async function adminDeleteNote(id: number): Promise<void> {
  // sections will cascade delete if FK is set, otherwise delete manually
  await supabase.from('note_sections').delete().eq('note_id', id)
  const { error } = await supabase.from('notes').delete().eq('id', id)
  if (error) throw error
}