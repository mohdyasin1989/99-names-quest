import { NAMES } from '../data/names'

const TOTAL = NAMES.length // 99

export const MIN_PACE = 1
export const MAX_PACE = 15

// Keep the daily pace sensible for children (1..15 names a day).
export function clampPace(n: number): number {
  if (!Number.isFinite(n)) return 3
  return Math.max(MIN_PACE, Math.min(MAX_PACE, Math.round(n)))
}

// The next batch of brand-new names to introduce, based on how many are
// already introduced. Names are introduced strictly in order (1..99).
export function nextBatch(introducedCount: number, namesPerDay: number): number[] {
  const start = Math.max(0, Math.min(TOTAL, introducedCount))
  const pace = clampPace(namesPerDay)
  const end = Math.min(TOTAL, start + pace)
  const ids: number[] = []
  for (let i = start; i < end; i++) ids.push(NAMES[i].id)
  return ids
}

// How many more daily lessons remain at the current pace.
export function lessonsRemaining(introducedCount: number, namesPerDay: number): number {
  const left = TOTAL - Math.min(TOTAL, introducedCount)
  if (left <= 0) return 0
  return Math.ceil(left / clampPace(namesPerDay))
}

// Rough total number of days to finish all 99 at a given pace.
export function estimatedTotalDays(namesPerDay: number): number {
  return Math.ceil(TOTAL / clampPace(namesPerDay))
}

export function totalNames(): number {
  return TOTAL
}
