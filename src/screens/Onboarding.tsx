import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { clampPlanDays } from '../lib/plan'
import { Button } from '../components/ui'

const PRESETS = [
  { days: 30, label: '30 Days', sub: '~3–4 a day', emoji: '🚀' },
  { days: 60, label: '60 Days', sub: '~2 a day', emoji: '🌙' },
  { days: 99, label: '99 Days', sub: '1 a day', emoji: '🌟' },
]

export function Onboarding() {
  const { onboard } = useGame()
  const [step, setStep] = useState(0)
  const [childName, setChildName] = useState('')
  const [plan, setPlan] = useState<number | null>(null)
  const [custom, setCustom] = useState('')
  const [useCustom, setUseCustom] = useState(false)

  const chosen = useCustom ? clampPlanDays(Number(custom)) : plan
  const canFinish = chosen != null && (!useCustom || custom.trim() !== '')

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-8">
      <div className="flex flex-1 flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-20 w-20 animate-floaty items-center justify-center rounded-3xl bg-gradient-to-br from-amber2 to-gold text-4xl shadow-pop">
            🕌
          </div>
          <h1 className="font-display font-800 text-4xl text-emerald2-dark">99 Names Quest</h1>
          <p className="mt-1 font-700 text-stone-500">Learn the Beautiful Names of Allah</p>
        </div>

        {step === 0 && (
          <div className="animate-slidein rounded-3xl bg-white/90 p-6 shadow-card border border-white">
            <h2 className="font-display font-800 text-xl text-emerald2-dark">What's your name?</h2>
            <p className="mt-1 text-sm text-stone-500">So we can cheer you on! 🎉</p>
            <input
              autoFocus
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && childName.trim() && setStep(1)}
              placeholder="Type your name…"
              maxLength={24}
              className="mt-4 w-full rounded-2xl border-2 border-stone-200 bg-white px-5 py-4 text-lg font-600 outline-none focus:border-emerald2"
            />
            <Button onClick={() => setStep(1)} size="lg" className="mt-4 w-full" disabled={!childName.trim()}>
              Next →
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="animate-slidein rounded-3xl bg-white/90 p-6 shadow-card border border-white">
            <h2 className="font-display font-800 text-xl text-emerald2-dark text-balance">
              How many days to complete all 99 Names?
            </h2>
            <p className="mt-1 text-sm text-stone-500">We'll split them into fun daily lessons.</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {PRESETS.map((p) => {
                const active = !useCustom && plan === p.days
                return (
                  <button
                    key={p.days}
                    onClick={() => {
                      setPlan(p.days)
                      setUseCustom(false)
                    }}
                    className={`btn-3d rounded-2xl border-2 px-2 py-4 text-center transition-colors ${
                      active ? 'bg-emerald2 border-emerald2 text-white' : 'bg-white border-stone-200 hover:border-emerald2/50'
                    }`}
                  >
                    <div className="text-2xl">{p.emoji}</div>
                    <div className={`mt-1 font-display font-800 ${active ? 'text-white' : 'text-emerald2-dark'}`}>{p.label}</div>
                    <div className={`text-[11px] font-700 ${active ? 'text-white/80' : 'text-stone-400'}`}>{p.sub}</div>
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
              ✏️ Custom number of days
            </button>
            {useCustom && (
              <input
                autoFocus
                type="number"
                min={1}
                max={99}
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="e.g. 45"
                className="mt-3 w-full rounded-2xl border-2 border-amber2 bg-white px-5 py-4 text-lg font-600 outline-none"
              />
            )}
            {chosen != null && canFinish && (
              <p className="mt-4 text-center text-sm font-700 text-emerald2">
                ✅ {chosen} days · about {Math.ceil(99 / chosen)} name{Math.ceil(99 / chosen) > 1 ? 's' : ''} a day
              </p>
            )}
            <Button
              onClick={() => chosen != null && onboard(childName, chosen)}
              size="lg"
              variant="gold"
              className="mt-4 w-full"
              disabled={!canFinish}
            >
              Begin My Quest! 🌟
            </Button>
          </div>
        )}
      </div>
      <p className="pt-6 text-center text-xs text-stone-400">
        "Allah has ninety-nine names… whoever learns them will enter Paradise." — Sahih Bukhari
      </p>
    </div>
  )
}
