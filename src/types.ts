export interface NameProgress {
  id: number
  learned: boolean
  mastery: number // 0-100
  box: number // SRS interval index (0..5)
  nextReview: number | null // timestamp ms
  correctCount: number
  wrongCount: number
  lastSeen: number | null
}

export type BadgeId =
  | 'first_name'
  | 'ten_names'
  | 'twentyfive_names'
  | 'fifty_names'
  | 'ninetynine_names'
  | 'streak_7'
  | 'streak_30'
  | 'perfect_quiz'

export interface GameState {
  onboarded: boolean
  childName: string
  planDays: number // total days chosen to finish
  startDate: string | null // ISO date
  xp: number
  streak: number
  bestStreak: number
  lastCompletedDate: string | null // YYYY-MM-DD
  currentDay: number // which lesson-day the learner is on (1-based)
  progress: Record<number, NameProgress>
  badges: BadgeId[]
  timeSpentSec: number
  quizzesPerfect: number
}
