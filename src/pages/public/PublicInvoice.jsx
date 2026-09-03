import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShieldCheck, FileX } from 'lucide-react'
import { getInvoiceByPublicId } from '../../services/invoiceService'
import Loader from '../../components/ui/Loader'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import Logo from '../../components/ui/Logo'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/dateUtils'
import { calcTotals, effectiveStatus } from '../../utils/invoiceCalculations'
import { getInvoiceLabels } from '../../utils/i18n'
import { useLanguage } from '../../contexts/LanguageContext'

// Public page: no auth required. Only renders fields that are safe to
// expose publicly - it deliberately never shows the owner's userId,
// internal notes are shown only because they're invoice-facing content
// the client is meant to see (same as a paper invoice would).
export default function PublicInvoice() {
  const { publicId } = useParams()
  const { t: ut } = useLanguage()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    getInvoiceByPublicId(publicId)
      .then((data) => {
        if (!active) return
        if (!data) setNotFound(true)
        else setInvoice(data)
      })
      .catch(() => active && setNotFound(true))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [publicId])

  if (loading) return <Loader full label={ut('publicInvoice.verifying')} />

  if (notFound || !invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <EmptyState
          icon={FileX}
          title={ut('publicInvoice.notFoundTitle')}
          description={ut('publicInvoice.notFoundDesc')}
        />
      </div>
    )
  }

  const status = effectiveStatus(invoice)
  const totals = calcTotals(invoice)
  const language = invoice.language || 'en'
  const t = getInvoiceLabels(language)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-2">
          <Link to="/"><Logo className="h-6 w-auto" /></Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full ring-1 ring-emerald-600/20">
            <ShieldCheck className="w-3.5 h-3.5" /> {t.verifiedInvoice}
          </div>
        </div>

        <div className="card p-6 sm:p-8">
          <div className="flex items-start justify-between mb-6 pb-6 border-b border-slate-100">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">{t.business}</p>
              <h2 className="text-lg font-bold text-slate-900">{invoice.businessInfo?.businessName || '-'}</h2>
            </div>
            <Badge status={status}>{t.status[status] || status}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-slate-100">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">{t.invoiceNumber}</p>
              <p className="text-sm font-medium text-slate-900">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">{t.client}</p>
              <p className="text-sm font-medium text-slate-900">{invoice.clientInfo?.name || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">{t.issueDate}</p>
              <p className="text-sm text-slate-700">{formatDate(invoice.issueDate, language)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">{t.dueDate}</p>
              <p className="text-sm text-slate-700">{formatDate(invoice.dueDate, language)}</p>
            </div>
          </div>

          <div className="mb-6 pb-6 border-b border-slate-100">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-3">{t.items}</p>
            <div className="space-y-2">
              {(invoice.items || []).map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-slate-700">{item.name} <span className="text-slate-400">\u00d7 {item.quantity}</span></span>
                  <span className="font-medium text-slate-900">{formatCurrency(item.quantity * item.price, invoice.currency)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-500">{t.totalAmount}</span>
            <span className="text-2xl font-extrabold text-slate-900">{formatCurrency(totals.grandTotal, invoice.currency)}</span>
          </div>

          {invoice.qrisUrl && (
            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col items-center">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-2">{t.qrisPayment}</p>
              <img src={invoice.qrisUrl} alt="QRIS" className="w-40 h-40 object-contain border border-slate-100 rounded-lg" />
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          {t.verifiesText(invoice.businessInfo?.businessName || 'the business')}
        </p>
      </main>
    </div>
  )
}
