/**
 * composables/usePerenual.ts
 *
 * Wraps the Perenual Plant API  https://perenual.com/docs/api
 * Get a FREE key at https://perenual.com/docs/api  (300 req/day on free tier)
 * Set it in .env:  NUXT_PUBLIC_PERENUAL_KEY=sk-YOUR_KEY
 *
 * Relevant endpoints used:
 * GET /api/species-list      – search plants (returns flower colour + blooming season)
 * GET /api/species/detail/{id} – richer single-plant detail
 */

const BASE = 'https://perenual.com/api'

// Perenual returns season strings like "Spring", "Summer", "Late Spring", etc.
// Map them to month ranges for the calendar
export const SEASON_MONTHS: Record<string, number[]> = {
  'early spring':  [3],
  'spring':        [3, 4, 5],
  'mid spring':    [4],
  'late spring':   [5],
  'early summer':  [6],
  'summer':        [6, 7, 8],
  'mid summer':    [7],
  'late summer':   [8],
  'early fall':    [9],
  'fall':          [9, 10, 11],
  'mid fall':      [10],
  'late fall':     [11],
  'winter':        [12, 1, 2],
  'early winter':  [12],
  'mid winter':    [1],
  'late winter':   [2],
  'year-round':    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
}

export function seasonToMonths(season: string | null | undefined): number[] {
  if (!season) return []
  const key = season.toLowerCase().trim()
  return SEASON_MONTHS[key] ?? []
}

// Perenual flower colours → CSS-friendly hex approximations
export const FLOWER_COLOUR_MAP: Record<string, string> = {
  red:       '#e05252',
  orange:    '#e88c3e',
  yellow:    '#e8cc4e',
  lime:      '#b5cc4e',
  green:     '#5a9e5a',
  blue:      '#5a85c8',
  purple:    '#9b6abe',
  pink:      '#e07aaa',
  white:     '#f5f0e8',
  cream:     '#e8dfc0',
  lavender:  '#b8a8d8',
  violet:    '#7a5ab8',
  maroon:    '#8b2252',
  brown:     '#9a7045',
  black:     '#3a3030',
  multicolored: '#e8884e',
}

export function colourToHex(colour: string): string {
  return FLOWER_COLOUR_MAP[colour.toLowerCase()] ?? '#c2d4bc'
}

/** Search plants by name/keyword */
export async function searchPlants(query: string, apiKey: string, page = 1) {
  const url = `${BASE}/species-list?key=${apiKey}&q=${encodeURIComponent(query)}&page=${page}`
  const res = await $fetch<PerenualSearchResponse>(url)
  return res
}

/** Fetch single plant details */
export async function fetchPlantDetail(id: number, apiKey: string) {
  const url = `${BASE}/species/details/${id}?key=${apiKey}`
  const res = await $fetch<PerenualPlantDetail>(url)
  return res
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface PerenualSearchResult {
  id: number
  common_name: string
  scientific_name: string[]
  cycle: string
  watering: string
  sunlight: string[]
  default_image: { small_url?: string; medium_url?: string; thumbnail?: string } | null
  // These come from detail endpoint but sometimes appear in list too
  flowering_season?: string | null
  flower_color?: string | null
}

export interface PerenualSearchResponse {
  data: PerenualSearchResult[]
  to: number
  per_page: number
  current_page: number
  last_page: number
  total: number
}

export interface PerenualPlantDetail extends PerenualSearchResult {
  flowering_season: string | null
  flower_color: string | null
  description: string | null
  origin: string[]
  growth_rate: string
  hardiness: { min: string; max: string }
}

// ── Garden Plant (enriched, local) ─────────────────────────────────────────

export interface GardenPlant {
  id: number
  common_name: string
  scientific_name: string
  cycle: string
  image: string | null
  flowering_season: string | null
  flower_color: string | null
  /** Parsed from flowering_season → month numbers 1-12 */
  bloom_months: number[]
  /** Parsed colours as hex strings */
  hex_colours: string[]
  /** User-supplied nickname / location in garden */
  nickname?: string
}

export function toGardenPlant(detail: PerenualPlantDetail): GardenPlant {
  const rawColours = detail.flower_color
    ? detail.flower_color.split(',').map(c => c.trim()).filter(Boolean)
    : []

  return {
    id: detail.id,
    common_name: detail.common_name,
    scientific_name: detail.scientific_name?.[0] ?? '',
    cycle: detail.cycle,
    image: detail.default_image?.medium_url ?? detail.default_image?.thumbnail ?? null,
    flowering_season: detail.flowering_season ?? null,
    flower_color: detail.flower_color ?? null,
    bloom_months: seasonToMonths(detail.flowering_season),
    hex_colours: rawColours.length ? rawColours.map(colourToHex) : ['#c2d4bc'],
    nickname: '',
  }
}
