import { useState } from 'react'
import { X, Trash2, GripVertical, ChevronRight, Plus, Pencil, Check } from 'lucide-react'
import { useStore } from '../store/store'

interface Props {
  onClose: () => void
}

export default function ManageSplitsModal({ onClose }: Props) {
  const splitDays = useStore((s) => s.splitDays)
  const activeSplitDayId = useStore((s) => s.activeSplitDayId)
  const addSplitDay = useStore((s) => s.addSplitDay)
  const updateSplitDay = useStore((s) => s.updateSplitDay)
  const deleteSplitDay = useStore((s) => s.deleteSplitDay)
  const reorderSplitDays = useStore((s) => s.reorderSplitDays)
  const setActiveSplitDay = useStore((s) => s.setActiveSplitDay)
  const updateExercise = useStore((s) => s.updateExercise)
  const removeExerciseFromDay = useStore((s) => s.removeExerciseFromDay)
  const addExerciseToDay = useStore((s) => s.addExerciseToDay)

  const [editingDayId, setEditingDayId] = useState<string | null>(null)
  const [editingDayName, setEditingDayName] = useState('')
  const [newDayName, setNewDayName] = useState('')
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null)
  const [editingExId, setEditingExId] = useState<string | null>(null)
  const [editingExName, setEditingExName] = useState('')
  const [newExName, setNewExName] = useState('')
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)

  const startEditDay = (id: string, name: string) => {
    setEditingDayId(id)
    setEditingDayName(name)
  }

  const saveDay = (id: string) => {
    if (editingDayName.trim()) updateSplitDay(id, editingDayName.trim())
    setEditingDayId(null)
  }

  const handleAddDay = () => {
    const name = newDayName.trim()
    if (!name) return
    const day = addSplitDay(name)
    setActiveSplitDay(day.id)
    setNewDayName('')
  }

  const handleDeleteDay = (id: string) => {
    if (splitDays.length <= 1) return
    deleteSplitDay(id)
  }

  // Drag-to-reorder for split days
  const handleDragStart = (id: string) => setDragging(id)
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    setDragOver(id)
  }
  const handleDrop = (targetId: string) => {
    if (!dragging || dragging === targetId) { setDragging(null); setDragOver(null); return }
    const ids = splitDays.map((d) => d.id)
    const from = ids.indexOf(dragging)
    const to = ids.indexOf(targetId)
    const reordered = [...ids]
    reordered.splice(from, 1)
    reordered.splice(to, 0, dragging)
    reorderSplitDays(reordered)
    setDragging(null)
    setDragOver(null)
  }

  const startEditEx = (id: string, name: string) => {
    setEditingExId(id)
    setEditingExName(name)
  }

  const saveEx = (splitDayId: string, exId: string) => {
    if (editingExName.trim()) {
      const day = splitDays.find((d) => d.id === splitDayId)
      const ex = day?.exercises.find((e) => e.id === exId)
      updateExercise(splitDayId, exId, editingExName.trim(), ex?.primaryMuscles ?? [])
    }
    setEditingExId(null)
  }

  const handleAddEx = (splitDayId: string) => {
    const name = newExName.trim()
    if (!name) return
    addExerciseToDay(splitDayId, name)
    setNewExName('')
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4 border-b border-zinc-800">
        <h2 className="text-base font-semibold text-zinc-100">Manage Splits</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-100"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {splitDays.map((day) => {
          const isExpanded = expandedDayId === day.id
          const isActive = day.id === activeSplitDayId
          const visibleExercises = day.exercises.filter((e) => !e.isDeleted)

          return (
            <div
              key={day.id}
              className={`bg-zinc-900 rounded-xl border transition-colors ${
                dragOver === day.id ? 'border-sky-500/40' : 'border-zinc-800'
              }`}
              draggable
              onDragStart={() => handleDragStart(day.id)}
              onDragOver={(e) => handleDragOver(e, day.id)}
              onDrop={() => handleDrop(day.id)}
              onDragEnd={() => { setDragging(null); setDragOver(null) }}
            >
              {/* Day header */}
              <div className="flex items-center gap-2 px-3 py-3">
                <GripVertical size={16} className="text-zinc-700 flex-shrink-0 cursor-grab" />

                {editingDayId === day.id ? (
                  <input
                    autoFocus
                    className="flex-1 bg-zinc-800 border border-sky-500/40 rounded-lg px-3 py-1.5 text-sm text-zinc-100 outline-none"
                    value={editingDayName}
                    onChange={(e) => setEditingDayName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveDay(day.id)
                      if (e.key === 'Escape') setEditingDayId(null)
                    }}
                    onBlur={() => saveDay(day.id)}
                  />
                ) : (
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-100">{day.name}</span>
                    {isActive && (
                      <span className="text-[10px] bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded-full border border-sky-500/30">
                        active
                      </span>
                    )}
                    <span className="text-xs text-zinc-600">{visibleExercises.length} exercises</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEditDay(day.id, day.name)}
                    className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:text-zinc-300 transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteDay(day.id)}
                    disabled={splitDays.length <= 1}
                    className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:text-red-400 disabled:opacity-30 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                  <button
                    onClick={() => setExpandedDayId(isExpanded ? null : day.id)}
                    className={`w-7 h-7 flex items-center justify-center text-zinc-500 transition-all ${isExpanded ? 'rotate-90' : ''}`}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Exercises */}
              {isExpanded && (
                <div className="border-t border-zinc-800 px-3 py-3 space-y-1.5">
                  {visibleExercises.length === 0 && (
                    <p className="text-xs text-zinc-600 text-center py-2">No exercises</p>
                  )}
                  {visibleExercises.map((ex) => (
                    <div key={ex.id} className="flex items-center gap-2 bg-zinc-800/50 rounded-lg px-3 py-2">
                      {editingExId === ex.id ? (
                        <>
                          <input
                            autoFocus
                            className="flex-1 bg-zinc-700 border border-sky-500/40 rounded px-2 py-1 text-xs text-zinc-100 outline-none"
                            value={editingExName}
                            onChange={(e) => setEditingExName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEx(day.id, ex.id)
                              if (e.key === 'Escape') setEditingExId(null)
                            }}
                          />
                          <button onClick={() => saveEx(day.id, ex.id)} className="text-emerald-400 hover:text-emerald-300">
                            <Check size={13} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-xs text-zinc-200">{ex.name}</span>
                          {ex.primaryMuscles.length > 0 && (
                            <span className="text-[10px] text-zinc-600">{ex.primaryMuscles.join(', ')}</span>
                          )}
                          <button
                            onClick={() => startEditEx(ex.id, ex.name)}
                            className="text-zinc-600 hover:text-zinc-300 transition-colors"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => removeExerciseFromDay(day.id, ex.id)}
                            className="text-zinc-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Add exercise */}
                  <div className="flex gap-2 mt-2">
                    <input
                      className="flex-1 bg-zinc-800 border border-zinc-700 focus:border-sky-500/40 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
                      placeholder="Add exercise..."
                      value={newExName}
                      onChange={(e) => setNewExName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddEx(day.id)}
                    />
                    <button
                      onClick={() => handleAddEx(day.id)}
                      className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Add new split day */}
        <div className="flex gap-2 pt-2">
          <input
            className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-sky-500/40 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
            placeholder="New split day name..."
            value={newDayName}
            onChange={(e) => setNewDayName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddDay()}
          />
          <button
            onClick={handleAddDay}
            className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
