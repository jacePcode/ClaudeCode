import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format } from 'date-fns'
import type { Exercise, SplitDay, Session, SessionSet, AppSettings } from '../types'

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function today() {
  return format(new Date(), 'yyyy-MM-dd')
}

interface StoreState {
  hasCompletedSetup: boolean
  splitDays: SplitDay[]
  sessions: Session[]
  activeSessionId: string | null
  activeSplitDayId: string | null
  settings: AppSettings

  // Setup
  completeSetup: (splitDays: SplitDay[]) => void

  // Split day management
  addSplitDay: (name: string) => SplitDay
  updateSplitDay: (id: string, name: string) => void
  deleteSplitDay: (id: string) => void
  reorderSplitDays: (ids: string[]) => void
  setActiveSplitDay: (id: string) => void

  // Exercise (column) management
  addExerciseToDay: (splitDayId: string, name: string, muscles?: string[]) => void
  updateExercise: (splitDayId: string, exerciseId: string, name: string, muscles: string[]) => void
  removeExerciseFromDay: (splitDayId: string, exerciseId: string) => void
  reorderExercises: (splitDayId: string, exerciseIds: string[]) => void

  // Session management
  startSession: (splitDayId: string) => void
  finishSession: (notes?: string) => void
  cancelSession: () => void
  updateSetEntry: (sessionId: string, setId: string, exerciseId: string, weight: number | null, reps: number | null) => void
  addSetRow: (sessionId: string, type?: 'warmup' | 'working') => void
  removeSetRow: (sessionId: string, setId: string) => void
  toggleSetType: (sessionId: string, setId: string) => void
  updateSessionNotes: (sessionId: string, notes: string) => void

  // Settings
  updateSettings: (patch: Partial<AppSettings>) => void

  // Derived helpers (not stored, computed)
  getLastSession: (splitDayId: string) => Session | undefined
  getSessionsForDay: (splitDayId: string) => Session[]
  getExerciseHistory: (exerciseId: string) => { date: string; dayNumber: number; maxWeight: number; sets: { weight: number | null; reps: number | null }[] }[]
  getPR: (exerciseId: string) => { weight: number; reps: number; date: string } | undefined
  getActiveSession: () => Session | undefined
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      hasCompletedSetup: false,
      splitDays: [],
      sessions: [],
      activeSessionId: null,
      activeSplitDayId: null,
      settings: {
        unit: 'lbs',
        restDuration: 90,
        autoStartRest: true,
      },

      completeSetup: (splitDays) => {
        set({
          hasCompletedSetup: true,
          splitDays,
          activeSplitDayId: splitDays[0]?.id ?? null,
        })
      },

      addSplitDay: (name) => {
        const day: SplitDay = { id: uid(), name, exercises: [] }
        set((s) => ({ splitDays: [...s.splitDays, day] }))
        return day
      },

      updateSplitDay: (id, name) => {
        set((s) => ({
          splitDays: s.splitDays.map((d) => (d.id === id ? { ...d, name } : d)),
        }))
      },

      deleteSplitDay: (id) => {
        set((s) => {
          const remaining = s.splitDays.filter((d) => d.id !== id)
          return {
            splitDays: remaining,
            activeSplitDayId:
              s.activeSplitDayId === id ? (remaining[0]?.id ?? null) : s.activeSplitDayId,
          }
        })
      },

      reorderSplitDays: (ids) => {
        set((s) => ({
          splitDays: ids.map((id) => s.splitDays.find((d) => d.id === id)!).filter(Boolean),
        }))
      },

      setActiveSplitDay: (id) => set({ activeSplitDayId: id }),

      addExerciseToDay: (splitDayId, name, muscles = []) => {
        const ex: Exercise = { id: uid(), name, primaryMuscles: muscles }
        set((s) => ({
          splitDays: s.splitDays.map((d) =>
            d.id === splitDayId ? { ...d, exercises: [...d.exercises, ex] } : d
          ),
        }))
      },

      updateExercise: (splitDayId, exerciseId, name, muscles) => {
        set((s) => ({
          splitDays: s.splitDays.map((d) =>
            d.id === splitDayId
              ? {
                  ...d,
                  exercises: d.exercises.map((e) =>
                    e.id === exerciseId ? { ...e, name, primaryMuscles: muscles } : e
                  ),
                }
              : d
          ),
        }))
      },

