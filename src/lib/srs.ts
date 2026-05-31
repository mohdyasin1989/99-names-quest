import type { NameProgress } from '../types'

const DAY = 24 * 60 * 60 * 1000

// Simplified Leitner-style spaced repetition.
// Box index -> days until next review.
export const INTERVALS = [1, 3, 7, 14, 30] // box 0..4 (box 5 = mastered, also 30)

export function newProgress(id: number): NameProgress {
  return {
    id,
    learned: false,
    mastery: 0,
    box: 0,
    nextReview: null,
    correctCount: 0,
    wrongCount: 0,
    lastSeen: null,
  }
}

export function intervalDays(box: number): number {
  if (box <= 0) return 1
  if (box - 1 < INTERVALS.length) return INTERVALS[box - 1]
  return 30
}

// Apply a review result and return the updated progress.
export function reviewName(p: NameProgress, correct: boolean, now = Date.now()): NameProgress {
  let box = p.box
  let mastery = p.mastery
  if (correct) {
    box = Math.min(box + 1, INTERVALS.length)
    mastery = Math.min(100, mastery + 20)
  } else {
    box = 1 // move back to the 1-day review bucket
    mastery = Math.max(0, mastery - 25)
  }
  const days = intervalDays(box)
  return {
    ...p,
    learned: true,
    box,
    mastery,
    nextReview: now + days * DAY,
    correctCount: p.correctCount + (correct ? 1 : 0),
    wrongCount: p.wrongCount + (correct ? 0 : 1),
    lastSeen: now,
  }
}

// Mark a brand new name as learned (first exposure) — schedules first review in 1 day.
export function markLearned(p: NameProgress, now = Date.now()): NameProgress {
  if (p.learned) return p
  return {
    ...p,
    learned: true,
    box: 1,
    mastery: Math.max(p.mastery, 20),
    nextReview: now + DAY,
    lastSeen: now,
  }
}

export function isDue(p: NameProgress, now = Date.now()): boolean {
  return p.learned && p.nextReview !== null && p.nextReview <= now
}

// Names due for review, weakest (lowest mastery) and most overdue first.
export function dueForReview(progress: Record<number, NameProgress>, now = Date.now()): number[] {
  return Object.values(progress)
    .filter((p) => isDue(p, now))
    .sort((a, b) => {
      if (a.mastery !== b.mastery) return a.mastery - b.mastery
      return (a.nextReview ?? 0) - (b.nextReview ?? 0)
    })
    .map((p) => p.id)
}
