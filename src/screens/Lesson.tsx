import { useMemo, useState } from 'react'
import { useGame } from '../context/GameContext'
import { namesForDay } from '../lib/plan'
import { NAMES } from '../data/names'
import { NameCard } from '../components/NameCard'
import { Quiz, type QuizResult } from '../components/quiz/Quiz'
import { Confetti } from '../components/Confetti'
import { Button } from '../components/ui'
import { TopBar } from '../components/TopBar'
import type { View } from '../App'

type Phase = 'learn' | 'quiz' | 'done'

export function Lesson({ nav }: { nav: (v: View) => void }) {
  const { state, learn, completeLesson, perfectQuiz } = useGame()
  const ids = useMemo(() => namesForDay(state.planDays, state.currentDay), [state.planDays, state.currentDay])
  const names = ids.map((id) => NAMES.find((n) => n.id === id)!)

  const [phase, setPhase] = useState<Phase>('learn')
  const [cardIdx, setCardIdx] = useState(0)
  const [result, setResult] = useState<QuizResult | null>(null)

  function finishLearning() {
    learn(ids)
    setPhase('quiz')
  }

  function onQuizDone(r: QuizResult) {
    setResult(r)
    completeLesson()
    if (r.perfect) perfectQuiz()
    setPhase('done')
  }

  return (
    <div className="mx-auto min-h-screen max-w-md px-5 pb-10 pt-4">
      <TopBar title={phase === 'quiz' ? 'Quiz Time!' : "Today's Lesson"} onBack={() => nav('dashboard')} />

      {phase === 'learn' && (
        <div className="mt-4">
          <NameCard name={names[cardIdx]} index={cardIdx} total={names.length} />
          <div className="mt-6 flex gap-3">
            {cardIdx > 0 && (
              <Button variant="secondary" size="lg" className="flex-1" onClick={() => setCardIdx(cardIdx - 1)}>
                ← Back
              </Button>
            )}
            {cardIdx < names.length - 1 ? (
              <Button size="lg" className="flex-1" onClick={() => setCardIdx(cardIdx + 1)}>
                Next →
              </Button>
            ) : (
              <Button size="lg" variant="gold" className="flex-1" onClick={finishLearning}>
                I'm ready — Quiz me! ✨
              </Button>
            )}
          </div>
          <p className="mt-4 text-center text-sm font-700 text-stone-400">Tap through each Name, then test yourself 🎯</p>
        </div>
      )}

      {phase === 'quiz' && (
        <div className="mt-6 rounded-3xl bg-white/90 p-5 shadow-card border border-white">
          <Quiz targetIds={ids} onComplete={onQuizDone} />
        </div>
      )}

      {phase === 'done' && result && (
        <Completion result={result} count={names.length} onHome={() => nav('dashboard')} onReview={() => nav('review')} />
      )}
    </div>
  )
}

function Completion({ result, count, onHome, onReview }: { result: QuizResult; count: number; onHome: () => void; onReview: () => void }) {
  const pct = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 100
  const earned = count * 10 + result.correct * 5 + 25
  return (
    <div className="mt-8 text-center">
      {result.perfect && <Confetti />}
      <div className="mx-auto flex h-24 w-24 animate-pop items-center justify-center rounded-full bg-gradient-to-br from-amber2 to-gold text-5xl shadow-pop">
        {result.perfect ? '🏆' : pct >= 60 ? '🌟' : '💪'}
      </div>
      <h2 className="mt-5 font-display font-800 text-3xl text-emerald2-dark">
        {result.perfect ? 'Perfect! Mashallah!' : pct >= 60 ? 'Great job!' : 'Well done!'}
      </h2>
      <p className="mt-1 font-700 text-stone-500">
        You scored {result.correct} / {result.total} ({pct}%)
      </p>

      <div className="mx-auto mt-6 max-w-xs rounded-3xl bg-white/90 p-5 shadow-card border border-white">
        <p className="text-xs font-800 uppercase tracking-wider text-amber2">Rewards Earned</p>
        <div className="mt-3 space-y-2 text-left">
          <Reward label={`Learned ${count} new Names`} xp={count * 10} />
          <Reward label={`${result.correct} correct answers`} xp={result.correct * 5} />
          <Reward label="Lesson completed" xp={25} />
        </div>
        <div className="mt-3 border-t border-stone-200 pt-3 flex items-center justify-between font-display font-800 text-emerald2-dark">
          <span>Total</span>
          <span className="text-amber2">+{earned} XP ⚡</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Button size="lg" variant="gold" onClick={onReview}>
          Do a Review Session 🔁
        </Button>
        <Button size="lg" variant="secondary" onClick={onHome}>
          Back to Home 🏡
        </Button>
      </div>
    </div>
  )
}

function Reward({ label, xp }: { label: string; xp: number }) {
  return (
    <div className="flex items-center justify-between text-sm font-700 text-stone-600">
      <span>{label}</span>
      <span className="text-emerald2">+{xp}</span>
    </div>
  )
}
