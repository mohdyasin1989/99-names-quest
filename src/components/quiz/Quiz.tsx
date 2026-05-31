import { useMemo, useRef, useState } from 'react'
import { useGame } from '../../context/GameContext'
import { buildQuiz, byId, type Question } from './quizEngine'
import { fuzzyMatch } from '../../lib/fuzzy'
import { Button, ProgressBar } from '../ui'

export interface QuizResult {
  correct: number
  total: number
  perfect: boolean
  learnedIds: number[] // distinct names answered correctly at least once
}

export function Quiz({ targetIds, onComplete }: { targetIds: number[]; onComplete: (r: QuizResult) => void }) {
  const { answer } = useGame()
  const questions = useMemo<Question[]>(() => buildQuiz(targetIds), [targetIds])
  const [index, setIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const correctIds = useRef<Set<number>>(new Set())

  const q = questions[index]
  const progress = Math.round((index / questions.length) * 100)

  function record(id: number, ok: boolean) {
    answer(id, ok)
    if (ok) correctIds.current.add(id)
  }

  function next(gotCorrect: number, units: number) {
    const newCorrect = correct + gotCorrect
    const newTotal = total + units
    if (index + 1 >= questions.length) {
      onComplete({
        correct: newCorrect,
        total: newTotal,
        perfect: newCorrect === newTotal,
        learnedIds: [...correctIds.current],
      })
    } else {
      setCorrect(newCorrect)
      setTotal(newTotal)
      setIndex(index + 1)
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <ProgressBar value={progress} color="bg-amber2" />
        <span className="shrink-0 font-display font-800 text-stone-500 text-sm">
          {index + 1}/{questions.length}
        </span>
      </div>
      {q.kind === 'meaningToName' && (
        <MultipleChoice
          key={index}
          prompt={q.prompt}
          subtitle="Pick the correct Name"
          options={q.options.map((o) => ({ id: o.id, label: o.transliteration }))}
          answerId={q.answerId}
          onAnswered={(ok) => {
            record(q.nameId, ok)
            next(ok ? 1 : 0, 1)
          }}
        />
      )}
      {q.kind === 'nameToMeaning' && (
        <MultipleChoice
          key={index}
          prompt={q.prompt}
          subtitle="Pick the correct meaning"
          options={q.options.map((o) => ({ id: o.id, label: o.meaning }))}
          answerId={q.answerId}
          onAnswered={(ok) => {
            record(q.nameId, ok)
            next(ok ? 1 : 0, 1)
          }}
        />
      )}
      {q.kind === 'memory' && (
        <MemoryChallenge
          key={index}
          name={q.prompt}
          answer={q.answer}
          onAnswered={(ok) => {
            record(q.nameId, ok)
            next(ok ? 1 : 0, 1)
          }}
        />
      )}
      {q.kind === 'match' && (
        <MatchPairs
          key={index}
          nameIds={q.nameIds}
          onAnswered={(c, units, results) => {
            results.forEach((r) => record(r.id, r.ok))
            next(c, units)
          }}
        />
      )}
    </div>
  )
}

/* ---------- Multiple choice ---------- */
function MultipleChoice({
  prompt,
  subtitle,
  options,
  answerId,
  onAnswered,
}: {
  prompt: string
  subtitle: string
  options: { id: number; label: string }[]
  answerId: number
  onAnswered: (ok: boolean) => void
}) {
  const [picked, setPicked] = useState<number | null>(null)

  function choose(id: number) {
    if (picked !== null) return
    setPicked(id)
    setTimeout(() => onAnswered(id === answerId), 1050)
  }

  return (
    <div className="animate-slidein">
      <p className="text-center text-xs font-800 uppercase tracking-wider text-amber2">{subtitle}</p>
      <h3 className="mt-2 text-center font-display font-800 text-2xl sm:text-3xl text-emerald2-dark text-balance">{prompt}</h3>
      <div className="mt-7 grid gap-3">
        {options.map((o, i) => {
          const isAnswer = o.id === answerId
          const isPicked = o.id === picked
          let style = 'bg-white border-stone-200 text-stone-700 hover:border-emerald2/50 hover:bg-sand-50'
          if (picked !== null) {
            if (isAnswer) style = 'bg-emerald2 border-emerald2 text-white'
            else if (isPicked) style = 'bg-coral border-coral text-white'
            else style = 'bg-white border-stone-200 text-stone-400 opacity-60'
          }
          return (
            <button
              key={o.id}
              onClick={() => choose(o.id)}
              disabled={picked !== null}
              className={`btn-3d flex items-center gap-3 rounded-2xl border-2 px-5 py-4 text-left font-700 text-lg transition-colors ${style}`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-800 ${picked !== null && isAnswer ? 'bg-white/25' : 'bg-emerald2/10 text-emerald2-dark'}`}>
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{o.label}</span>
              {picked !== null && isAnswer && <span className="text-xl">✓</span>}
              {picked !== null && isPicked && !isAnswer && <span className="text-xl">✕</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- Memory challenge (typed, fuzzy matched) ---------- */
function MemoryChallenge({ name, answer, onAnswered }: { name: string; answer: string; onAnswered: (ok: boolean) => void }) {
  const [value, setValue] = useState('')
  const [result, setResult] = useState<null | boolean>(null)

  function check() {
    if (result !== null || !value.trim()) return
    const ok = fuzzyMatch(value, answer)
    setResult(ok)
    setTimeout(() => onAnswered(ok), 1500)
  }

  return (
    <div className="animate-slidein">
      <p className="text-center text-xs font-800 uppercase tracking-wider text-amber2">Memory Challenge ✍️</p>
      <h3 className="mt-2 text-center font-display font-800 text-stone-600 text-lg">What does this Name mean?</h3>
      <div className="mt-4 rounded-3xl bg-gradient-to-br from-emerald2 to-teal2 py-6 text-center text-white shadow-pop">
        <div className="font-display font-800 text-3xl">{name}</div>
      </div>
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && check()}
        disabled={result !== null}
        placeholder="Type the meaning…"
        className={`mt-5 w-full rounded-2xl border-2 px-5 py-4 text-lg font-600 outline-none transition-colors ${
          result === null
            ? 'border-stone-200 focus:border-emerald2 bg-white'
            : result
              ? 'border-emerald2 bg-emerald2/10 text-emerald2-dark'
              : 'border-coral bg-coral/10 text-coral'
        }`}
      />
      {result === null ? (
        <Button onClick={check} size="lg" className="mt-4 w-full" disabled={!value.trim()}>
          Check Answer
        </Button>
      ) : (
        <div className={`mt-4 rounded-2xl px-5 py-4 text-center font-700 ${result ? 'bg-emerald2/10 text-emerald2-dark' : 'bg-coral/10 text-coral'}`}>
          {result ? '🎉 Correct!' : `Almost! The answer is "${answer}"`}
        </div>
      )}
    </div>
  )
}

/* ---------- Match pairs ---------- */
function MatchPairs({
  nameIds,
  onAnswered,
}: {
  nameIds: number[]
  onAnswered: (correct: number, units: number, results: { id: number; ok: boolean }[]) => void
}) {
  const names = nameIds.map(byId)
  const [shuffledMeanings] = useState(() => [...names].sort(() => Math.random() - 0.5))
  const [selectedName, setSelectedName] = useState<number | null>(null)
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [missed, setMissed] = useState<Set<number>>(new Set())
  const [wrongFlash, setWrongFlash] = useState<number | null>(null)

  function pickMeaning(meaningId: number) {
    if (selectedName === null || matched.has(selectedName)) return
    if (selectedName === meaningId) {
      const nextMatched = new Set(matched).add(selectedName)
      setMatched(nextMatched)
      setSelectedName(null)
      if (nextMatched.size === names.length) {
        setTimeout(() => {
          const results = names.map((n) => ({ id: n.id, ok: !missed.has(n.id) }))
          const correct = results.filter((r) => r.ok).length
          onAnswered(correct, names.length, results)
        }, 500)
      }
    } else {
      setMissed((m) => new Set(m).add(selectedName))
      setWrongFlash(meaningId)
      setTimeout(() => setWrongFlash(null), 400)
    }
  }

  return (
    <div className="animate-slidein">
      <p className="text-center text-xs font-800 uppercase tracking-wider text-amber2">Match the Pairs 🧩</p>
      <h3 className="mt-2 text-center font-display font-800 text-stone-600 text-lg">Tap a Name, then its meaning</h3>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="space-y-3">
          {names.map((n) => {
            const done = matched.has(n.id)
            const active = selectedName === n.id
            return (
              <button
                key={n.id}
                disabled={done}
                onClick={() => setSelectedName(n.id)}
                className={`btn-3d w-full rounded-2xl border-2 px-3 py-3 font-display font-800 transition-colors ${
                  done
                    ? 'bg-emerald2 border-emerald2 text-white opacity-70'
                    : active
                      ? 'bg-amber2 border-amber2 text-white'
                      : 'bg-white border-stone-200 text-emerald2-dark hover:border-emerald2/50'
                }`}
              >
                {n.transliteration}
              </button>
            )
          })}
        </div>
        <div className="space-y-3">
          {shuffledMeanings.map((n) => {
            const done = matched.has(n.id)
            const flash = wrongFlash === n.id
            return (
              <button
                key={n.id}
                disabled={done}
                onClick={() => pickMeaning(n.id)}
                className={`btn-3d w-full rounded-2xl border-2 px-3 py-3 text-sm font-700 transition-colors ${
                  done
                    ? 'bg-emerald2 border-emerald2 text-white opacity-70'
                    : flash
                      ? 'bg-coral border-coral text-white'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-emerald2/50'
                }`}
              >
                {n.meaning}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
