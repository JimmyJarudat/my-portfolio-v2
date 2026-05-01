// src/services/trackingService.ts
import { supabase } from '@/lib/supabase'

const SESSION_KEY = 'pv_tracked'

// ─── Record a page view (once per session per path) ───────────────────────────
export async function trackPageView(path: string): Promise<void> {
  const key = `${SESSION_KEY}:${path}`
  if (sessionStorage.getItem(key)) return   // already tracked this session

  const { error } = await supabase
    .from('page_views')
    .insert({ path })

  if (!error) sessionStorage.setItem(key, '1')
}

// ─── Query helpers ────────────────────────────────────────────────────────────

export interface DailyStat {
  date: string   // "YYYY-MM-DD"
  visits: number
}

export interface TopPage {
  path: string
  visits: number
}

export interface OverviewStats {
  today: number
  thisMonth: number
  thisYear: number
  total: number
}

/** visits รายวัน N วันล่าสุด */
export async function getDailyStats(days = 30): Promise<DailyStat[]> {
  const since = new Date()
  since.setDate(since.getDate() - (days - 1))
  since.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('page_views')
    .select('visited_at')
    .gte('visited_at', since.toISOString())
    .order('visited_at', { ascending: true })

  if (error) throw error

  // group by date client-side
  const map: Record<string, number> = {}

  // fill all dates with 0 first
  for (let i = 0; i < days; i++) {
    const d = new Date(since)
    d.setDate(since.getDate() + i)
    map[toDateStr(d)] = 0
  }

  for (const row of data ?? []) {
    const d = toDateStr(new Date(row.visited_at))
    if (d in map) map[d]++
  }

  return Object.entries(map).map(([date, visits]) => ({ date, visits }))
}

/** top pages ทั้งหมด */
export async function getTopPages(limit = 10): Promise<TopPage[]> {
  const { data, error } = await supabase
    .from('page_views')
    .select('path')

  if (error) throw error

  const map: Record<string, number> = {}
  for (const row of data ?? []) {
    map[row.path] = (map[row.path] ?? 0) + 1
  }

  return Object.entries(map)
    .map(([path, visits]) => ({ path, visits }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, limit)
}

/** today / this month / this year / total */
export async function getOverviewStats(): Promise<OverviewStats> {
  const { data, error } = await supabase
    .from('page_views')
    .select('visited_at')

  if (error) throw error

  const now   = new Date()
  const today = toDateStr(now)
  const ym    = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const year  = String(now.getFullYear())

  let todayCount = 0, monthCount = 0, yearCount = 0

  for (const row of data ?? []) {
    const d = toDateStr(new Date(row.visited_at))
    if (d === today) todayCount++
    if (d.startsWith(ym)) monthCount++
    if (d.startsWith(year)) yearCount++
  }

  return {
    today:     todayCount,
    thisMonth: monthCount,
    thisYear:  yearCount,
    total:     data?.length ?? 0,
  }
}

// ─── util ─────────────────────────────────────────────────────────────────────
function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}