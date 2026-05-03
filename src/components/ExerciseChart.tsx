import { X, TrendingUp } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useStore } from '../store/store'

interface Props {
  exerciseId: string
  exerciseName: string
  onClose: () => void
}

export default function ExerciseChart({ exerciseId, exerciseName, onClose }: Props) {
  const getExerciseHistory = useStore((s) => s.getExerciseHistory)
  const getPR = useStore((s) => s.getPR)

  const history = getExerciseHistory(exerciseId).slice(-20)
  const pr = getPR(exerciseId)

  const WIDTH = 320
  const HEIGHT = 140
  const PAD = { top: 12, right: 12, bottom: 28, left: 36 }
  const chartW = WIDTH - PAD.left - PAD.right
  const chartH = HEIGHT - PAD.top - PAD.bottom

  const weights = history.map((h) => h.maxWeight).filter((w) => w > 0)
  const minW = weights.length ? Math.min(...weights) : 0
  const maxW = weights.length ? Math.max(...weights) : 100
  const range = maxW - minW || 10

  const toX = (i: number) => PAD.left + (i / Math.max(history.length - 1, 1)) * chartW
  const toY = (w: number) => PAD.top + chartH - ((w - minW) / range) * chartH

  const points = history.map((h, i) => ({ x: toX(i), y: toY(h.maxWeight), ...h }))
  const pathD = points.length > 1
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
    : ''

  const areaD = pathD
    ? `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(PAD.top + chartH).toFixed(1)} L ${PAD.left} ${(PAD.top + chartH).toFixed(1)} Z`
    : ''

  const yTicks = [minW, minW + range / 2, maxW].map((v) => Math.round(v))

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full bg-zinc-900 rounded-t-2xl border-t border-zinc-800 p-5 pb-8 max-h-[80vh] overflow-y-auto">
        <div className="w-10 h-1 rounded-full bg-zinc-700 mx-auto mb-4" />

        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-100">{exerciseName}</h3>
            <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
              <TrendingUp size={11} />
              Max weight per session
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-zinc-500">
            <X size={18} />
          </button>
        </div>

        {/* PR badge */}
        {pr && (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 mb-4">
            <span className="text-amber-400 text-xs font-semibold">PR</span>
            <span className="text-zinc-200 text-sm font-bold">{pr.weight} lbs × {pr.reps} reps</span>
            <span className="ml-auto text-zinc-500 text-xs">{format(parseISO(pr.date), 'MMM d, yyyy')}</span>
          </div>
        )}

        {history.length < 2 ? (
          <div className="text-center py-8 text-zinc-500 text-sm">
            {history.length === 0 ? 'No data yet' : 'Log at least 2 sessions to see a trend'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <svg width={WIDTH} height={HEIGHT} className="block mx-auto">
              {/* Y grid lines */}
              {yTicks.map((v) => (
                <g key={v}>
                  <line
                    x1={PAD.left}
                    y1={toY(v)}
                    x2={PAD.left + chartW}
                    y2={toY(v)}
                    stroke="#3f3f46"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                  <text
                    x={PAD.left - 4}
                    y={toY(v) + 4}
                    textAnchor="end"
                    fontSize="9"
                    fill="#71717a"
                  >
                    {v}
                  </text>
                </g>
              ))}

              {/* Area fill */}
              {areaD && (
                <path d={areaD} fill="url(#chartGrad)" opacity="0.3" />
              )}

              {/* Line */}
              {pathD && (
                <path d={pathD} fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              )}

              {/* Points */}
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3" fill="#0ea5e9" />
              ))}

              {/* X axis labels (first, middle, last) */}
              {[0, Math.floor((points.length - 1) / 2), points.length - 1]
                .filter((i, idx, arr) => arr.indexOf(i) === idx)
                .map((i) => (
                  <text
                    key={i}
                    x={points[i].x}
                    y={HEIGHT - 4}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#71717a"
                  >
                    Day {points[i].dayNumber}
                  </text>
                ))}

              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}

        {/* Recent sessions list */}
        {history.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-zinc-500 mb-2 font-medium">Recent sessions</p>
            <div className="space-y-1.5">
              {[...history].reverse().slice(0, 5).map((h, i) => (
                <div key={i} className="flex items-center justify-between bg-zinc-800/50 rounded-lg px-3 py-2">
                  <span className="text-xs text-zinc-500">Day {h.dayNumber} · {format(parseISO(h.date), 'MMM d')}</span>
                  <span className="text-xs font-semibold text-zinc-200">{h.maxWeight} lbs</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
