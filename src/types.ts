export interface NameProgress {
  id: number
  introduced: boolean // shown in a lesson at least once
  learned: boolean // answered correctly at least once (truly learned)
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
  namesPerDay: number // adjustable daily pace
  introducedCount: number // how many names have been introduced so far (0..99)
  startDate: string | null // ISO date
  xp: number
  streak: number
  bestStreak: number
  lastCompletedDate: string | null // YYYY-MM-DD — any activity, for streak
  lastLessonDate: string | null // YYYY-MM-DD — last NEW-names lesson, gates one/day
  progress: Record<number, NameProgress>
  badges: BadgeId[]
  timeSpentSec: number
  quizzesPerfect: number
}
