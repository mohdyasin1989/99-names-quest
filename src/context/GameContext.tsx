import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import type { BadgeId, GameState, NameProgress } from '../types'
import { NAMES } from '../data/names'
import { clearState, daysBetween, loadState, saveState, todayKey } from '../lib/storage'
import { markIntroduced, newProgress, reviewName } from '../lib/srs'
import { clampPace } from '../lib/plan'
import { XP_REWARDS, getLevelInfo } from '../lib/xp'
import { evaluateBadges } from '../lib/badges'

function freshProgress(): Record<number, NameProgress> {
  const p: Record<number, NameProgress> = {}
  for (const n of NAMES) p[n.id] = newProgress(n.id)
  return p
}

function initialState(): GameState {
  return {
    onboarded: false,
    childName: '',
    namesPerDay: 3,
    introducedCount: 0,
    startDate: null,
    xp: 0,
    streak: 0,
    bestStreak: 0,
    lastCompletedDate: null,
    lastLessonDate: null,
    progress: freshProgress(),
    badges: [],
    timeSpentSec: 0,
    quizzesPerfect: 0,
  }
}

// Bring older saved games (v1 schema) up to the current shape so existing
// learners don't lose any progress when the app updates.
function migrate(raw: unknown): GameState {
  const base = initialState()
  if (!raw || typeof raw !== 'object') return base
  const s = raw as Record<string, unknown>

  const progress: Record<number, NameProgress> = {}
  const savedProgress = (s.progress as Record<number, Partial<NameProgress>>) ?? {}
  for (const n of NAMES) {
    const old = savedProgress[n.id] ?? {}
    const learned = Boolean(old.learned)
    progress[n.id] = {
      id: n.id,
      // Anyone marked "learned" in the old model was certainly introduced.
      introduced: old.introduced ?? learned,
      learned,
      mastery: typeof old.mastery === 'number' ? old.mastery : 0,
      box: typeof old.box === 'number' ? old.box : learned ? 1 : 0,
      nextReview: typeof old.nextReview === 'number' ? old.nextReview : learned ? Date.now() : null,
      correctCount: typeof old.correctCount === 'number' ? old.correctCount : 0,
      wrongCount: typeof old.wrongCount === 'number' ? old.wrongCount : 0,
      lastSeen: typeof old.lastSeen === 'number' ? old.lastSeen : null,
    }
  }

  const introducedCount = Object.values(progress).filter((p) => p.introduced).length

  // Old saves stored planDays; derive a names-per-day pace from it.
  let namesPerDay = typeof s.namesPerDay === 'number' ? s.namesPerDay : 3
  if (typeof s.namesPerDay !== 'number' && typeof s.planDays === 'number' && s.planDays > 0) {
    namesPerDay = Math.round(NAMES.length / s.planDays)
  }

  return {
    ...base,
    onboarded: Boolean(s.onboarded),
    childName: typeof s.childName === 'string' ? s.childName : '',
    namesPerDay: clampPace(namesPerDay),
    introducedCount,
    startDate: typeof s.startDate === 'string' ? s.startDate : null,
    xp: typeof s.xp === 'number' ? s.xp : 0,
    streak: typeof s.streak === 'number' ? s.streak : 0,
    bestStreak: typeof s.bestStreak === 'number' ? s.bestStreak : 0,
    lastCompletedDate: typeof s.lastCompletedDate === 'string' ? s.lastCompletedDate : null,
    lastLessonDate:
      typeof s.lastLessonDate === 'string'
        ? s.lastLessonDate
        : typeof s.lastCompletedDate === 'string'
          ? s.lastCompletedDate
          : null,
    progress,
    badges: Array.isArray(s.badges) ? (s.badges as BadgeId[]) : [],
    timeSpentSec: typeof s.timeSpentSec === 'number' ? s.timeSpentSec : 0,
    quizzesPerfect: typeof s.quizzesPerfect === 'number' ? s.quizzesPerfect : 0,
  }
}

type Action =
  | { type: 'HYDRATE'; state: GameState }
  | { type: 'ONBOARD'; childName: string; namesPerDay: number }
  | { type: 'SET_PACE'; namesPerDay: number }
  | { type: 'SET_NAME'; childName: string }
  | { type: 'INTRODUCE'; ids: number[] }
  | { type: 'ANSWER'; id: number; correct: boolean }
  | { type: 'COMPLETE_LESSON' }
  | { type: 'COMPLETE_REVIEW' }
  | { type: 'PERFECT_QUIZ' }
  | { type: 'ADD_TIME'; sec: number }
  | { type: 'RESET' }

function withBadges(s: GameState): GameState {
  const learnedCount = Object.values(s.progress).filter((p) => p.learned).length
  const newly: BadgeId[] = evaluateBadges(s, learnedCount)
  if (newly.length === 0) return s
  return { ...s, badges: [...s.badges, ...newly] }
}

