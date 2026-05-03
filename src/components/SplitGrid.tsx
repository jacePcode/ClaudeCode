import { useState, useRef, useEffect } from 'react'
import { Plus, Play, CheckCircle, X, ChevronDown, BarChart2, Star } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useStore } from '../store/store'
import type { Session, SessionSet } from '../types'
import CellEditor from './CellEditor'
import ExerciseChart from './ExerciseChart'

interface CellKey {
  sessionId: string
  setId: string
  exerciseId: string
}

interface Props {
  splitDayId: string
  onRestartTimer: () => void
}

export default function SplitGrid({ splitDayId, onRestartTimer }: Props) {
  const splitDays = useStore((s) => s.splitDays)
  const sessions = useStore((s) => s.getSessionsForDay(splitDayId))
  const activeSessionId = useStore((s) => s.activeSessionId)
  const startSession = useStore((s) => s.startSession)
  const finishSession = useStore((s) => s.finishSession)
  const cancelSession = useStore((s) => s.cancelSession)
  const updateSetEntry = useStore((s) => s.updateSetEntry)
  const addSetRow = useStore((s) => s.addSetRow)
  const removeSetRow = useStore((s) => s.removeSetRow)
  const toggleSetType = useStore((s) => s.toggleSetType)
  const addExerciseToDay = useStore((s) => s.addExerciseToDay)
  const getPR = useStore((s) => s.getPR)

  const splitDay = splitDays.find((d) => d.id === splitDayId)
  const exercises = splitDay?.exercises.filter((e) => !e.isDeleted) ?? []

  const [editingCell, setEditingCell] = useState<CellKey | null>(null)
  const [chartExerciseId, setChartExerciseId] = useState<string | null>(null)
  const [addingExercise, setAddingExercise] = useState(false)
  const [newExName, setNewExName] = useState('')
  const [finishNotes, setFinishNotes] = useState('')
  const [showFinish, setShowFinish] = useState(false)
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const newExInputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when a new session starts
  useEffect(() => {
    if (activeSessionId) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100)
    }
  }, [activeSessionId])

  useEffect(() => {
    if (addingExercise) newExInputRef.current?.focus()
  }, [addingExercise])

  const handleCellTap = (sessionId: string, setId: string, exerciseId: string) => {
    setEditingCell({ sessionId, setId, exerciseId })
  }

  const handleSaveCell = (sessionId: string, setId: string, exerciseId: string, weight: number | null, reps: number | null) => {
    updateSetEntry(sessionId, setId, exerciseId, weight, reps)
    onRestartTimer()
  }

  const handleAddExercise = () => {
    const name = newExName.trim()
    if (!name) return
    addExerciseToDay(splitDayId, name)
    setNewExName('')
    setAddingExercise(false)
  }

  const handleFinish = () => {
    finishSession(finishNotes)
    setFinishNotes('')
    setShowFinish(false)
  }

  const formatCell = (weight: number | null, reps: number | null) => {
    if (weight == null && reps == null) return ''
    if (weight == null) return `—×${reps}`
    if (reps == null) return `${weight}×—`
    return `${weight}×${reps}`
  }

  const getSetLabel = (set: SessionSet) => {
    if (set.type === 'warmup') return `WU${set.setNumber}`
    return `S${set.setNumber}`
  }

  const isPR = (exerciseId: string, weight: number | null, reps: number | null) => {
    if (!weight || !reps) return false
    const pr = getPR(exerciseId)
    if (!pr) return false
    return weight >= pr.weight && reps >= pr.reps
  }

  // Group sessions: historical (collapsed by default) + active
  const historicalSessions = sessions.filter((s) => s.id !== activeSessionId && s.endTime != null)
  const activeSession = sessions.find((s) => s.id === activeSessionId)

  const renderSessionRows = (sess: Session, isActive: boolean) => {
    const isExpanded = isActive || expandedSessionId === sess.id
    const workingSets = sess.sets.filter((r) => r.type === 'working')
    const warmupSets = sess.sets.filter((r) => r.type === 'warmup')
    const allSets = [...warmupSets, ...workingSets]

    return (
      <tbody key={sess.id}>
        {/* Day header row */}
        <tr
          className={`cursor-pointer select-none ${isActive ? 'bg-zinc-800/60' : 'bg-zinc-900/50 hover:bg-zinc-900'}`}
          onClick={() => !isActive && setExpandedSessionId(expandedSessionId === sess.id ? null : sess.id)}
        >
          <td
            className={`sticky left-0 z-10 px-3 py-2.5 border-b ${
              isActive ? 'bg-zinc-800 border-sky-500/30' : 'bg-zinc-900 border-zinc-800'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-[60px]">
              {isActive ? (
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              ) : (
                <ChevronDown
                  size={12}
                  className={`text-zinc-600 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                />
              )}
              <div>
                <p className={`text-xs font-semibold leading-tight ${isActive ? 'text-sky-400' : 'text-zinc-300'}`}>
                  Day {sess.dayNumber}
                </p>
                <p className="text-[10px] text-zinc-600 leading-tight">
                  {format(parseISO(sess.date), 'MMM d')}
                </p>
              </div>
            </div>
          </td>
          {exercises.map((ex) => {
            const best = workingSets.length > 0
              ? workingSets.reduce((b, r) => {
                  const e = r.entries[ex.id]
                  if (!e?.weight) return b
                  if (!b?.weight || e.weight > b.weight) return e
                  return b
                }, null as { weight: number | null; reps: number | null } | null)
              : null
            return (
              <td key={ex.id} className={`px-2 py-2.5 text-center border-b border-zinc-800 ${isActive ? 'bg-zinc-800/20' : ''}`}>
                {best?.weight != null ? (
                  <span className="text-xs text-zinc-500">
                    {formatCell(best.weight, best.reps)}
                  </span>
                ) : (
                  <span className="text-zinc-700 text-xs">—</span>
                )}
              </td>
            )
          })}
          {/* Add exercise column placeholder */}
          <td className={`px-2 py-2.5 border-b border-zinc-800 ${isActive ? 'bg-zinc-800/20' : ''}`} />
        </tr>

        {/* Set rows */}
        {isExpanded && allSets.map((setRow) => {
          const isWarmup = setRow.type === 'warmup'
          return (
            <tr key={setRow.id} className={`group ${isActive ? 'bg-zinc-800/30' : 'bg-zinc-950'}`}>
              <td
                className={`sticky left-0 z-10 px-3 py-2 border-b border-zinc-800/50 ${
                  isActive ? 'bg-zinc-800/50' : 'bg-zinc-950'
                }`}
              >
                <div className="flex items-center gap-1 min-w-[60px]">
                  {isActive && (
                    <button
                      onClick={() => toggleSetType(sess.id, setRow.id)}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors ${
                        isWarmup
                          ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                          : 'bg-sky-500/20 text-sky-400 hover:bg-sky-500/30'
                      }`}
                    >
                      {isWarmup ? 'WU' : 'W'}
                    </button>
                  )}
                  <span className={`text-xs ${isWarmup ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {getSetLabel(setRow)}
                  </span>
                  {isActive && (
                    <button
                      onClick={() => removeSetRow(sess.id, setRow.id)}
                      className="ml-auto opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-400 transition-all"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              </td>

              {exercises.map((ex) => {
                const entry = setRow.entries[ex.id]
                const w = entry?.weight ?? null
                const r = entry?.reps ?? null
                const hasPR = isActive && isPR(ex.id, w, r)
                const formatted = formatCell(w, r)

                return (
                  <td
                    key={ex.id}
                    onClick={() => handleCellTap(sess.id, setRow.id, ex.id)}
                    className={`px-2 py-2 text-center border-b border-zinc-800/50 transition-colors cursor-pointer ${
                      isActive
                        ? 'hover:bg-zinc-700/40 active:bg-zinc-700/60'
                        : 'hover:bg-zinc-900/80'
                    } ${isWarmup ? 'opacity-60' : ''}`}
                  >
                    <div className="relative inline-flex items-center justify-center min-w-[52px]">
                      {hasPR && (
                        <Star size={8} className="absolute -top-1 -right-1 text-amber-400 fill-amber-400" />
                      )}
                      <span className={`text-xs font-mono ${formatted ? (isWarmup ? 'text-zinc-500' : 'text-zinc-200') : 'text-zinc-700'}`}>
                        {formatted || (isActive ? '·  ·' : '—')}
                      </span>
                    </div>
                  </td>
                )
              })}
              <td className={`px-2 py-2 border-b border-zinc-800/50 ${isActive ? 'bg-zinc-800/10' : ''}`} />
            </tr>
          )
        })}

        {/* Active session controls */}
        {isActive && isExpanded && (
          <tr className="bg-zinc-800/20">
            <td colSpan={exercises.length + 2} className="px-3 py-2">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => addSetRow(sess.id, 'working')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors"
                >
                  <Plus size={12} />
                  Set
                </button>
                <button
                  onClick={() => addSetRow(sess.id, 'warmup')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors"
                >
                  <Plus size={12} />
                  Warm-up
                </button>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Grid */}
      <div className="flex-1 overflow-auto">
        {exercises.length === 0 && sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center mb-4">
              <BarChart2 size={24} className="text-zinc-600" />
            </div>
            <p className="text-zinc-400 font-medium mb-2">No exercises yet</p>
            <p className="text-sm text-zinc-600 mb-6">Add exercises to this day to start tracking</p>
            <button
              onClick={() => setAddingExercise(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-400 transition-colors"
            >
              <Plus size={16} />
              Add Exercise
            </button>
          </div>
        ) : (
          <table className="border-collapse w-full" style={{ minWidth: `${exercises.length * 80 + 100}px` }}>
            <thead>
              <tr className="bg-zinc-950">
                {/* Corner */}
                <th className="sticky left-0 top-0 z-30 bg-zinc-950 border-b border-r border-zinc-800 px-3 py-2.5 min-w-[72px]">
                  <span className="text-[10px] text-zinc-600 font-medium">DAY / SET</span>
                </th>

                {/* Exercise column headers */}
                {exercises.map((ex) => {
                  const pr = getPR(ex.id)
                  return (
                    <th
                      key={ex.id}
                      className="sticky top-0 z-20 bg-zinc-950 border-b border-zinc-800 px-2 py-2 min-w-[72px] max-w-[100px]"
                    >
                      <button
                        onClick={() => setChartExerciseId(ex.id)}
                        className="group flex flex-col items-center gap-0.5 w-full"
                      >
                        <span className="text-xs font-medium text-zinc-300 leading-tight text-center line-clamp-2 group-hover:text-sky-400 transition-colors">
                          {ex.name}
                        </span>
                        {pr && (
                          <span className="text-[10px] text-zinc-600">
                            PR {pr.weight}
                          </span>
                        )}
                      </button>
                    </th>
                  )
                })}

                {/* Add exercise column */}
                <th className="sticky top-0 z-20 bg-zinc-950 border-b border-zinc-800 px-2 py-2 w-10">
                  {!addingExercise ? (
                    <button
                      onClick={() => setAddingExercise(true)}
                      className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 transition-colors mx-auto"
                    >
                      <Plus size={14} />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <input
                        ref={newExInputRef}
                        value={newExName}
                        onChange={(e) => setNewExName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddExercise()
                          if (e.key === 'Escape') { setAddingExercise(false); setNewExName('') }
                        }}
                        placeholder="Exercise name..."
                        className="min-w-[140px] bg-zinc-800 border border-sky-500/40 rounded-lg px-2 py-1 text-xs text-zinc-100 placeholder-zinc-600 outline-none"
                      />
                      <button onClick={handleAddExercise} className="text-sky-400 hover:text-sky-300">
                        <Plus size={14} />
                      </button>
                      <button onClick={() => { setAddingExercise(false); setNewExName('') }} className="text-zinc-600 hover:text-zinc-400">
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </th>
              </tr>
            </thead>

            {/* Historical sessions */}
            {historicalSessions.map((sess) => renderSessionRows(sess, false))}

            {/* Active session */}
            {activeSession && renderSessionRows(activeSession, true)}

            <tbody>
              <tr>
                <td colSpan={exercises.length + 2} ref={bottomRef as React.RefObject<HTMLTableCellElement>} />
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-3 flex gap-2">
        {activeSessionId ? (
          <>
            <button
              onClick={() => setShowFinish(true)}
              className="flex-1 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-emerald-500/30 transition-colors border border-emerald-500/30"
            >
              <CheckCircle size={16} />
              Finish Session
            </button>
            <button
              onClick={cancelSession}
              className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <button
            onClick={() => startSession(splitDayId)}
            className="flex-1 py-3 rounded-xl bg-sky-500 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-sky-400 active:bg-sky-600 transition-colors"
          >
            <Play size={15} className="fill-white" />
            Start Session
          </button>
        )}
      </div>

      {/* Cell editor */}
      {editingCell && (() => {
        const sess = sessions.find((s) => s.id === editingCell.sessionId)
        const setRow = sess?.sets.find((r) => r.id === editingCell.setId)
        const ex = exercises.find((e) => e.id === editingCell.exerciseId)
        const entry = setRow?.entries[editingCell.exerciseId]
        const isActive = editingCell.sessionId === activeSessionId
        return (
          <CellEditor
            key={`${editingCell.sessionId}-${editingCell.setId}-${editingCell.exerciseId}`}
            exerciseName={ex?.name ?? ''}
            setLabel={setRow ? getSetLabel(setRow) : ''}
            initialWeight={entry?.weight ?? null}
            initialReps={entry?.reps ?? null}
            isReadOnly={!isActive}
            onSave={(w, r) => handleSaveCell(editingCell.sessionId, editingCell.setId, editingCell.exerciseId, w, r)}
            onClose={() => setEditingCell(null)}
          />
        )
      })()}

      {/* Finish session modal */}
      {showFinish && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowFinish(false)} />
          <div className="relative w-full bg-zinc-900 rounded-t-2xl border-t border-zinc-800 p-5 pb-8">
            <div className="w-10 h-1 rounded-full bg-zinc-700 mx-auto mb-5" />
            <h3 className="text-base font-semibold text-zinc-100 mb-4">Finish Session</h3>
            <textarea
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none resize-none mb-4 focus:border-sky-500/50 transition-colors"
              placeholder="Session notes (optional)..."
              rows={3}
              value={finishNotes}
              onChange={(e) => setFinishNotes(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowFinish(false)}
                className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-400 transition-colors"
              >
                Save & Finish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise chart */}
      {chartExerciseId && (
        <ExerciseChart
          exerciseId={chartExerciseId}
          exerciseName={exercises.find((e) => e.id === chartExerciseId)?.name ?? ''}
          onClose={() => setChartExerciseId(null)}
        />
      )}
    </div>
  )
}

