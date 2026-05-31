import type { NameProgress } from '../types'

const DAY = 24 * 60 * 60 * 1000

// Simplified Leitner-style spaced repetition.
// Box index -> days until next review.
export const INTERVALS = [1, 3, 7, 14, 30] // box 0..4 (box 5 = mastered, also 30)

export function newProgress(id: number): NameProgress {
  return {
    id,
    introduced: false,
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

// Mark a brand-new name as INTRODUCED (first exposure in a lesson).
// This does NOT mark it "learned" — that only happens on a correct answer.
// It schedules a review the next day so the name comes back to be tested.
export function markIntroduced(p: NameProgress, now = Date.now()): NameProgress {
  if (p.introduced) return p
  return {
    ...p,
    introduced: true,
    box: Math.max(p.box, 1),
    mastery: Math.max(p.mastery, 5),
    nextReview: now + DAY,
    lastSeen: now,
  }
}

// Apply a quiz/review result and return the updated progress.
// A correct answer is what actually marks a name as "learned".
export function reviewName(p: NameProgress, correct: boolean, now = Date.now()): NameProgress {
  let box = p.box
  let mastery = p.mastery
  let learned = p.learned
  if (correct) {
    learned = true // truly learned: got it right at least once
    box = Math.min(Math.max(box, 1) + 1, INTERVALS.length)
    mastery = Math.min(100, mastery + 20)
  } else {
    box = 1 // move back to the 1-day review bucket
    mastery = Math.max(0, mastery - 25)
  }
  const days = intervalDays(box)
  return {
    ...p,
    introduced: true,
    learned,
    box,
    mastery,
    nextReview: now + days * DAY,
    correctCount: p.correctCount + (correct ? 1 : 0),
    wrongCount: p.wrongCount + (correct ? 0 : 1),
    lastSeen: now,
  }
}

// A name is "due" once it has been introduced and its review time has passed.
export function isDue(p: NameProgress, now = Date.now()): boolean {
  return (p.introduced || p.learned) && p.nextReview !== null && p.nextReview <= now
}

function weakestFirst(a: NameProgress, b: NameProgress): number {
  if (a.mastery !== b.mastery) return a.mastery - b.mastery
  return (a.nextReview ?? 0) - (b.nextReview ?? 0)
}

// Names due for review, weakest (lowest mastery) and most overdue first.
export function dueForReview(progress: Record<number, NameProgress>, now = Date.now()): number[] {
  return Object.values(progress)
    .filter((p) => isDue(p, now))
    .sort(weakestFirst)
    .map((p) => p.id)
}

// Every name the learner has seen so far (for on-demand "review previous names"),
// weakest first so practice targets the shakiest names.
export function practiceIds(progress: Record<number, NameProgress>): number[] {
  return Object.values(progress)
    .filter((p) => p.introduced || p.learned)
    .sort(weakestFirst)
    .map((p) => p.id)
}
