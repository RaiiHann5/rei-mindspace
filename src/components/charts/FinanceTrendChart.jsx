import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { formatCurrency } from '@/lib/financeStats'

// Spend is the series the user is trying to shrink, so it keeps the ember;
// income steps back into teal. Both are the low-chroma token values.
const EXPENSE = '#FF7A29' // ember-500
const INCOME = '#6E8C88' // teal-500

const TOOLTIP = {
  borderRadius: 10,
  border: '1px solid var(--line)',
  background: 'var(--tooltip-bg)',
  color: 'var(--tooltip-ink)',
  fontSize: 12,
  boxShadow: 'var(--tooltip-shadow)',
}

const TICK = { fontSize: 11, fill: 'var(--color-dusk)' }

export default function FinanceTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--line)" />
        <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ ...TICK, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={44}
          tickFormatter={(v) => (v >= 1000000 ? `${Math.round(v / 1000000)}jt` : v >= 1000 ? `${Math.round(v / 1000)}rb` : v)}
        />
        <Tooltip
          formatter={(value, name) => [formatCurrency(value), name === 'income' ? 'Pemasukan' : 'Pengeluaran']}
          cursor={{ fill: 'var(--color-dusk)', opacity: 0.12 }}
          contentStyle={TOOLTIP}
        />
        <Legend
          formatter={(v) => (v === 'income' ? 'Pemasukan' : 'Pengeluaran')}
          wrapperStyle={{ fontSize: 11, color: 'var(--color-muted-dark)' }}
        />
        <Bar dataKey="income" fill={INCOME} radius={[4, 4, 0, 0]} maxBarSize={18} />
        <Bar dataKey="expense" fill={EXPENSE} radius={[4, 4, 0, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  )
}
