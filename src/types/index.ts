export interface Exercise {
  id: string
  name: string
  primaryMuscles: string[]
  isDeleted?: boolean  // soft-delete preserves history
}

export interface SplitDay {
  id: string
  name: string
  exercises: Exercise[]
}

export interface SetEntry {
  weight: number | null
  reps: number | null
}

export interface SessionSet {
  id: string
  setNumber: number
  type: 'warmup' | 'working'
  entries: Record<string, SetEntry>  // exerciseId → SetEntry
}

export interface Session {
  id: string
  splitDayId: string
  date: string           // 'YYYY-MM-DD'
  dayNumber: number      // sequential per split day: 1, 2, 3...
  sets: SessionSet[]
  startTime: number
  endTime?: number
  notes?: string
}

export interface AppSettings {
  unit: 'lbs' | 'kg'
  restDuration: number   // default rest in seconds
  autoStartRest: boolean
}
