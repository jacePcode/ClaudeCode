import { Plus, Settings } from 'lucide-react'
import { useStore } from '../store/store'

interface Props {
  onManageSplits: () => void
}

export default function TabBar({ onManageSplits }: Props) {
  const splitDays = useStore((s) => s.splitDays)
  const activeSplitDayId = useStore((s) => s.activeSplitDayId)
  const activeSessionId = useStore((s) => s.activeSessionId)
  const setActiveSplitDay = useStore((s) => s.setActiveSplitDay)
  const addSplitDay = useStore((s) => s.addSplitDay)

  const handleAddDay = () => {
    const name = `Day ${splitDays.length + 1}`
    const day = addSplitDay(name)
    setActiveSplitDay(day.id)
  }

  return (
    <div className="flex items-stretch bg-zinc-900 border-t border-zinc-800 overflow-x-auto">
      {splitDays.map((day) => {
        const isActive = day.id === activeSplitDayId
        const hasActiveSession = activeSessionId != null
        const isCurrentSession = isActive && hasActiveSession

        return (
          <button
            key={day.id}
            onClick={() => setActiveSplitDay(day.id)}
            className={`flex-shrink-0 flex flex-col items-center justify-center px-4 py-2 min-w-[72px] relative transition-colors ${
              isActive ? 'text-sky-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {isCurrentSession && (
              <span className="absolute top-1.5 right-2.5 w-1.5 h-1.5 rounded-full bg-sky-400" />
            )}
            <span
              className={`text-xs font-medium leading-tight text-center max-w-[80px] truncate ${
                isActive ? 'text-sky-400' : ''
              }`}
            >
              {day.name}
            </span>
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-sky-400" />
            )}
          </button>
        )
      })}

      {/* Add day */}
      <button
        onClick={handleAddDay}
        className="flex-shrink-0 flex items-center justify-center px-3 py-2 text-zinc-600 hover:text-zinc-400 transition-colors border-l border-zinc-800"
      >
        <Plus size={16} />
      </button>

      {/* Manage splits */}
      <button
        onClick={onManageSplits}
        className="flex-shrink-0 flex items-center justify-center px-3 py-2 text-zinc-600 hover:text-zinc-400 transition-colors border-l border-zinc-800 ml-auto"
      >
        <Settings size={16} />
      </button>
    </div>
  )
}
