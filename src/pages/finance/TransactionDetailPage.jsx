import { useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { id as idLocale } from 'date-fns/locale'
import { format, startOfMonth } from 'date-fns'
import { ArrowLeft, Pencil, Trash2, ArrowUpRight, ArrowDownRight, Hash, Trophy, Layers } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCollection } from '@/hooks/useCollection'
import { Card, Badge, Button, Skeleton } from '@/components/ui'
import TransactionFormModal from './TransactionFormModal'
import { categoryInfo } from '@/lib/financeCategories'
import { formatCurrency, categoryRank } from '@/lib/financeStats'
import { cn } from '@/lib/utils'

const iconTone = {
  primary: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
  teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  default: 'bg-black/5 dark:bg-white/5 text-inherit',
}

export default function TransactionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { items, isLoading, updateItem, removeItem } = useCollection('transactions')
  const [modalOpen, setModalOpen] = useState(false)

  const tx = items.find((t) => t.id === id)

  const rank = useMemo(() => {
    if (!tx) return null
    return categoryRank(items, startOfMonth(new Date(tx.date)), tx)
  }, [items, tx])

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-40" /><Skeleton className="h-64 rounded-3xl" /></div>

  if (!tx) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-light dark:text-muted-dark mb-4">Transaksi tidak ditemukan.</p>
        <Link to="/finance" className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
          <ArrowLeft size={15} /> Kembali ke Finance
        </Link>
      </div>
    )
  }

  const info = categoryInfo(tx.type, tx.category)
  const isIncome = tx.type === 'income'

  const save = async (data) => { await updateItem(tx.id, data); toast.success('Transaksi diperbarui'); setModalOpen(false) }
  const del = async () => {
    if (confirm(`Hapus transaksi "${tx.note || info.label}"?`)) {
      await removeItem(tx.id); toast.success('Transaksi dihapus'); navigate('/finance')
    }
  }

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/finance')} className="flex items-center gap-1.5 text-sm text-muted-light dark:text-muted-dark hover:text-inherit">
        <ArrowLeft size={15} /> Kembali ke Finance
      </button>

      <Card className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn('h-14 w-14 rounded-2xl flex items-center justify-center shrink-0', iconTone[info.color] || iconTone.default)}>
            <info.icon size={26} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="font-display text-xl font-semibold tracking-tight truncate">{tx.note || info.label}</h1>
              <Badge tone={isIncome ? 'teal' : 'rose'}>{isIncome ? 'Pemasukan' : 'Pengeluaran'}</Badge>
            </div>
            <p className="text-sm text-muted-light dark:text-muted-dark capitalize">
              {info.label}
            </p>
            <p className="text-[11px] text-dusk">
              {format(new Date(tx.date), 'EEEE, d MMMM yyyy', { locale: idLocale })}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}><Pencil size={14} /> Edit</Button>
          <Button variant="danger" size="sm" onClick={del}><Trash2 size={14} /> Hapus</Button>
        </div>
      </Card>

      <Card className="flex flex-col items-center text-center gap-2 py-8">
        <p className="text-[11px] font-medium text-dusk">Jumlah</p>
        <p className={cn('num text-4xl flex items-center gap-2', isIncome ? 'text-teal-600 dark:text-teal-400' : 'text-rose-500')}>
          {isIncome ? <ArrowUpRight size={28} /> : <ArrowDownRight size={28} />}
          {formatCurrency(tx.amount)}
        </p>
      </Card>

      {rank && rank.of > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="flex flex-col items-center text-center gap-1.5">
            <Hash size={16} className="text-primary-600 dark:text-primary-400" />
            <p className="num text-lg">{rank.rank}<span className="text-dusk">/{rank.of}</span></p>
            <p className="text-[11px] font-medium text-dusk">Peringkat di kategori bulan ini</p>
          </Card>
          <Card className="flex flex-col items-center text-center gap-1.5">
            <Trophy size={16} className="text-amber-500" />
            <p className="font-mono tabular-nums text-lg">{formatCurrency(rank.categoryAvg)}</p>
            <p className="text-[11px] font-medium text-dusk">Rata-rata kategori bulan ini</p>
          </Card>
          <Card className="flex flex-col items-center text-center gap-1.5">
            <Layers size={16} className="text-teal-500" />
            <p className="font-mono tabular-nums text-lg">{formatCurrency(rank.categoryTotal)}</p>
            <p className="text-[11px] font-medium text-dusk">Total kategori bulan ini</p>
          </Card>
        </div>
      )}

      {tx.note && (
        <Card>
          <h3 className="font-display text-sm font-semibold tracking-tight mb-2">Catatan</h3>
          <p className="text-sm text-muted-light dark:text-muted-dark whitespace-pre-wrap">{tx.note}</p>
        </Card>
      )}

      <TransactionFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={save} initial={tx} />
    </div>
  )
}
