import { useState, useEffect, useRef, useCallback } from 'react'
import { Timer, ChevronDown } from 'lucide-react'

const PRESETS = [60, 90, 120, 180]

interface Props {
  sessionStart: number
  restDuration: number
  onDurationChange: (d: number) => void
  triggerCount: number  // increment to auto-restart
}

export default function RestTimer({ sessionStart, restDuration, onDurationChange, triggerCount }: Props) {
  const [elapsed, setElapsed] = useState(0)
  const [restRemaining, setRestRemaining] = useState<number | null>(null)
  const [restRunning, setRestRunning] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevTrigger = useRef(triggerCount)

  // Session elapsed time
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStart) / 1000))
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [sessionStart])

  const stopRest = useCallback(() => {
    if (restRef.current) clearInterval(restRef.current)
    setRestRunning(false)
    setRestRemaining(null)
  }, [])

  const startRest = useCallback((duration: number) => {
    if (restRef.current) clearInterval(restRef.current)
    setRestRemaining(duration)
    setRestRunning(true)
    restRef.current = setInterval(() => {
      setRestRemaining((r) => {
        if (r == null || r <= 1) {
          clearInterval(restRef.current!)
          setRestRunning(false)
          try { navigator.vibrate([200, 100, 200]) } catch {}
          return null
        }
        return r - 1
      })
    }, 1000)
  }, [])

  // Auto-start rest when a set is saved (triggerCount increments)
  useEffect(() => {
    if (triggerCount > prevTrigger.current) {
      prevTrigger.current = triggerCount
      startRest(restDuration)
    }
  }, [triggerCount, restDuration, startRest])

  const handleRestTap = () => {
    if (restRunning) {
      stopRest()
    } else {
      startRest(restDuration)
    }
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  const isLow = restRemaining != null && restRemaining <= 10

  return (
    <div className="flex items-center bg-zinc-900 border-b border-zinc-800 px-4 py-2 gap-3 relative">
      {/* Session elapsed */}
      <div className="flex items-center gap-1.5 text-zinc-500">
        <Timer size={13} />
        <span className="text-xs font-mono tabular-nums">{formatTime(elapsed)}</span>
      </div>

      <div className="flex-1" />

      {/* Preset picker (inline) */}
      {showPresets && (
        <div className="flex gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => {
                onDurationChange(p)
                startRest(p)
                setShowPresets(false)
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                p === restDuration
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {p < 60 ? `${p}s` : `${p / 60}m`}
            </button>
          ))}
        </div>
      )}

      {/* Rest countdown */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleRestTap}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold tabular-nums transition-colors ${
            restRunning
              ? isLow
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {restRunning && restRemaining != null ? (
            <>
              <span className={`w-1.5 h-1.5 rounded-full ${isLow ? 'bg-amber-400 animate-pulse' : 'bg-sky-400'}`} />
              {formatTime(restRemaining)}
            </>
          ) : (
            <>Rest {formatTime(restDuration)}</>
          )}
        </button>

        <button
          onClick={() => setShowPresets((v) => !v)}
          className={`w-6 h-6 flex items-center justify-center text-zinc-600 hover:text-zinc-400 transition-all ${showPresets ? 'rotate-180' : ''}`}
        >
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  )
}
