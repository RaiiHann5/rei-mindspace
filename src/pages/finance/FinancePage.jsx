import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { id as idLocale } from 'date-fns/locale'
import { format, addMonths, isSameMonth, startOfMonth } from 'date-fns'
import {
  Plus, Settings2, Wallet, TrendingUp, TrendingDown, PiggyBank, Landmark,
  ChevronLeft, ChevronRight, Search, Pencil, Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useCollection } from '@/hooks/useCollection'
import { PageHeader, Button, Card, EmptyState, Skeleton, Progress, Select, Tabs } from '@/components/ui'
import TransactionFormModal from './TransactionFormModal'
import BudgetModal from './BudgetModal'
import FinanceCategoryChart from '@/components/charts/FinanceCategoryChart'
import FinanceTrendChart from '@/components/charts/FinanceTrendChart'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, categoryInfo } from '@/lib/financeCategories'
import {
  formatCurrency, monthLabel, transactionsInMonth, monthSummary,
  categoryBreakdown, spentByCategory, monthlyTrend, allTimeSummary,
} from '@/lib/financeStats'
import { cn } from '@/lib/utils'

const iconTone = {
  primary: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
  teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  default: 'bg-black/5 dark:bg-white/5 text-inherit',
}

export default function FinancePage() {
  const { items: transactions, isLoading, createItem, updateItem, removeItem } = useCollection('transactions')
  const { items: budgets, createItem: createBudget, updateItem: updateBudget, removeItem: removeBudget } = useCollection('budgets')

  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [txModalOpen, setTxModalOpen] = useState(false)
  const [budgetModalOpen, setBudgetModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [typeFilter, setTypeFilter] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [search, setSearch] = useState('')
  const [breakdownType, setBreakdownType] = useState('expense')

  const isCurrentMonth = isSameMonth(month, new Date())
  const summary = useMemo(() => monthSummary(transactions, month), [transactions, month])
  const allTime = useMemo(() => allTimeSummary(transactions), [transactions])
  const breakdown = useMemo(() => categoryBreakdown(transactions, month, breakdownType), [transactions, month, breakdownType])
  const trend = useMemo(() => monthlyTrend(transactions, 6), [transactions])

  const monthTx = useMemo(
    () => [...transactionsInMonth(transactions, month)].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transactions, month]
  )
  const filteredTx = useMemo(() => {
    const q = search.trim().toLowerCase()
    return monthTx.filter((t) => {
      if (typeFilter && t.type !== typeFilter) return false
      if (categoryFilter && t.category !== categoryFilter) return false
      if (q && !(t.note || '').toLowerCase().includes(q) && !categoryInfo(t.type, t.category).label.toLowerCase().includes(q)) return false
      return true
    })
  }, [monthTx, typeFilter, categoryFilter, search])

  const prevMonth = () => setMonth((m) => addMonths(m, -1))
  const nextMonth = () => setMonth((m) => (isSameMonth(m, new Date()) ? m : addMonths(m, 1)))
  const goCurrentMonth = () => setMonth(startOfMonth(new Date()))

  const saveTx = async (data) => {
    if (editing) { await updateItem(editing.id, data); toast.success('Transaksi diperbarui') }
    else { await createItem(data); toast.success('Transaksi ditambahkan') }
    setTxModalOpen(false); setEditing(null)
  }
  const delTx = async (t) => {
    if (confirm(`Hapus transaksi "${t.note || categoryInfo(t.type, t.category).label}"?`)) {
      await removeItem(t.id); toast.success('Transaksi dihapus')
    }
  }

  const saveBudgets = async (newLimits) => {
    const byCategory = new Map(newLimits.map((b) => [b.category, b.limit]))
    const tasks = []
    EXPENSE_CATEGORIES.forEach((c) => {
      const existing = budgets.find((b) => b.category === c.value)
      const newLimit = byCategory.get(c.value)
      if (newLimit == null && existing) tasks.push(removeBudget(existing.id))
      else if (newLimit != null && existing) tasks.push(updateBudget(existing.id, { limit: newLimit }))
      else if (newLimit != null && !existing) tasks.push(createBudget({ category: c.value, limit: newLimit }))
    })
    await Promise.all(tasks)
    toast.success('Anggaran disimpan')
    setBudgetModalOpen(false)
  }

  const allCategoryOptions = typeFilter === 'income' ? INCOME_CATEGORIES : typeFilter === 'expense' ? EXPENSE_CATEGORIES : [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]

  return (
    <div>
      <PageHeader
        title="Finance"
        description="Pemasukan, pengeluaran, anggaran."
        actions={
          <>
            <Button variant="secondary" onClick={() => setBudgetModalOpen(true)}><Settings2 size={16} /> Atur anggaran</Button>
            <Button onClick={() => { setEditing(null); setTxModalOpen(true) }}><Plus size={16} /> Tambah transaksi</Button>
          </>
        }
        tools={
          /* Row 2 — the period navigator. The whole page (tiles, charts, budgets,
             list) reads from one month, so the navigator belongs to the header,
             not to a floating card of its own. */
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} aria-label="Bulan sebelumnya" className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 neo-press">
              <ChevronLeft size={17} />
            </button>
            <div className="text-center px-2 min-w-[190px]">
              <p className="font-display text-[15px] font-semibold tracking-tight capitalize">{monthLabel(month)}</p>
              {!isCurrentMonth && (
                <button onClick={goCurrentMonth} className="text-[11px] font-medium text-primary-600 dark:text-primary-400 hover:underline">
                  Kembali ke bulan ini
                </button>
              )}
            </div>
            <button onClick={nextMonth} disabled={isCurrentMonth} aria-label="Bulan berikutnya" className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none neo-press">
              <ChevronRight size={17} />
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="flex flex-col items-center text-center gap-1.5">
          <TrendingUp size={18} className="text-teal-500" />
          <p className="font-mono tabular-nums text-lg">{formatCurrency(summary.income)}</p>
          <p className="text-[11px] font-medium text-dusk">Pemasukan</p>
        </Card>
        <Card className="flex flex-col items-center text-center gap-1.5">
          <TrendingDown size={18} className="text-rose-500" />
          <p className="font-mono tabular-nums text-lg">{formatCurrency(summary.expense)}</p>
          <p className="text-[11px] font-medium text-dusk">Pengeluaran</p>
        </Card>
        <Card className="flex flex-col items-center text-center gap-1.5">
          <Wallet size={18} className={summary.net >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-rose-500'} />
          <p className={cn('font-mono tabular-nums text-lg', summary.net < 0 && 'text-rose-500')}>{formatCurrency(summary.net)}</p>
          <p className="text-[11px] font-medium text-dusk">Saldo</p>
        </Card>
        <Card className="flex flex-col items-center text-center gap-1.5">
          <PiggyBank size={18} className="text-amber-500" />
          <p className="num text-lg">{summary.savingsRate}%</p>
          <p className="text-[11px] font-medium text-dusk">Tabungan</p>
        </Card>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-primary-500/10 text-primary-600 dark:text-primary-400">
            <Landmark size={18} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-dusk">Saldo total</p>
            <p className={cn('num text-2xl leading-tight', allTime.net < 0 ? 'text-rose-500' : 'ember-num')}>{formatCurrency(allTime.net)}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5 text-xs">
          <span className="text-dusk">Pemasukan <span className="font-mono tabular-nums text-teal-600 dark:text-teal-400">{formatCurrency(allTime.income)}</span></span>
          <span className="text-dusk">Pengeluaran <span className="font-mono tabular-nums text-rose-500">{formatCurrency(allTime.expense)}</span></span>
          <span className="text-dusk"><span className="font-mono tabular-nums">{allTime.count}</span> transaksi</span>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4 mb-5">
        <Card>
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <h3 className="font-display text-sm font-semibold tracking-tight">Per kategori</h3>
            <Tabs
              tabs={[{ value: 'expense', label: 'Pengeluaran' }, { value: 'income', label: 'Pemasukan' }]}
              active={breakdownType}
              onChange={setBreakdownType}
            />
          </div>
          {breakdown.length === 0 ? (
            <p className="text-sm text-muted-light dark:text-muted-dark text-center py-10">
              {breakdownType === 'income' ? 'Belum ada pemasukan bulan ini.' : 'Belum ada pengeluaran bulan ini.'}
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-1/2">
                <FinanceCategoryChart data={breakdown} />
              </div>
              <div className="w-full sm:w-1/2 space-y-1.5">
                {breakdown.slice(0, 6).map((e) => (
                  <div key={e.category} className="flex items-center justify-between text-xs gap-2">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <e.info.icon size={12} className="shrink-0 text-dusk" />
                      <span className="truncate font-medium">{e.info.label}</span>
                    </span>
                    <span className="font-mono tabular-nums shrink-0">{formatCurrency(e.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-sm font-semibold tracking-tight">Anggaran</h3>
          </div>
          {budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-8 gap-2">
              <p className="text-sm text-muted-light dark:text-muted-dark">Belum ada anggaran.</p>
              <Button size="sm" variant="secondary" onClick={() => setBudgetModalOpen(true)}><Settings2 size={13} /> Atur anggaran</Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {budgets.map((b) => {
                const info = categoryInfo('expense', b.category)
                const spent = spentByCategory(transactions, month, b.category)
                const pct = Math.min(100, Math.round((spent / b.limit) * 100))
                const over = spent > b.limit
                return (
                  <div key={b.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium flex items-center gap-1.5"><info.icon size={12} className="text-dusk" /> {info.label}</span>
                      <span className={cn('font-mono tabular-nums text-[11px]', over ? 'text-rose-500' : 'text-dusk')}>
                        {formatCurrency(spent)} / {formatCurrency(b.limit)}
                      </span>
                    </div>
                    <Progress value={pct} tone={over ? 'rose' : pct > 80 ? 'amber' : 'teal'} />
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      <Card className="mb-5">
        <h3 className="font-display text-sm font-semibold tracking-tight mb-2">Tren 6 bulan</h3>
        <FinanceTrendChart data={trend} />
      </Card>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5">
          {[{ v: null, l: 'Semua' }, { v: 'expense', l: 'Pengeluaran' }, { v: 'income', l: 'Pemasukan' }].map((opt) => (
            <button
              key={opt.l}
              onClick={() => { setTypeFilter(opt.v); setCategoryFilter(null) }}
              className={cn('h-8 px-3 rounded-lg text-xs font-semibold neo-press transition-colors',
                typeFilter === opt.v
                  ? 'bg-primary-500/10 text-primary-700 dark:text-ember-300'
                  : 'border border-[color:var(--line)] text-muted-light dark:text-muted-dark hover:border-[color:var(--line-strong)] hover:text-ink-light dark:hover:text-ink-dark')}
            >
              {opt.l}
            </button>
          ))}
        </div>
        <Select value={categoryFilter || ''} onChange={(e) => setCategoryFilter(e.target.value || null)} className="w-44 h-8 text-xs">
          <option value="">Semua kategori</option>
          {allCategoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </Select>
        <div className="relative flex-1 min-w-[160px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-dusk" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi..."
            className="w-full h-8 rounded-md pl-8 pr-3 text-xs font-medium bg-surface-light dark:bg-surface-dark border border-[color:var(--line)] outline-none placeholder:text-dusk placeholder:font-normal focus:border-ember-500/70"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : filteredTx.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title={monthTx.length === 0 ? 'Belum ada transaksi bulan ini.' : 'Tidak ada transaksi yang cocok.'}
          description={monthTx.length === 0 ? 'Catat pemasukan atau pengeluaran pertama.' : 'Coba ubah filter atau kata kunci pencarian.'}
          actionLabel={monthTx.length === 0 ? 'Tambah transaksi' : undefined}
          onAction={() => { setEditing(null); setTxModalOpen(true) }}
          /* The header already carries the screen's single gradient CTA, so the
             empty-state duplicate is demoted to a flat panel button. */
          actionVariant="secondary"
        />
      ) : (
        <Card padding={false} className="divide-y divide-[color:var(--line)] overflow-hidden">
          {filteredTx.map((t) => {
            const info = categoryInfo(t.type, t.category)
            return (
              <Link to={`/finance/${t.id}`} key={t.id} className="group flex items-center gap-3 px-4 py-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0', iconTone[info.color] || iconTone.default)}>
                  <info.icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{t.note || info.label}</p>
                  <p className="text-[11px] text-dusk capitalize truncate">{info.label}</p>
                  <p className="text-[11px] text-dusk">{format(new Date(t.date), 'EEE, d MMM', { locale: idLocale })}</p>
                </div>
                <div className={cn('font-mono tabular-nums text-sm shrink-0', t.type === 'income' ? 'text-teal-600 dark:text-teal-400' : 'text-rose-500')}>
                  {t.type === 'income' ? '+' : '\u2212'}{formatCurrency(t.amount)}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={(e) => { e.preventDefault(); setEditing(t); setTxModalOpen(true) }} aria-label="Edit transaksi" className="h-7 w-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10"><Pencil size={13} /></button>
                  <button onClick={(e) => { e.preventDefault(); delTx(t) }} className="h-7 w-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500"><Trash2 size={13} /></button>
                </div>
              </Link>
            )
          })}
        </Card>
      )}

      <TransactionFormModal open={txModalOpen} onClose={() => { setTxModalOpen(false); setEditing(null) }} onSubmit={saveTx} initial={editing} />
      <BudgetModal open={budgetModalOpen} onClose={() => setBudgetModalOpen(false)} budgets={budgets} onSave={saveBudgets} />
    </div>
  )
}
