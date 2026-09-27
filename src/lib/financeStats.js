import { id as idLocale } from 'date-fns/locale'
import { format, isSameMonth, subMonths, startOfMonth } from 'date-fns'
import { categoryInfo } from './financeCategories'

export function formatCurrency(amount) {
  const n = Number(amount) || 0
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export function monthLabel(date) {
  return format(date, 'MMMM yyyy', { locale: idLocale })
}

export function transactionsInMonth(transactions = [], monthDate) {
  return transactions.filter((t) => isSameMonth(new Date(t.date), monthDate))
}

export function sumByType(transactions = [], type) {
  return transactions.filter((t) => t.type === type).reduce((s, t) => s + (Number(t.amount) || 0), 0)
}

export function monthSummary(transactions = [], monthDate) {
  const inMonth = transactionsInMonth(transactions, monthDate)
  const income = sumByType(inMonth, 'income')
  const expense = sumByType(inMonth, 'expense')
  const net = income - expense
  const savingsRate = income > 0 ? Math.round((net / income) * 100) : 0
  return { income, expense, net, savingsRate, count: inMonth.length }
}

export function categoryBreakdown(transactions = [], monthDate, type = 'expense') {
  const inMonth = transactionsInMonth(transactions, monthDate).filter((t) => t.type === type)
  const totals = {}
  inMonth.forEach((t) => {
    totals[t.category] = (totals[t.category] || 0) + (Number(t.amount) || 0)
  })
  return Object.entries(totals)
    .map(([category, total]) => ({ category, total, info: categoryInfo(type, category) }))
    .sort((a, b) => b.total - a.total)
}

export function spentByCategory(transactions = [], monthDate, category) {
  return transactionsInMonth(transactions, monthDate)
    .filter((t) => t.type === 'expense' && t.category === category)
    .reduce((s, t) => s + (Number(t.amount) || 0), 0)
}

// Balance across every transaction ever recorded (not scoped to a month).
export function allTimeSummary(transactions = []) {
  const income = sumByType(transactions, 'income')
  const expense = sumByType(transactions, 'expense')
  return { income, expense, net: income - expense, count: transactions.length }
}

// Where a single transaction ranks among others of the same type+category this month —
// used on the transaction detail page.
export function categoryRank(transactions = [], monthDate, tx) {
  const peers = transactionsInMonth(transactions, monthDate)
    .filter((t) => t.type === tx.type && t.category === tx.category)
    .sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0))
  const index = peers.findIndex((t) => t.id === tx.id)
  const total = peers.reduce((s, t) => s + (Number(t.amount) || 0), 0)
  const avg = peers.length ? total / peers.length : 0
  return { rank: index + 1, of: peers.length, categoryTotal: total, categoryAvg: avg }
}

// Last N months of income vs expense, oldest first.
export function monthlyTrend(transactions = [], months = 6) {
  const out = []
  for (let i = months - 1; i >= 0; i--) {
    const d = startOfMonth(subMonths(new Date(), i))
    const income = sumByType(transactionsInMonth(transactions, d), 'income')
    const expense = sumByType(transactionsInMonth(transactions, d), 'expense')
    out.push({ label: format(d, 'MMM', { locale: idLocale }), income, expense })
  }
  return out
}
