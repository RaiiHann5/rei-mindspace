import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

// Streak bars wear the habit's own tone so a habit keeps its identity across
// the heatmap, the streak chart and its chip. No ember here — the streak chart
// is the quiet half of the analytics screen.
const TONES = {
  primary: '#6E8C88', // teal-500
  teal: '#A6BDB9', // teal-300
  amber: '#C0A876', // amber-500
  rose: '#A8535F', // rose-500
}

const TOOLTIP = {
  borderRadius: 10,
  border: '1px solid var(--line)',
  background: 'var(--tooltip-bg)',
  color: 'var(--tooltip-ink)',
  fontSize: 12,
  boxShadow: 'var(--tooltip-shadow)',
}

const TICK = { fontSize: 11, fill: 'var(--color-dusk)' }

export default function HabitStreakChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--line)" />
        <XAxis dataKey="name" tick={TICK} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip contentStyle={TOOLTIP} />
        <Bar dataKey="streak" radius={[4, 4, 0, 0]} maxBarSize={32}>
          {data.map((d, i) => <Cell key={i} fill={TONES[d.color] || TONES.primary} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
