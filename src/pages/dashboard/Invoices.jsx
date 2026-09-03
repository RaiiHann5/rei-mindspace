import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, FileText, Search } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { listInvoices } from '../../services/invoiceService'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Loader from '../../components/ui/Loader'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/dateUtils'
import { effectiveStatus } from '../../utils/invoiceCalculations'

const FILTERS = ['all', 'draft', 'unpaid', 'paid', 'overdue']

export default function Invoices() {
  const { currentUser } = useAuth()
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setInvoices(await listInvoices(currentUser.uid))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [currentUser.uid])

  const filtered = useMemo(() => {
    return invoices
      .filter((inv) => filter === 'all' || effectiveStatus(inv) === filter)
      .filter((inv) => {
        const q = search.toLowerCase()
        if (!q) return true
        return (inv.invoiceNumber || '').toLowerCase().includes(q) || (inv.clientInfo?.name || '').toLowerCase().includes(q)
      })
  }, [invoices, filter, search])

  if (loading) return <Loader full label={t('common.loading')} />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition ${
                filter === f ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t(`invoices.filters.${f}`)}
            </button>
          ))}
        </div>
        <Link to="/app/invoices/new"><Button icon={Plus} className="shrink-0">{t('invoices.newInvoice')}</Button></Link>
      </div>

      <Card>
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className="input-field pl-9"
            placeholder={t('invoices.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={t('invoices.noInvoicesFound')}
            description={invoices.length === 0 ? t('invoices.createFirst') : t('invoices.tryAdjusting')}
            action={invoices.length === 0 && <Link to="/app/invoices/new"><Button icon={Plus}>{t('invoices.newInvoice')}</Button></Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                  <th className="py-3 font-medium">{t('invoices.table.invoice')}</th>
                  <th className="py-3 font-medium">{t('invoices.table.client')}</th>
                  <th className="py-3 font-medium">{t('invoices.table.issueDate')}</th>
                  <th className="py-3 font-medium">{t('invoices.table.dueDate')}</th>
                  <th className="py-3 font-medium text-right">{t('invoices.table.amount')}</th>
                  <th className="py-3 font-medium text-right">{t('invoices.table.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/app/invoices/${inv.id}`)}>
                    <td className="py-3 font-medium text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-3 text-slate-600">{inv.clientInfo?.name || '-'}</td>
                    <td className="py-3 text-slate-600">{formatDate(inv.issueDate, language)}</td>
                    <td className="py-3 text-slate-600">{formatDate(inv.dueDate, language)}</td>
                    <td className="py-3 text-right font-medium text-slate-900">{formatCurrency(inv.total, inv.currency)}</td>
                    <td className="py-3 text-right"><Badge status={effectiveStatus(inv)}>{t(`invoices.filters.${effectiveStatus(inv)}`)}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
