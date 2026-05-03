import { useState } from 'react'
import { Plus, Trash2, ChevronRight, Dumbbell } from 'lucide-react'
import { useStore } from '../store/store'
import type { SplitDay, Exercise } from '../types'

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const MUSCLE_OPTIONS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core']

export default function SetupWizard() {
  const completeSetup = useStore((s) => s.completeSetup)
  const [step, setStep] = useState<'days' | 'exercises'>('days')
  const [days, setDays] = useState<SplitDay[]>([
    { id: uid(), name: 'Push A', exercises: [] },
    { id: uid(), name: 'Pull A', exercises: [] },
    { id: uid(), name: 'Legs A', exercises: [] },
  ])
  const [activeDayIndex, setActiveDayIndex] = useState(0)
  const [newDayName, setNewDayName] = useState('')
  const [newExName, setNewExName] = useState('')
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([])

  const addDay = () => {
    const name = newDayName.trim()
    if (!name) return
    setDays((d) => [...d, { id: uid(), name, exercises: [] }])
    setNewDayName('')
  }

  const removeDay = (id: string) => {
    setDays((d) => d.filter((x) => x.id !== id))
    setActiveDayIndex(0)
  }

  const updateDayName = (id: string, name: string) => {
    setDays((d) => d.map((x) => (x.id === id ? { ...x, name } : x)))
  }

  const addExercise = () => {
    const name = newExName.trim()
    if (!name) return
    const ex: Exercise = { id: uid(), name, primaryMuscles: selectedMuscles }
    setDays((d) =>
      d.map((day, i) =>
        i === activeDayIndex ? { ...day, exercises: [...day.exercises, ex] } : day
      )
    )
    setNewExName('')
    setSelectedMuscles([])
  }

  const removeExercise = (exId: string) => {
    setDays((d) =>
      d.map((day, i) =>
        i === activeDayIndex ? { ...day, exercises: day.exercises.filter((e) => e.id !== exId) } : day
      )
    )
  }

  const toggleMuscle = (m: string) => {
    setSelectedMuscles((ms) => (ms.includes(m) ? ms.filter((x) => x !== m) : [...ms, m]))
  }

  const handleFinish = () => {
    const validDays = days.filter((d) => d.name.trim())
    if (validDays.length === 0) return
    completeSetup(validDays)
  }

  const activeDay = days[activeDayIndex]

  return (
    <div className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
            <Dumbbell size={20} className="text-sky-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">Set up your tracker</h1>
            <p className="text-sm text-zinc-500">Takes about 2 minutes</p>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="px-5 mb-6 flex gap-2">
        {(['days', 'exercises'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                step === s
                  ? 'bg-sky-500 text-white'
                  : i < (['days', 'exercises'] as const).indexOf(step)
                  ? 'bg-emerald-500 text-white'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-sm ${step === s ? 'text-zinc-100' : 'text-zinc-500'}`}>
              {s === 'days' ? 'Split days' : 'Exercises'}
            </span>
            {i < 1 && <div className="w-6 h-px bg-zinc-800 mx-1" />}
          </div>
        ))}
      </div>

      <div className="flex-1 px-5 overflow-y-auto">
        {step === 'days' ? (
          <div>
            <p className="text-sm text-zinc-400 mb-4">
              Name your training days. You can always add, rename, or remove them later.
            </p>

            <div className="space-y-2 mb-4">
              {days.map((day) => (
                <div key={day.id} className="flex items-center gap-2 bg-zinc-900 rounded-xl px-4 py-3">
                  <input
                    className="flex-1 bg-transparent text-zinc-100 outline-none text-sm font-medium"
                    value={day.name}
                    onChange={(e) => updateDayName(day.id, e.target.value)}
                    placeholder="Day name..."
                  />
                  <button
                    onClick={() => removeDay(day.id)}
                    className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add day */}
            <div className="flex gap-2 mb-8">
              <input
                className="flex-1 bg-zinc-900 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none border border-zinc-800 focus:border-sky-500/50 transition-colors"
                placeholder="Add another day..."
                value={newDayName}
                onChange={(e) => setNewDayName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addDay()}
              />
              <button
                onClick={addDay}
                className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-zinc-400 mb-4">
              Add exercises for each day. These become your column headers.
            </p>

            {/* Day tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {days.map((day, i) => (
                <button
                  key={day.id}
                  onClick={() => setActiveDayIndex(i)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeDayIndex === i
                      ? 'bg-sky-500 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {day.name}
                  {day.exercises.length > 0 && (
                    <span className="ml-2 text-xs opacity-70">{day.exercises.length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Exercise list */}
            {activeDay && (
              <div>
                <div className="space-y-2 mb-4">
                  {activeDay.exercises.length === 0 && (
                    <p className="text-sm text-zinc-600 text-center py-4">No exercises yet</p>
                  )}
                  {activeDay.exercises.map((ex, i) => (
                    <div key={ex.id} className="flex items-center gap-2 bg-zinc-900 rounded-xl px-4 py-3">
                      <span className="w-5 text-xs text-zinc-600 text-center">{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-100">{ex.name}</p>
                        {ex.primaryMuscles.length > 0 && (
                          <p className="text-xs text-zinc-500 mt-0.5">{ex.primaryMuscles.join(', ')}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeExercise(ex.id)}
                        className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add exercise */}
                <div className="bg-zinc-900 rounded-xl p-4 mb-4">
                  <input
                    className="w-full bg-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none border border-zinc-700 focus:border-sky-500/50 transition-colors mb-3"
                    placeholder="Exercise name (e.g. Bench Press)"
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addExercise()}
                  />
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {MUSCLE_OPTIONS.map((m) => (
                      <button
                        key={m}
                        onClick={() => toggleMuscle(m)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          selectedMuscles.includes(m)
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                            : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={addExercise}
                    disabled={!newExName.trim()}
                    className="w-full py-2.5 rounded-lg bg-zinc-800 text-sm text-zinc-300 font-medium flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-zinc-700 transition-colors"
                  >
                    <Plus size={15} />
                    Add Exercise
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer buttons */}
      <div className="px-5 pb-10 pt-4 flex gap-3">
        {step === 'exercises' && (
          <button
            onClick={() => setStep('days')}
            className="flex-1 py-3.5 rounded-xl bg-zinc-900 text-zinc-300 text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            Back
          </button>
        )}
        {step === 'days' ? (
          <button
            onClick={() => setStep('exercises')}
            disabled={days.filter((d) => d.name.trim()).length === 0}
            className="flex-1 py-3.5 rounded-xl bg-sky-500 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-sky-400 transition-colors"
          >
            Next
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="flex-1 py-3.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition-colors"
          >
            Start Tracking
          </button>
        )}
      </div>
    </div>
  )
}
