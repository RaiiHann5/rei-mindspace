import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

// Focus time is the headline of the analytics screen, so it keeps the ember.
const EMBER = '#FF7A29' // ember-500

const TOOLTIP = {
  borderRadius: 10,
  border: '1px solid var(--line)',
  background: 'var(--tooltip-bg)',
  color: 'var(--tooltip-ink)',
  fontSize: 12,
  boxShadow: 'var(--tooltip-shadow)',
}

const TICK = { fontSize: 11, fill: 'var(--color-dusk)' }

export default function WeeklyFocusChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--line)" />
        <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip
          cursor={{ fill: 'var(--color-dusk)', opacity: 0.12 }}
          contentStyle={TOOLTIP}
        />
        <Bar dataKey="minutes" radius={[4, 4, 4, 4]} fill={EMBER} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  )
}
