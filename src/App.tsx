import { useState, useCallback } from 'react'
import { useStore } from './store/store'
import SetupWizard from './components/SetupWizard'
import TabBar from './components/TabBar'
import SplitGrid from './components/SplitGrid'
import RestTimer from './components/RestTimer'
import ManageSplitsModal from './components/ManageSplitsModal'

export default function App() {
  const hasCompletedSetup = useStore((s) => s.hasCompletedSetup)
  const activeSplitDayId = useStore((s) => s.activeSplitDayId)
  const activeSessionId = useStore((s) => s.activeSessionId)
  const getActiveSession = useStore((s) => s.getActiveSession)
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)

  const [showManage, setShowManage] = useState(false)
  const [restTrigger, setRestTrigger] = useState(0)

  const handleRestartTimer = useCallback(() => {
    if (settings.autoStartRest) {
      setRestTrigger((n) => n + 1)
    }
  }, [settings.autoStartRest])

  if (!hasCompletedSetup) {
    return <SetupWizard />
  }

  if (showManage) {
    return <ManageSplitsModal onClose={() => setShowManage(false)} />
  }

  const activeSession = getActiveSession()

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Rest timer bar — only shown during active session */}
      {activeSessionId && activeSession && (
        <RestTimer
          sessionStart={activeSession.startTime}
          restDuration={settings.restDuration}
          onDurationChange={(d) => updateSettings({ restDuration: d })}
          triggerCount={restTrigger}
        />
      )}

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {activeSplitDayId ? (
          <SplitGrid
            key={activeSplitDayId}
            splitDayId={activeSplitDayId}
            onRestartTimer={handleRestartTimer}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
            No split days yet. Tap + to add one.
          </div>
        )}
      </div>

      {/* Tab bar */}
      <TabBar onManageSplits={() => setShowManage(true)} />
    </div>
  )
}
