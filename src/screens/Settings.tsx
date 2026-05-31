import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { clampPace, estimatedTotalDays, lessonsRemaining, MAX_PACE, MIN_PACE } from '../lib/plan'
import { Button, Card } from '../components/ui'
import { TopBar } from '../components/TopBar'
import type { View } from '../App'

const PRESETS = [
  { pace: 1, label: 'Gentle', emoji: '🐢' },
  { pace: 3, label: 'Steady', emoji: '🌙' },
  { pace: 5, label: 'Keen', emoji: '🚀' },
  { pace: 7, label: 'Speedy', emoji: '⚡' },
]

export function Settings({ nav }: { nav: (v: View) => void }) {
  const { state, setPace, setName } = useGame()

  const [pace, setPaceLocal] = useState(state.namesPerDay)
  const [custom, setCustom] = useState('')
  const [useCustom, setUseCustom] = useState(!PRESETS.some((p) => p.pace === state.namesPerDay))
  const [name, setNameLocal] = useState(state.childName)
  const [saved, setSaved] = useState(false)

  const chosen = useCustom ? clampPace(Number(custom || pace)) : pace
  const remainingLessons = lessonsRemaining(state.introducedCount, chosen)
  const namesLeft = 99 - state.introducedCount

  function save() {
    setPace(chosen)
    if (name.trim()) setName(name)
    setSaved(true)
    setTimeout(() => nav('dashboard'), 700)
  }

  return (
    <div className="mx-auto max-w-md px-5 pb-28 pt-4">
      <TopBar title="Settings ⚙️" onBack={() => nav('dashboard')} />

      <Card className="mt-5 p-5">
        <h2 className="font-display font-800 text-lg text-emerald2-dark">How many new Names per day?</h2>
        <p className="mt-1 text-sm text-stone-500 text-balance">
          Struggling? Pick fewer. Finding it easy? Pick more. You can change this anytime — it never piles names up on you.
        </p>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {PRESETS.map((p) => {
            const active = !useCustom && pace === p.pace
            return (
              <button
                key={p.pace}
                onClick={() => {
                  setPaceLocal(p.pace)
                  setUseCustom(false)
                }}
                className={`btn-3d rounded-2xl border-2 px-1 py-3 text-center transition-colors ${
                  active ? 'bg-emerald2 border-emerald2 text-white' : 'bg-white border-stone-200 hover:border-emerald2/50'
                }`}
              >
                <div className="text-xl">{p.emoji}</div>
                <div className={`mt-0.5 font-display font-800 text-lg ${active ? 'text-white' : 'text-emerald2-dark'}`}>{p.pace}</div>
                <div className={`text-[10px] font-700 ${active ? 'text-white/80' : 'text-stone-400'}`}>{p.label}</div>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setUseCustom(true)}
          className={`btn-3d mt-3 w-full rounded-2xl border-2 px-4 py-3 font-display font-800 transition-colors ${
            useCustom ? 'bg-amber2 border-amber2 text-white' : 'bg-white border-stone-200 text-stone-600 hover:border-amber2/60'
          }`}
        >
          ✏️ Custom amount
        </button>
        {useCustom && (
          <input
            autoFocus
            type="number"
            min={MIN_PACE}
            max={MAX_PACE}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder={`${MIN_PACE}–${MAX_PACE} a day`}
            className="mt-3 w-full rounded-2xl border-2 border-amber2 bg-white px-5 py-4 text-lg font-600 outline-none"
          />
        )}

        <div className="mt-4 rounded-2xl bg-emerald2/5 px-4 py-3 text-center text-sm font-700 text-emerald2-dark">
          {namesLeft > 0 ? (
            <>
              {chosen} Name{chosen === 1 ? '' : 's'} a day · {remainingLessons} more day{remainingLessons === 1 ? '' : 's'} to finish
            </>
          ) : (
            <>You've met all 99 Names — keep reviewing! 🌟</>
          )}
          <div className="mt-0.5 text-xs font-700 text-stone-400">
            (A fresh start at this pace would take about {estimatedTotalDays(chosen)} days)
          </div>
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <h2 className="font-display font-800 text-lg text-emerald2-dark">Your name</h2>
        <input
          value={name}
          onChange={(e) => setNameLocal(e.target.value)}
          maxLength={24}
          placeholder="Type your name…"
          className="mt-3 w-full rounded-2xl border-2 border-stone-200 bg-white px-5 py-4 text-lg font-600 outline-none focus:border-emerald2"
        />
      </Card>

      <Button size="lg" variant="gold" className="mt-6 w-full" onClick={save}>
        {saved ? 'Saved! ✓' : 'Save changes'}
      </Button>

      <p className="mt-4 text-center text-xs font-700 text-stone-400 text-balance">
        Progress for your learned Names stays exactly as it is — only the daily pace changes.
      </p>
    </div>
  )
}