function bumpStreak(state: GameState): { streak: number; bestStreak: number } {
  const today = todayKey()
  if (state.lastCompletedDate === today) {
    return { streak: state.streak, bestStreak: state.bestStreak }
  }
  const gap = state.lastCompletedDate ? daysBetween(state.lastCompletedDate, today) : null
  const streak = gap === 1 ? state.streak + 1 : 1
  return { streak, bestStreak: Math.max(state.bestStreak, streak) }
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state

    case 'ONBOARD':
      return {
        ...state,
        onboarded: true,
        childName: action.childName.trim().slice(0, 24),
        namesPerDay: clampPace(action.namesPerDay),
        startDate: todayKey(),
      }

    case 'SET_PACE':
      return { ...state, namesPerDay: clampPace(action.namesPerDay) }

    case 'SET_NAME':
      return { ...state, childName: action.childName.trim().slice(0, 24) }

    case 'INTRODUCE': {
      const progress = { ...state.progress }
      let xp = state.xp
      let introduced = 0
      for (const id of action.ids) {
        const p = progress[id]
        if (p && !p.introduced) {
          progress[id] = markIntroduced(p)
          xp += XP_REWARDS.learnNewName
          introduced++
        }
      }
      const introducedCount = Math.min(NAMES.length, state.introducedCount + introduced)
      return withBadges({ ...state, progress, xp, introducedCount })
    }

    case 'ANSWER': {
      const p = state.progress[action.id]
      if (!p) return state
      const progress = { ...state.progress, [action.id]: reviewName(p, action.correct) }
      const xp = state.xp + (action.correct ? XP_REWARDS.correctAnswer : 0)
      return withBadges({ ...state, progress, xp })
    }

    case 'COMPLETE_LESSON': {
      const today = todayKey()
      const { streak, bestStreak } = bumpStreak(state)
      return withBadges({
        ...state,
        xp: state.xp + XP_REWARDS.lessonCompletion,
        streak,
        bestStreak,
        lastCompletedDate: today,
        lastLessonDate: today, // gates the next NEW-names lesson to tomorrow
      })
    }

    case 'COMPLETE_REVIEW': {
      const today = todayKey()
      const { streak, bestStreak } = bumpStreak(state)
      return withBadges({
        ...state,
        xp: state.xp + XP_REWARDS.reviewSession,
        streak,
        bestStreak,
        lastCompletedDate: today,
      })
    }

    case 'PERFECT_QUIZ':
      return withBadges({ ...state, quizzesPerfect: state.quizzesPerfect + 1 })

    case 'ADD_TIME':
      return { ...state, timeSpentSec: state.timeSpentSec + action.sec }

    case 'RESET':
      return initialState()

    default:
      return state
  }
}

interface GameContextValue {
  state: GameState
  onboard: (childName: string, namesPerDay: number) => void
  setPace: (namesPerDay: number) => void
  setName: (childName: string) => void
  introduce: (ids: number[]) => void
  answer: (id: number, correct: boolean) => void
  completeLesson: () => void
  completeReview: () => void
  perfectQuiz: () => void
  reset: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const saved = loadState()
    return saved ? migrate(saved) : initialState()
  })
  const mounted = useRef(false)

  // Persist on every change (after first hydration).
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    saveState(state)
  }, [state])

  // Track time on page in 15s ticks.
  useEffect(() => {
    const t = setInterval(() => dispatch({ type: 'ADD_TIME', sec: 15 }), 15000)
    return () => clearInterval(t)
  }, [])

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      onboard: (childName, namesPerDay) => dispatch({ type: 'ONBOARD', childName, namesPerDay }),
      setPace: (namesPerDay) => dispatch({ type: 'SET_PACE', namesPerDay }),
      setName: (childName) => dispatch({ type: 'SET_NAME', childName }),
      introduce: (ids) => dispatch({ type: 'INTRODUCE', ids }),
      answer: (id, correct) => dispatch({ type: 'ANSWER', id, correct }),
      completeLesson: () => dispatch({ type: 'COMPLETE_LESSON' }),
      completeReview: () => dispatch({ type: 'COMPLETE_REVIEW' }),
      perfectQuiz: () => dispatch({ type: 'PERFECT_QUIZ' }),
      reset: () => {
        clearState()
        dispatch({ type: 'RESET' })
      },
    }),
    [state],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStats() {
  const { state } = useGame()
  return useMemo(() => {
    const all = Object.values(state.progress)
    const learnedCount = all.filter((p) => p.learned).length
    const introducedCount = all.filter((p) => p.introduced).length
    const remaining = NAMES.length - learnedCount
    const masterySum = all.reduce((acc, p) => acc + p.mastery, 0)
    const avgMastery = Math.round(masterySum / NAMES.length)
    const completionPct = Math.round((learnedCount / NAMES.length) * 100)
    const level = getLevelInfo(state.xp)
    return { learnedCount, introducedCount, remaining, avgMastery, completionPct, level, total: NAMES.length }
  }, [state])
}
