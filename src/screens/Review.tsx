import { useMemo, useState } from 'react'
import { useGame } from '../context/GameContext'
import { dueForReview, practiceIds } from '../lib/srs'
import { Quiz, type QuizResult } from '../components/quiz/Quiz'
import { Confetti } from '../components/Confetti'
import { Button } from '../components/ui'
import { TopBar } from '../components/TopBar'
import type { View } from '../App'

export type ReviewMode = 'due' | 'practice'

export function Review({ nav, mode }: { nav: (v: View) => void; mode: ReviewMode }) {
  const { state, completeReview, perfectQuiz } = useGame()
  // Snapshot the list once so it doesn't shift mid-session.
  const ids = useMemo(() => {
    const pool = mode === 'due' ? dueForReview(state.progress) : practiceIds(state.progress)
    return pool.slice(0, 12)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])
  const [result, setResult] = useState<QuizResult | null>(null)

  function onDone(r: QuizResult) {
    setResult(r)
    completeReview()
    if (r.perfect) perfectQuiz()
  }

  const title = mode === 'due' ? 'Review Session' : 'Practice'

  if (ids.length === 0) {
    return (
      <div className="mx-auto max-w-md px-5 pt-4">
        <TopBar title={title} onBack={() => nav('dashboard')} />
        <div className="mt-16 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald2/10 text-5xl">🌿</div>
          <h2 className="mt-5 font-display font-800 text-2xl text-emerald2-dark">
            {mode === 'due' ? 'All caught up!' : 'Nothing to practice yet'}
          </h2>
          <p className="mt-1 font-700 text-stone-500 text-balance">
            {mode === 'due'
              ? 'No reviews due right now. Come back later or learn a new lesson.'
              : 'Learn your first lesson, then you can practice your Names here anytime.'}
          </p>
          <Button size="lg" className="mt-6" onClick={() => nav('dashboard')}>
            Back to Home 🏡
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-4">
      <TopBar title={title} onBack={() => nav('dashboard')} />
      {!result ? (
        <div className="mt-6 rounded-3xl bg-white/90 p-5 shadow-card border border-white">
          <p className="mb-4 text-center text-sm font-700 text-stone-500">
            {mode === 'due'
              ? `Strengthening ${ids.length} Name${ids.length === 1 ? '' : 's'} — weakest first 💪`
              : `Practising ${ids.length} of your Names — weakest first 🌱`}
          </p>
          <Quiz targetIds={ids} onComplete={onDone} />
        </div>
      ) : (
        <div className="mt-10 text-center">
          {result.perfect && <Confetti />}
          <div className="mx-auto flex h-24 w-24 animate-pop items-center justify-center rounded-full bg-gradient-to-br from-plum to-emerald2 text-5xl shadow-pop">
            {result.perfect ? '💎' : '🔁'}
          </div>
          <h2 className="mt-5 font-display font-800 text-3xl text-emerald2-dark">
            {mode === 'due' ? 'Review complete!' : 'Practice complete!'}
          </h2>
          <p className="mt-1 font-700 text-stone-500">
            {result.correct} / {result.total} correct · +15 XP ⚡
          </p>
          <p className="mt-2 text-sm font-700 text-stone-400 text-balance">
            Names you found tricky will come back sooner. Easy ones rest longer. 🌱
          </p>
          <Button size="lg" className="mt-6" onClick={() => nav('dashboard')}>
            Back to Home 🏡
          </Button>
        </div>
      )}
    </div>
  )
}
