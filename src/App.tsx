import { useEffect, useState } from 'react'
import { useGame } from './context/GameContext'
import { Onboarding } from './screens/Onboarding'
import { Dashboard } from './screens/Dashboard'
import { Lesson } from './screens/Lesson'
import { Review, type ReviewMode } from './screens/Review'
import { ProgressMap } from './screens/ProgressMap'
import { BadgesScreen } from './screens/BadgesScreen'
import { ParentDashboard } from './screens/ParentDashboard'
import { Settings } from './screens/Settings'

export type View = 'dashboard' | 'lesson' | 'review' | 'practice' | 'map' | 'badges' | 'parent' | 'settings'

export default function App() {
  const { state } = useGame()
  const [view, setView] = useState<View>('dashboard')

  // Scroll to top whenever the screen changes.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [view])

  if (!state.onboarded) return <Onboarding />

  const reviewMode: ReviewMode = view === 'practice' ? 'practice' : 'due'

  return (
    <div className="min-h-screen">
      {view === 'dashboard' && <Dashboard nav={setView} />}
      {view === 'lesson' && <Lesson nav={setView} />}
      {(view === 'review' || view === 'practice') && <Review nav={setView} mode={reviewMode} />}
      {view === 'map' && <ProgressMap nav={setView} />}
      {view === 'badges' && <BadgesScreen nav={setView} />}
      {view === 'parent' && <ParentDashboard nav={setView} />}
      {view === 'settings' && <Settings nav={setView} />}
    </div>
  )
}