      removeExerciseFromDay: (splitDayId, exerciseId) => {
        set((s) => ({
          splitDays: s.splitDays.map((d) =>
            d.id === splitDayId
              ? { ...d, exercises: d.exercises.map((e) => e.id === exerciseId ? { ...e, isDeleted: true } : e) }
              : d
          ),
        }))
      },

      reorderExercises: (splitDayId, exerciseIds) => {
        set((s) => ({
          splitDays: s.splitDays.map((d) => {
            if (d.id !== splitDayId) return d
            const ordered = exerciseIds
              .map((id) => d.exercises.find((e) => e.id === id))
              .filter(Boolean) as Exercise[]
            const rest = d.exercises.filter((e) => !exerciseIds.includes(e.id))
            return { ...d, exercises: [...ordered, ...rest] }
          }),
        }))
      },

      startSession: (splitDayId) => {
        const { sessions, getLastSession } = get()
        const last = getLastSession(splitDayId)
        const dayNumber = sessions.filter((s) => s.splitDayId === splitDayId).length + 1

        const splitDay = get().splitDays.find((d) => d.id === splitDayId)
        const exercises = splitDay?.exercises.filter((e) => !e.isDeleted) ?? []

        const makeEntries = (_setId?: string, lastSet?: SessionSet) => {
          const entries: Record<string, { weight: number | null; reps: number | null }> = {}
          for (const ex of exercises) {
            const prev = lastSet?.entries[ex.id]
            entries[ex.id] = { weight: prev?.weight ?? null, reps: prev?.reps ?? null }
          }
          return entries
        }

        // Build 3 working sets pre-filled from last session
        const sets: SessionSet[] = []
        const lastWorkingSets = last?.sets.filter((s) => s.type === 'working') ?? []

        for (let i = 0; i < 3; i++) {
          const lastSet = lastWorkingSets[i] ?? lastWorkingSets[lastWorkingSets.length - 1]
          const id = uid()
          sets.push({
            id,
            setNumber: i + 1,
            type: 'working',
            entries: makeEntries(id, lastSet),
          })
        }

        const session: Session = {
          id: uid(),
          splitDayId,
          date: today(),
          dayNumber,
          sets,
          startTime: Date.now(),
        }

        set((s) => ({
          sessions: [...s.sessions, session],
          activeSessionId: session.id,
        }))
      },

