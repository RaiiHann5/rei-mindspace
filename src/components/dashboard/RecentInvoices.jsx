import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import EmptyState from '../ui/EmptyState'
import { FileText } from 'lucide-react'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/dateUtils'
import { effectiveStatus } from '../../utils/invoiceCalculations'
import { useLanguage } from '../../contexts/LanguageContext'

export default function RecentInvoices({ invoices = [] }) {
  const { t } = useLanguage()
  if (invoices.length === 0) {
    return <EmptyState icon={FileText} title={t('dashboard.noInvoicesYet')} description={t('dashboard.noInvoicesYetDesc')} />
  }
  return (
    <div className="divide-y divide-slate-100">
      {invoices.slice(0, 6).map((inv) => (
        <Link
          key={inv.id}
          to={`/app/invoices/${inv.id}`}
          className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{inv.clientInfo?.name || 'Unnamed Client'}</p>
            <p className="text-xs text-slate-500">{inv.invoiceNumber} &middot; {formatDate(inv.issueDate)}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-3">
            <span className="text-sm font-semibold text-slate-900">{formatCurrency(inv.total, inv.currency)}</span>
            <Badge status={effectiveStatus(inv)}>{t(`invoices.filters.${effectiveStatus(inv)}`)}</Badge>
          </div>
        </Link>
      ))}
    </div>
  )
}
