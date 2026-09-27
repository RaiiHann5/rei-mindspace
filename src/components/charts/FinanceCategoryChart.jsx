import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/financeStats'

// Low-chroma slice palette taken straight from the Space+ status tokens. Only
// the first slice gets ember so the biggest category still reads as the focus;
// everything after it steps down into teal / amber / rose / dusk so nine
// categories never turn into nine neon rings.
const SLICE_COLORS = [
  '#FF7A29', // ember-500 — the one accent
  '#6E8C88', // teal-500
  '#C0A876', // amber-500
  '#A8535F', // rose-500
  '#A6BDB9', // teal-300
  '#E4D3AE', // amber-300
  '#D9A0A8', // rose-300
  '#8D89A6', // dusk
  '#566F6C', // teal-600
]

const TOOLTIP = {
  borderRadius: 10,
  border: '1px solid var(--line)',
  background: 'var(--tooltip-bg)',
  color: 'var(--tooltip-ink)',
  fontSize: 12,
  boxShadow: 'var(--tooltip-shadow)',
}

export default function FinanceCategoryChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="category"
          innerRadius={55}
          outerRadius={82}
          paddingAngle={1.5}
          stroke="none"
        >
          {data.map((entry, i) => (
            <Cell key={entry.category} fill={SLICE_COLORS[i % SLICE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, _name, item) => [formatCurrency(value), item?.payload?.info?.label || _name]}
          contentStyle={TOOLTIP}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
