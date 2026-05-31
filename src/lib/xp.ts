export const XP_REWARDS = {
  learnNewName: 10,
  correctAnswer: 5,
  lessonCompletion: 25,
  reviewSession: 15,
}

export interface LevelInfo {
  level: number
  title: string
  minXp: number
  nextXp: number | null
  progressPct: number
  icon: string
}

// Expandable level system. Each tier needs progressively more XP.
export const LEVELS: { title: string; minXp: number; icon: string }[] = [
  { title: 'Explorer', minXp: 0, icon: '🧭' },
  { title: 'Seeker', minXp: 80, icon: '🔍' },
  { title: 'Student', minXp: 200, icon: '📖' },
  { title: 'Learner', minXp: 400, icon: '🎓' },
  { title: 'Scholar', minXp: 700, icon: '🦉' },
  { title: 'Guardian', minXp: 1100, icon: '🛡️' },
  { title: 'Master of the Names', minXp: 1600, icon: '👑' },
]

export function getLevelInfo(xp: number): LevelInfo {
  let idx = 0
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].minXp) idx = i
  }
  const current = LEVELS[idx]
  const next = LEVELS[idx + 1] ?? null
  const span = next ? next.minXp - current.minXp : 1
  const into = xp - current.minXp
  const progressPct = next ? Math.min(100, Math.round((into / span) * 100)) : 100
  return {
    level: idx + 1,
    title: current.title,
    minXp: current.minXp,
    nextXp: next ? next.minXp : null,
    progressPct,
    icon: current.icon,
  }
}
