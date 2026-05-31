import { useState } from 'react'
import { useGame, useStats } from '../context/GameContext'
import { dueForReview } from '../lib/srs'
import { NAMES } from '../data/names'
import { TopBar } from '../components/TopBar'
import { Card, ProgressBar } from '../components/ui'
import type { View } from '../App'

export function ParentDashboard({ nav }: { nav: (v: View) => void }) {
  const { state, reset } = useGame()
  const stats = useStats()
  const [confirmReset, setConfirmReset] = useState(false)

  const mins = Math.round(state.timeSpentSec / 60)
  const timeLabel = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins} min`
  const due = dueForReview(state.progress).length
  const mastered = NAMES.filter((n) => (state.progress[n.id]?.mastery ?? 0) >= 80).length
  const seen = NAMES.filter((n) => state.progress[n.id]?.introduced).length

  return (
    <div className="mx-auto max-w-md px-5 pb-28 pt-4">
      <TopBar title="Parent Dashboard" onBack={() => nav('dashboard')} />
      <p className="mt-2 text-sm font-700 text-stone-500">
        Progress for <span className="text-emerald2-dark">{state.childName || 'your child'}</span>
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Metric label="Truly Learned" value={`${stats.learnedCount} / 99`} icon="📚" />
        <Metric label="Names Seen" value={`${seen} / 99`} icon="👀" />
        <Metric label="Daily Pace" value={`${state.namesPerDay}/day`} icon="📅" />
        <Metric label="Current Streak" value={`${state.streak} day${state.streak === 1 ? '' : 's'}`} icon="🔥" />
        <Metric label="Best Streak" value={`${state.bestStreak} day${state.bestStreak === 1 ? '' : 's'}`} icon="🏅" />
        <Metric label="Time Learning" value={timeLabel} icon="⏱️" />
        <Metric label="Mastered (80%+)" value={`${mastered}`} icon="🌟" />
        <Metric label="Due for Review" value={`${due}`} icon="🔁" />
      </div>

      <Card className="mt-4 p-5">
        <p className="text-xs font-700 text-stone-500 text-balance">
          <span className="font-800 text-emerald2-dark">Seen vs. Learned:</span> a Name counts as "learned" only once your child answers it correctly in a quiz — not just from reading it. "Seen" Names they've met but are still practising.
        </p>
      </Card>

      <Card className="mt-4 p-5">
        <div className="flex items-center justify-between">
          <p className="font-display font-800 text-emerald2-dark">Completion</p>
          <p className="font-display font-800 text-emerald2">{stats.completionPct}%</p>
        </div>
        <ProgressBar value={stats.completionPct} className="mt-3" />
      </Card>

      <Card className="mt-4 p-5">
        <div className="flex items-center justify-between">
          <p className="font-display font-800 text-emerald2-dark">Average Mastery</p>
          <p className="font-display font-800 text-amber2">{stats.avgMastery}%</p>
        </div>
        <ProgressBar value={stats.avgMastery} color="bg-amber2" className="mt-3" />
        <p className="mt-3 text-xs font-700 text-stone-400 text-balance">
          Mastery reflects how well each Name is retained over time using spaced repetition. It grows with correct reviews and dips when a Name is forgotten.
        </p>
      </Card>

      <div className="mt-6 rounded-3xl border border-coral/30 bg-coral/5 p-5">
        <p className="font-display font-800 text-stone-600">Reset Progress</p>
        <p className="mt-1 text-xs font-700 text-stone-400">This permanently erases all progress, XP, streaks, and badges.</p>
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} className="btn-3d mt-3 rounded-xl bg-white px-4 py-2 text-sm font-800 text-coral border border-coral/40">
            Reset…
          </button>
        ) : (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                reset()
                nav('dashboard')
              }}
              className="btn-3d rounded-xl bg-coral px-4 py-2 text-sm font-800 text-white shadow-pop"
            >
              Yes, erase everything
            </button>
            <button onClick={() => setConfirmReset(false)} className="btn-3d rounded-xl bg-white px-4 py-2 text-sm font-800 text-stone-500 border border-stone-200">
              Cancel
            </button>
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-stone-400 text-balance">
        All data is stored privately on this device. No account or login needed.
      </p>
    </div>
  )
}

function Metric({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-3xl bg-white/90 p-4 shadow-card border border-white">
      <div className="text-2xl">{icon}</div>
      <div className="mt-1 font-display font-800 text-xl text-emerald2-dark">{value}</div>
      <div className="text-[11px] font-700 uppercase tracking-wide text-stone-400">{label}</div>
    </div>
  )
}