      finishSession: (notes) => {
        const { activeSessionId } = get()
        if (!activeSessionId) return
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === activeSessionId
              ? { ...sess, endTime: Date.now(), notes: notes ?? sess.notes }
              : sess
          ),
          activeSessionId: null,
        }))
      },

      cancelSession: () => {
        const { activeSessionId } = get()
        if (!activeSessionId) return
        set((s) => ({
          sessions: s.sessions.filter((sess) => sess.id !== activeSessionId),
          activeSessionId: null,
        }))
      },

      updateSetEntry: (sessionId, setId, exerciseId, weight, reps) => {
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id !== sessionId
              ? sess
              : {
                  ...sess,
                  sets: sess.sets.map((row) =>
                    row.id !== setId
                      ? row
                      : { ...row, entries: { ...row.entries, [exerciseId]: { weight, reps } } }
                  ),
                }
          ),
        }))
      },

      addSetRow: (sessionId, type = 'working') => {
        set((s) => {
          const sess = s.sessions.find((x) => x.id === sessionId)
          if (!sess) return s
          const workingSets = sess.sets.filter((r) => r.type === 'working')
          const warmupSets = sess.sets.filter((r) => r.type === 'warmup')
          const lastSet =
            type === 'working'
              ? workingSets[workingSets.length - 1]
              : warmupSets[warmupSets.length - 1] ?? workingSets[0]

          const setNumber =
            type === 'working'
              ? workingSets.length + 1
              : warmupSets.length + 1

          const newSet: SessionSet = {
            id: uid(),
            setNumber,
            type,
            entries: lastSet
              ? { ...lastSet.entries }
              : Object.fromEntries(
                  (s.splitDays.find((d) => d.id === sess.splitDayId)?.exercises ?? [])
                    .filter((e) => !e.isDeleted)
                    .map((e) => [e.id, { weight: null, reps: null }])
                ),
          }

          // Insert warmup sets before working sets
          let newSets: SessionSet[]
          if (type === 'warmup') {
            const firstWorking = sess.sets.findIndex((r) => r.type === 'working')
            if (firstWorking === -1) {
              newSets = [...sess.sets, newSet]
            } else {
              newSets = [
                ...sess.sets.slice(0, firstWorking),
                newSet,
                ...sess.sets.slice(firstWorking),
              ]
            }
          } else {
            newSets = [...sess.sets, newSet]
          }

          // Renumber
          let wNum = 1, wuNum = 1
          newSets = newSets.map((r) => {
            if (r.type === 'working') return { ...r, setNumber: wNum++ }
            return { ...r, setNumber: wuNum++ }
          })

          return {
            sessions: s.sessions.map((x) =>
              x.id === sessionId ? { ...x, sets: newSets } : x
            ),
          }
        })
      },

      removeSetRow: (sessionId, setId) => {
        set((s) => ({
          sessions: s.sessions.map((sess) => {
            if (sess.id !== sessionId) return sess
            let sets = sess.sets.filter((r) => r.id !== setId)
            // Renumber
            let wNum = 1, wuNum = 1
            sets = sets.map((r) => {
              if (r.type === 'working') return { ...r, setNumber: wNum++ }
              return { ...r, setNumber: wuNum++ }
            })
            return { ...sess, sets }
          }),
        }))
      },

      toggleSetType: (sessionId, setId) => {
        set((s) => ({
          sessions: s.sessions.map((sess) => {
            if (sess.id !== sessionId) return sess
            let sets = sess.sets.map((r) =>
              r.id === setId ? { ...r, type: r.type === 'working' ? ('warmup' as const) : ('working' as const) } : r
            )
            // Sort: warmup first, working after
            sets = [...sets.filter((r) => r.type === 'warmup'), ...sets.filter((r) => r.type === 'working')]
            // Renumber
            let wNum = 1, wuNum = 1
            sets = sets.map((r) => {
              if (r.type === 'working') return { ...r, setNumber: wNum++ }
              return { ...r, setNumber: wuNum++ }
            })
            return { ...sess, sets }
          }),
        }))
      },

      updateSessionNotes: (sessionId, notes) => {
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === sessionId ? { ...sess, notes } : sess
          ),
        }))
      },

      updateSettings: (patch) => {
        set((s) => ({ settings: { ...s.settings, ...patch } }))
      },

      getLastSession: (splitDayId) => {
        const { sessions, activeSessionId } = get()
        return sessions
          .filter((s) => s.splitDayId === splitDayId && s.id !== activeSessionId && s.endTime != null)
          .sort((a, b) => b.startTime - a.startTime)[0]
      },

      getSessionsForDay: (splitDayId) => {
        return get()
          .sessions.filter((s) => s.splitDayId === splitDayId)
          .sort((a, b) => a.startTime - b.startTime)
      },

      getExerciseHistory: (exerciseId) => {
        const { sessions } = get()
        return sessions
          .filter((s) => s.endTime != null)
          .sort((a, b) => a.startTime - b.startTime)
          .map((sess) => {
            const workingSets = sess.sets
              .filter((r) => r.type === 'working')
              .map((r) => r.entries[exerciseId])
              .filter(Boolean)
            const weights = workingSets
              .map((e) => e.weight)
              .filter((w): w is number => w != null)
            return {
              date: sess.date,
              dayNumber: sess.dayNumber,
              maxWeight: weights.length ? Math.max(...weights) : 0,
              sets: workingSets,
            }
          })
          .filter((h) => h.maxWeight > 0)
      },

      getPR: (exerciseId) => {
        const history = get().getExerciseHistory(exerciseId)
        if (!history.length) return undefined
        let best: { weight: number; reps: number; date: string } | undefined
        for (const session of history) {
          for (const s of session.sets) {
            if (s.weight && s.reps) {
              if (!best || s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps)) {
                best = { weight: s.weight, reps: s.reps, date: session.date }
              }
            }
          }
        }
        return best
      },

      getActiveSession: () => {
        const { sessions, activeSessionId } = get()
        return sessions.find((s) => s.id === activeSessionId)
      },
    }),
    {
      name: 'workout-tracker-v1',
    }
  )
)
