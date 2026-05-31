import { useGame } from '../context/GameContext'
import { BADGES } from '../lib/badges'
import { TopBar } from '../components/TopBar'
import type { View } from '../App'

export function BadgesScreen({ nav }: { nav: (v: View) => void }) {
  const { state } = useGame()
  const earnedCount = state.badges.length

  return (
    <div className="mx-auto max-w-md px-5 pb-28 pt-4">
      <TopBar title="My Badges 🏆" onBack={() => nav('dashboard')} />
      <p className="mt-2 text-sm font-700 text-stone-500">
        {earnedCount} of {BADGES.length} badges earned
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {BADGES.map((b) => {
          const earned = state.badges.includes(b.id)
          return (
            <div
              key={b.id}
              className={`rounded-3xl border p-5 text-center shadow-card transition-all ${
                earned ? 'border-gold bg-gradient-to-br from-white to-sand-100' : 'border-stone-200 bg-white/60'
              }`}
            >
              <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-4xl ${earned ? 'bg-gradient-to-br from-amber2 to-gold shadow-pop animate-pop' : 'bg-stone-200 grayscale'}`}>
                {earned ? b.icon : '🔒'}
              </div>
              <p className={`mt-3 font-display font-800 ${earned ? 'text-emerald2-dark' : 'text-stone-400'}`}>{b.title}</p>
              <p className="mt-1 text-xs font-700 text-stone-400">{b.description}</p>
              {earned && <p className="mt-2 text-xs font-800 uppercase tracking-wide text-amber2">Unlocked ✓</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
