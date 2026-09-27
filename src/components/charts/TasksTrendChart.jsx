import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

// Teal keeps completed tasks in the "secondary" lane; the ember stays with the
// focus chart on this screen.
const TEAL = '#6E8C88' // teal-500

const TOOLTIP = {
  borderRadius: 10,
  border: '1px solid var(--line)',
  background: 'var(--tooltip-bg)',
  color: 'var(--tooltip-ink)',
  fontSize: 12,
  boxShadow: 'var(--tooltip-shadow)',
}

const TICK = { fontSize: 11, fill: 'var(--color-dusk)' }

export default function TasksTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="tasksFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TEAL} stopOpacity={0.3} />
            <stop offset="100%" stopColor={TEAL} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--line)" />
        <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip contentStyle={TOOLTIP} />
        <Area type="monotone" dataKey="completed" stroke={TEAL} strokeWidth={2} fill="url(#tasksFill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
