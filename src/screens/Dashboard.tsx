import { useGame, useStats } from '../context/GameContext'
import { dueForReview } from '../lib/srs'
import { namesForDay, totalLessonDays } from '../lib/plan'
import { Button, Card, ProgressBar, StatPill } from '../components/ui'
import type { View } from '../App'

export function Dashboard({ nav }: { nav: (v: View) => void }) {
  const { state } = useGame()
  const stats = useStats()
  const totalDays = totalLessonDays(state.planDays)
  const allLessonsDone = state.currentDay > totalDays
  const todaysNames = allLessonsDone ? [] : namesForDay(state.planDays, state.currentDay)
  const dueIds = dueForReview(state.progress)

  function streakBadge() {
    const s = state.streak
    if (s >= 30) return '🔥 30+ Days'
    if (s >= 7) return '🔥 7 Days'
    return `🔥 ${s} Day${s === 1 ? '' : 's'}`
  }

  return (
    <div className="mx-auto max-w-md px-5 pb-28 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-700 text-stone-500">Assalamu Alaikum,</p>
          <h1 className="font-display font-800 text-3xl text-emerald2-dark leading-tight">{state.childName || 'Friend'} 👋</h1>
        </div>
        <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-amber2 to-gold text-white shadow-pop">
          <span className="text-xl leading-none">{stats.level.icon}</span>
          <span className="text-[10px] font-800">Lv {stats.level.level}</span>
        </div>
      </div>

      {/* Level card */}
      <Card className="mt-5 p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-800 uppercase tracking-wider text-amber2">Your Rank</p>
            <p className="font-display font-800 text-2xl text-emerald2-dark">{stats.level.title}</p>
          </div>
          <div className="text-right">
            <p className="font-display font-800 text-2xl text-emerald2">{state.xp}</p>
            <p className="text-xs font-700 text-stone-400">XP</p>
          </div>
        </div>
        <ProgressBar value={stats.level.progressPct} className="mt-3" />
        <p className="mt-2 text-xs font-700 text-stone-400">
          {stats.level.nextXp ? `${stats.level.nextXp - state.xp} XP to next rank` : 'Highest rank reached! 👑'}
        </p>
      </Card>

      {/* Stat pills */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatPill icon="🔥" label="Streak" value={streakBadge()} color="text-coral" />
        <StatPill icon="📚" label="Learned" value={`${stats.learnedCount}/99`} />
        <StatPill icon="⏳" label="Remaining" value={stats.remaining} color="text-plum" />
        <StatPill icon="🎯" label="Progress" value={`${stats.completionPct}%`} color="text-amber2" />
      </div>

      {/* Today's lesson */}
      <Card className="mt-5 overflow-hidden">
        <div className="bg-gradient-to-br from-emerald2 to-teal2 p-6 text-white pattern-stars">
          {allLessonsDone ? (
            <>
              <p className="text-sm font-700 text-white/80">Mashallah! 🎉</p>
              <h2 className="font-display font-800 text-2xl">You've finished every lesson!</h2>
              <p className="mt-1 text-sm text-white/85">Keep reviewing to become a true Master of the Names.</p>
            </>
          ) : (
            <>
              <p className="text-sm font-700 text-white/80">
                Day {state.currentDay} of {totalDays}
              </p>
              <h2 className="font-display font-800 text-2xl">Today's Lesson</h2>
              <p className="mt-1 text-sm text-white/85">
                {todaysNames.length} new Name{todaysNames.length === 1 ? '' : 's'} waiting for you ✨
              </p>
            </>
          )}
        </div>
        {!allLessonsDone && (
          <div className="p-5">
            <Button onClick={() => nav('lesson')} size="lg" variant="gold" className="w-full">
              ▶ Start Today's Lesson
            </Button>
          </div>
        )}
      </Card>

      {/* Reviews */}
      <button
        onClick={() => dueIds.length > 0 && nav('review')}
        disabled={dueIds.length === 0}
        className="btn-3d mt-4 flex w-full items-center justify-between rounded-3xl border border-white bg-white/90 p-5 text-left shadow-card disabled:opacity-60"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-plum/10 text-2xl">🔁</span>
          <div>
            <p className="font-display font-800 text-lg text-emerald2-dark">Today's Reviews</p>
            <p className="text-sm font-700 text-stone-400">
              {dueIds.length > 0 ? `${dueIds.length} Name${dueIds.length === 1 ? '' : 's'} ready to review` : 'All caught up! 🌿'}
            </p>
          </div>
        </div>
        {dueIds.length > 0 && (
          <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-coral px-2 font-800 text-white">{dueIds.length}</span>
        )}
      </button>

      {/* Quick nav */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <NavTile emoji="🗺️" label="Journey" onClick={() => nav('map')} />
        <NavTile emoji="🏆" label="Badges" onClick={() => nav('badges')} />
        <NavTile emoji="👨‍👩‍👧" label="Parents" onClick={() => nav('parent')} />
      </div>
    </div>
  )
}

function NavTile({ emoji, label, onClick }: { emoji: string; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="btn-3d rounded-2xl border border-white bg-white/90 py-4 text-center shadow-card hover:bg-sand-50">
      <div className="text-2xl">{emoji}</div>
      <div className="mt-1 font-display font-800 text-sm text-emerald2-dark">{label}</div>
    </button>
  )
}
