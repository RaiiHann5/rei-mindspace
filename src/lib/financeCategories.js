import {
  UtensilsCrossed, Car, ShoppingBag, Receipt, Film, HeartPulse,
  GraduationCap, MoreHorizontal, Briefcase, Landmark, Gift, Banknote, Home,
} from 'lucide-react'

export const EXPENSE_CATEGORIES = [
  { value: 'makanan', label: 'Makanan', icon: UtensilsCrossed, color: 'amber' },
  { value: 'transportasi', label: 'Transportasi', icon: Car, color: 'primary' },
  { value: 'belanja', label: 'Belanja', icon: ShoppingBag, color: 'rose' },
  { value: 'tagihan', label: 'Tagihan', icon: Receipt, color: 'teal' },
  { value: 'hiburan', label: 'Hiburan', icon: Film, color: 'primary' },
  { value: 'kesehatan', label: 'Kesehatan', icon: HeartPulse, color: 'rose' },
  { value: 'pendidikan', label: 'Pendidikan', icon: GraduationCap, color: 'teal' },
  { value: 'tempat_tinggal', label: 'Tempat Tinggal', icon: Home, color: 'amber' },
  { value: 'lainnya', label: 'Lainnya', icon: MoreHorizontal, color: 'default' },
]

export const INCOME_CATEGORIES = [
  { value: 'gaji', label: 'Gaji', icon: Briefcase, color: 'teal' },
  { value: 'freelance', label: 'Freelance', icon: Banknote, color: 'primary' },
  { value: 'investasi', label: 'Investasi', icon: Landmark, color: 'amber' },
  { value: 'hadiah', label: 'Hadiah', icon: Gift, color: 'rose' },
  { value: 'lainnya', label: 'Lainnya', icon: MoreHorizontal, color: 'default' },
]

export function categoriesFor(type) {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
}

export function categoryInfo(type, value) {
  const list = categoriesFor(type)
  return list.find((c) => c.value === value) || list[list.length - 1]
}

// Slice colours for the category pie chart. Kept as literal hex because
// Recharts resolves SVG `fill` outside the cascade, so a CSS var is not an
// option here. Deliberately low-chroma so the chart sits inside the Space+
// palette instead of fighting the ember accent — and the ember is only ever
// the first slice, so the "one glow per screen" rule holds.
export const CHART_PALETTE = [
  '#FF7A29', // ember 500 — the one accent series
  '#A6BDB9', // teal 300
  '#E4D3AE', // amber 300
  '#D9A0A8', // rose 300
  '#8D89A6', // dusk
  '#6E8C88', // teal 500
  '#C0A876', // amber 500
  '#A8535F', // rose 500
  '#3F5553', // teal 700
]
