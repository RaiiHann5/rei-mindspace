const toneMap = {
  primary: 'var(--color-primary-500)',
  teal: 'var(--color-teal-500)',
  amber: 'var(--color-amber-500)',
  rose: 'var(--color-rose-500)',
}

export default function RingStat({ value = 0, label, sub, tone = 'primary', size = 56 }) {
  const stroke = 5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.min(100, Math.max(0, value))
  const color = toneMap[tone] || toneMap.primary

  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke}
          className="text-black/[0.07] dark:text-white/[0.09]"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .6s ease' }}
        />
      </svg>
      <div className="min-w-0">
        <p className="num text-lg leading-tight">{Math.round(pct)}%</p>
        <p className="text-xs font-medium truncate">{label}</p>
        {sub && <p className="text-[11px] text-muted-light dark:text-muted-dark truncate">{sub}</p>}
      </div>
    </div>
  )
}
