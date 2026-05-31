import { useMemo, useState } from 'react'
import { useGame } from '../context/GameContext'
import { dueForReview } from '../lib/srs'
import { Quiz, type QuizResult } from '../components/quiz/Quiz'
import { Confetti } from '../components/Confetti'
import { Button } from '../components/ui'
import { TopBar } from '../components/TopBar'
import type { View } from '../App'

export function Review({ nav }: { nav: (v: View) => void }) {
  const { state, completeReview, perfectQuiz } = useGame()
  // Snapshot due names once so the list doesn't shift mid-session.
  const dueIds = useMemo(() => dueForReview(state.progress).slice(0, 12), [])
  const [result, setResult] = useState<QuizResult | null>(null)

  function onDone(r: QuizResult) {
    setResult(r)
    completeReview()
    if (r.perfect) perfectQuiz()
  }

  if (dueIds.length === 0) {
    return (
      <div className="mx-auto max-w-md px-5 pt-4">
        <TopBar title="Review" onBack={() => nav('dashboard')} />
        <div className="mt-16 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald2/10 text-5xl">🌿</div>
          <h2 className="mt-5 font-display font-800 text-2xl text-emerald2-dark">All caught up!</h2>
          <p className="mt-1 font-700 text-stone-500 text-balance">No reviews due right now. Come back later or learn a new lesson.</p>
          <Button size="lg" className="mt-6" onClick={() => nav('dashboard')}>
            Back to Home 🏡
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-4">
      <TopBar title="Review Session" onBack={() => nav('dashboard')} />
      {!result ? (
        <div className="mt-6 rounded-3xl bg-white/90 p-5 shadow-card border border-white">
          <p className="mb-4 text-center text-sm font-700 text-stone-500">
            Strengthening {dueIds.length} Name{dueIds.length === 1 ? '' : 's'} — weakest first 💪
          </p>
          <Quiz targetIds={dueIds} onComplete={onDone} />
        </div>
      ) : (
        <div className="mt-10 text-center">
          {result.perfect && <Confetti />}
          <div className="mx-auto flex h-24 w-24 animate-pop items-center justify-center rounded-full bg-gradient-to-br from-plum to-emerald2 text-5xl shadow-pop">
            {result.perfect ? '💎' : '🔁'}
          </div>
          <h2 className="mt-5 font-display font-800 text-3xl text-emerald2-dark">Review complete!</h2>
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
