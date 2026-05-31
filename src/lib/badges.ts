import type { BadgeId, GameState } from '../types'

export interface BadgeDef {
  id: BadgeId
  title: string
  description: string
  icon: string
  earned: (s: GameState, learnedCount: number) => boolean
}

export const BADGES: BadgeDef[] = [
  { id: 'first_name', title: 'First Step', description: 'Learn your first Name', icon: '🌱', earned: (_s, c) => c >= 1 },
  { id: 'ten_names', title: 'Rising Star', description: 'Learn 10 Names', icon: '⭐', earned: (_s, c) => c >= 10 },
  { id: 'twentyfive_names', title: 'Quarter Quest', description: 'Learn 25 Names', icon: '🌟', earned: (_s, c) => c >= 25 },
  { id: 'fifty_names', title: 'Halfway Hero', description: 'Learn 50 Names', icon: '🏅', earned: (_s, c) => c >= 50 },
  { id: 'ninetynine_names', title: 'Master of the Names', description: 'Learn all 99 Names', icon: '👑', earned: (_s, c) => c >= 99 },
  { id: 'streak_7', title: 'Week Warrior', description: 'Keep a 7-day streak', icon: '🔥', earned: (s) => s.bestStreak >= 7 },
  { id: 'streak_30', title: 'Unstoppable', description: 'Keep a 30-day streak', icon: '⚡', earned: (s) => s.bestStreak >= 30 },
  { id: 'perfect_quiz', title: 'Flawless', description: 'Get a perfect quiz score', icon: '💎', earned: (s) => s.quizzesPerfect >= 1 },
]

export function evaluateBadges(s: GameState, learnedCount: number): BadgeId[] {
  const newly: BadgeId[] = []
  for (const b of BADGES) {
    if (!s.badges.includes(b.id) && b.earned(s, learnedCount)) newly.push(b.id)
  }
  return newly
}
