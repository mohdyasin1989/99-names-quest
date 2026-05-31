import { NAMES } from '../data/names'

const TOTAL = NAMES.length // 99

export function clampPlanDays(days: number): number {
  if (!Number.isFinite(days)) return 30
  return Math.max(1, Math.min(TOTAL, Math.round(days)))
}

// Evenly distribute 99 names across the chosen number of days.
// Returns an array indexed by day (0-based) -> list of name IDs (1-based).
export function buildSchedule(planDays: number): number[][] {
  const days = clampPlanDays(planDays)
  const base = Math.floor(TOTAL / days)
  const remainder = TOTAL % days
  const schedule: number[][] = []
  let cursor = 1
  for (let d = 0; d < days; d++) {
    const count = base + (d < remainder ? 1 : 0)
    const ids: number[] = []
    for (let i = 0; i < count; i++) ids.push(cursor++)
    schedule.push(ids)
  }
  return schedule
}

export function namesForDay(planDays: number, day: number): number[] {
  const schedule = buildSchedule(planDays)
  return schedule[day - 1] ?? []
}

export function totalLessonDays(planDays: number): number {
  return buildSchedule(planDays).length
}
