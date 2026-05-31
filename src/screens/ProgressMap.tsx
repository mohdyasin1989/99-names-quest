import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { NAMES } from '../data/names'
import { TopBar } from '../components/TopBar'
import type { View } from '../App'

export function ProgressMap({ nav }: { nav: (v: View) => void }) {
  const { state } = useGame()
  const [selected, setSelected] = useState<number | null>(null)

  // The "current" milestone is the first not-yet-learned Name.
  const currentId = NAMES.find((n) => !state.progress[n.id]?.learned)?.id ?? null

  return (
    <div className="mx-auto max-w-md px-5 pb-28 pt-4">
      <TopBar title="My Journey 🗺️" onBack={() => nav('dashboard')} />
      <p className="mt-2 text-sm font-700 text-stone-500">
        {NAMES.filter((n) => state.progress[n.id]?.learned).length} of 99 milestones unlocked
      </p>

      <div className="mt-6 grid grid-cols-5 gap-2.5 sm:grid-cols-6">
        {NAMES.map((n) => {
          const p = state.progress[n.id]
          const learned = p?.learned
          const isCurrent = n.id === currentId
          const mastered = (p?.mastery ?? 0) >= 80
          let cls = 'bg-white/70 border-stone-200 text-stone-300' // locked
          if (learned) cls = mastered ? 'bg-gradient-to-br from-amber2 to-gold border-gold text-white shadow-pop' : 'bg-emerald2 border-emerald2 text-white shadow-pop'
          if (isCurrent) cls = 'bg-white border-amber2 text-amber2 animate-floaty shadow-pop ring-2 ring-amber2/40'
          return (
            <button
              key={n.id}
              onClick={() => setSelected(n.id)}
              className={`btn-3d relative aspect-square rounded-2xl border-2 font-display font-800 text-sm transition-colors ${cls}`}
              title={learned ? n.transliteration : 'Locked'}
            >
              {learned ? (mastered ? '★' : n.id) : isCurrent ? '◉' : '🔒'}
              <span className="absolute -bottom-0.5 right-1 text-[8px] opacity-80">{n.id}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs font-700 text-stone-500">
        <Legend swatch="bg-emerald2" label="Learned" />
        <Legend swatch="bg-gradient-to-br from-amber2 to-gold" label="Mastered ★" />
        <Legend swatch="bg-white border-2 border-amber2" label="Current ◉" />
        <Legend swatch="bg-white/70 border-2 border-stone-200" label="Locked 🔒" />
      </div>

      {selected !== null && <NamePeek id={selected} learned={!!state.progress[selected]?.learned} mastery={state.progress[selected]?.mastery ?? 0} onClose={() => setSelected(null)} />}
    </div>
  )
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-4 w-4 rounded-md ${swatch}`} />
      {label}
    </span>
  )
}

function NamePeek({ id, learned, mastery, onClose }: { id: number; learned: boolean; mastery: number; onClose: () => void }) {
  const n = NAMES.find((x) => x.id === id)!
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-sm animate-slidein rounded-3xl bg-white p-6 text-center shadow-card" onClick={(e) => e.stopPropagation()}>
        {learned ? (
          <>
            <div className="font-arabic text-6xl text-emerald2-dark" dir="rtl">{n.arabic}</div>
            <div className="mt-2 font-display font-800 text-2xl text-emerald2-dark">{n.transliteration}</div>
            <div className="font-700 text-amber2">{n.meaning}</div>
            <p className="mt-3 text-stone-600 text-balance">{n.explanation}</p>
            <div className="mt-4 rounded-full bg-emerald2/10 px-4 py-2 text-sm font-800 text-emerald2-dark">Mastery: {mastery}%</div>
          </>
        ) : (
          <>
            <div className="text-5xl">🔒</div>
            <p className="mt-3 font-display font-800 text-xl text-stone-500">Name #{n.id} is locked</p>
            <p className="mt-1 text-sm font-700 text-stone-400">Keep learning to unlock this milestone!</p>
          </>
        )}
        <button onClick={onClose} className="btn-3d mt-5 w-full rounded-2xl bg-emerald2 py-3 font-display font-800 text-white shadow-pop">
          Close
        </button>
      </div>
    </div>
  )
}
