import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const TOOLTIP = {
  borderRadius: 10,
  border: '1px solid var(--line)',
  background: 'var(--tooltip-bg)',
  color: 'var(--tooltip-ink)',
  fontSize: 12,
  boxShadow: 'var(--tooltip-shadow)',
}

const TICK = { fontSize: 11, fill: 'var(--color-dusk)' }

export default function GoalsBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke="var(--line)" />
        <XAxis type="number" domain={[0, 100]} tick={TICK} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="title" width={140} tick={{ ...TICK, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP} />
        <Bar dataKey="progress" radius={[0, 4, 4, 0]} fill="#6E8C88" maxBarSize={14} />
      </BarChart>
    </ResponsiveContainer>
  )
}
