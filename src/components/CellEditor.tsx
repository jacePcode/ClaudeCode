import { useState, useEffect, useRef } from 'react'
import { Check, X } from 'lucide-react'

interface Props {
  exerciseName: string
  setLabel: string
  initialWeight: number | null
  initialReps: number | null
  onSave: (weight: number | null, reps: number | null) => void
  onClose: () => void
  isReadOnly?: boolean
  onEnableEdit?: () => void
}

const WEIGHT_NUDGES = [-5, -2.5, +2.5, +5]
const REP_NUDGES = [-1, +1]

export default function CellEditor({
  exerciseName,
  setLabel,
  initialWeight,
  initialReps,
  onSave,
  onClose,
  isReadOnly = false,
  onEnableEdit,
}: Props) {
  const [weight, setWeight] = useState<string>(initialWeight != null ? String(initialWeight) : '')
  const [reps, setReps] = useState<string>(initialReps != null ? String(initialReps) : '')
  const [editing, setEditing] = useState(!isReadOnly)
  const weightRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      weightRef.current?.focus()
      weightRef.current?.select()
    }
  }, [editing])

  const handleSave = () => {
    const w = weight === '' ? null : parseFloat(weight)
    const r = reps === '' ? null : parseInt(reps, 10)
    onSave(isNaN(w as number) ? null : w, isNaN(r as number) ? null : r)
    onClose()
  }

  const nudgeWeight = (delta: number) => {
    const current = parseFloat(weight) || 0
    const next = Math.max(0, current + delta)
    setWeight(String(next % 1 === 0 ? next : next.toFixed(1)))
  }

  const nudgeReps = (delta: number) => {
    const current = parseInt(reps) || 0
    const next = Math.max(0, current + delta)
    setReps(String(next))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full bg-zinc-900 rounded-t-2xl border-t border-zinc-800 p-5 pb-8">
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-zinc-700 mx-auto mb-4" />

        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-base font-semibold text-zinc-100">{exerciseName}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{setLabel}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-zinc-500">
            <X size={18} />
          </button>
        </div>

        {isReadOnly && !editing ? (
          <div className="text-center py-4">
            <p className="text-3xl font-bold text-zinc-100 tracking-tight">
              {initialWeight ?? '—'}
              <span className="text-zinc-500 text-xl mx-2">×</span>
              {initialReps ?? '—'}
            </p>
            <p className="text-xs text-zinc-500 mt-2 mb-5">lbs × reps</p>
            <button
              onClick={() => {
                onEnableEdit?.()
                setEditing(true)
              }}
              className="px-6 py-2.5 rounded-xl bg-zinc-800 text-sm text-zinc-300 font-medium hover:bg-zinc-700 transition-colors"
            >
              Edit
            </button>
          </div>
        ) : (
          <>
            {/* Weight row */}
            <div className="mb-4">
              <label className="text-xs text-zinc-500 mb-2 block font-medium">Weight (lbs)</label>
              <div className="flex items-center gap-2">
                {WEIGHT_NUDGES.map((d) => (
                  <button
                    key={d}
                    onClick={() => nudgeWeight(d)}
                    className="flex-1 py-2 rounded-lg bg-zinc-800 text-xs font-medium text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                  >
                    {d > 0 ? `+${d}` : d}
                  </button>
                ))}
              </div>
              <input
                ref={weightRef}
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="mt-2 w-full bg-zinc-800 border border-zinc-700 focus:border-sky-500/60 rounded-xl px-4 py-3 text-2xl font-bold text-zinc-100 text-center outline-none transition-colors"
              />
            </div>

            {/* Reps row */}
            <div className="mb-5">
              <label className="text-xs text-zinc-500 mb-2 block font-medium">Reps</label>
              <div className="flex items-center gap-2 mb-2">
                {REP_NUDGES.map((d) => (
                  <button
                    key={d}
                    onClick={() => nudgeReps(d)}
                    className="flex-1 py-2 rounded-lg bg-zinc-800 text-xs font-medium text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                  >
                    {d > 0 ? `+${d}` : d}
                  </button>
                ))}
              </div>
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-sky-500/60 rounded-xl px-4 py-3 text-2xl font-bold text-zinc-100 text-center outline-none transition-colors"
              />
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              className="w-full py-3.5 rounded-xl bg-sky-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-sky-400 active:bg-sky-600 transition-colors"
            >
              <Check size={16} />
              Save
            </button>
          </>
        )}
      </div>
    </div>
  )
}
