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
import { markLearned, newProgress, reviewName } from '../lib/srs'
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
    planDays: 30,
    startDate: null,
    xp: 0,
    streak: 0,
    bestStreak: 0,
    lastCompletedDate: null,
    currentDay: 1,
    progress: freshProgress(),
    badges: [],
    timeSpentSec: 0,
    quizzesPerfect: 0,
  }
}

type Action =
  | { type: 'HYDRATE'; state: GameState }
  | { type: 'ONBOARD'; childName: string; planDays: number }
  | { type: 'LEARN'; ids: number[] }
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

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state

    case 'ONBOARD':
      return {
        ...state,
        onboarded: true,
        childName: action.childName.trim().slice(0, 24),
        planDays: action.planDays,
        startDate: todayKey(),
      }

    case 'LEARN': {
      const progress = { ...state.progress }
      let xp = state.xp
      for (const id of action.ids) {
        const p = progress[id]
        if (p && !p.learned) {
          progress[id] = markLearned(p)
          xp += XP_REWARDS.learnNewName
        }
      }
      return withBadges({ ...state, progress, xp })
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
      let { streak, bestStreak, currentDay } = state
      if (state.lastCompletedDate !== today) {
        const gap = state.lastCompletedDate ? daysBetween(state.lastCompletedDate, today) : null
        streak = gap === 1 ? state.streak + 1 : 1
        bestStreak = Math.max(bestStreak, streak)
      }
      currentDay = Math.min(currentDay + 1, state.planDays)
      const next: GameState = {
        ...state,
        xp: state.xp + XP_REWARDS.lessonCompletion,
        streak,
        bestStreak,
        lastCompletedDate: today,
        currentDay,
      }
      return withBadges(next)
    }

    case 'COMPLETE_REVIEW': {
      const today = todayKey()
      let { streak, bestStreak } = state
      if (state.lastCompletedDate !== today) {
        const gap = state.lastCompletedDate ? daysBetween(state.lastCompletedDate, today) : null
        streak = gap === 1 ? state.streak + 1 : 1
        bestStreak = Math.max(bestStreak, streak)
      }
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
  onboard: (childName: string, planDays: number) => void
  learn: (ids: number[]) => void
  answer: (id: number, correct: boolean) => void
  completeLesson: () => void
  completeReview: () => void
  perfectQuiz: () => void
  reset: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadState() ?? initialState())
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
      onboard: (childName, planDays) => dispatch({ type: 'ONBOARD', childName, planDays }),
      learn: (ids) => dispatch({ type: 'LEARN', ids }),
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
    const learned = all.filter((p) => p.learned)
    const learnedCount = learned.length
    const remaining = NAMES.length - learnedCount
    const masterySum = all.reduce((acc, p) => acc + p.mastery, 0)
    const avgMastery = Math.round(masterySum / NAMES.length)
    const completionPct = Math.round((learnedCount / NAMES.length) * 100)
    const level = getLevelInfo(state.xp)
    return { learnedCount, remaining, avgMastery, completionPct, level, total: NAMES.length }
  }, [state])
}
