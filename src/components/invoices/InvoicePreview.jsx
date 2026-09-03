import Badge from '../ui/Badge'
import QRCodeBlock from './QRCodeBlock'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/dateUtils'
import { calcTotals, effectiveStatus } from '../../utils/invoiceCalculations'
import { getInvoiceLabels } from '../../utils/i18n'

export default function InvoicePreview({ invoice }) {
  const { businessInfo = {}, clientInfo = {}, items = [], currency = 'USD' } = invoice
  const language = invoice.language || 'en'
  const t = getInvoiceLabels(language)
  const totals = calcTotals(invoice)
  const status = effectiveStatus(invoice)

  return (
    <div id="printable-area" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
        <div className="flex items-start gap-4">
          {businessInfo.logoUrl && (
            <img src={businessInfo.logoUrl} alt="Logo" className="w-14 h-14 rounded-lg object-cover border border-slate-100" />
          )}
          <div>
            <h2 className="text-lg font-bold text-slate-900">{businessInfo.businessName || t.yourBusiness}</h2>
            <p className="text-xs text-slate-500 mt-1">{businessInfo.email}</p>
            <p className="text-xs text-slate-500">{businessInfo.phone}</p>
            <p className="text-xs text-slate-500 max-w-xs">{businessInfo.address}</p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t.documentTitle}</h1>
          <p className="text-sm text-slate-500 mt-1">#{invoice.invoiceNumber}</p>
          <div className="mt-2"><Badge status={status}>{t.status[status] || status}</Badge></div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8 pb-8 border-b border-slate-100">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase mb-1.5">{t.billTo}</p>
          <p className="text-sm font-medium text-slate-900">{clientInfo.name || '-'}</p>
          {clientInfo.company && <p className="text-xs text-slate-500">{clientInfo.company}</p>}
          {clientInfo.email && <p className="text-xs text-slate-500">{clientInfo.email}</p>}
          {clientInfo.address && <p className="text-xs text-slate-500 max-w-[180px]">{clientInfo.address}</p>}
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase mb-1.5">{t.issueDate}</p>
          <p className="text-sm text-slate-700">{formatDate(invoice.issueDate, language)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase mb-1.5">{t.dueDate}</p>
          <p className="text-sm text-slate-700">{formatDate(invoice.dueDate, language)}</p>
        </div>
      </div>

      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="text-left text-xs text-slate-400 uppercase border-b border-slate-100">
            <th className="py-2 font-medium">{t.item}</th>
            <th className="py-2 font-medium hidden sm:table-cell">{t.description}</th>
            <th className="py-2 font-medium text-right">{t.qty}</th>
            <th className="py-2 font-medium text-right">{t.price}</th>
            <th className="py-2 font-medium text-right">{t.total}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="py-2.5 text-slate-900">{item.name}</td>
              <td className="py-2.5 text-slate-500 hidden sm:table-cell">{item.description}</td>
              <td className="py-2.5 text-right text-slate-600">{item.quantity}</td>
              <td className="py-2.5 text-right text-slate-600">{formatCurrency(item.price, currency)}</td>
              <td className="py-2.5 text-right font-medium text-slate-900">{formatCurrency(item.quantity * item.price, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-8">
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between text-sm text-slate-600">
            <span>{t.subtotal}</span><span>{formatCurrency(totals.subtotal, currency)}</span>
          </div>
          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-sm text-slate-600">
              <span>{t.discount}</span><span>-{formatCurrency(totals.discountAmount, currency)}</span>
            </div>
          )}
          {totals.taxAmount > 0 && (
            <div className="flex justify-between text-sm text-slate-600">
              <span>{t.tax}</span><span>{formatCurrency(totals.taxAmount, currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
            <span>{t.grandTotal}</span><span>{formatCurrency(totals.grandTotal, currency)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-8 items-start justify-between pt-6 border-t border-slate-100">
        <div className="space-y-4 flex-1">
          {invoice.paymentInfo && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase mb-1">{t.paymentInformation}</p>
              <p className="text-sm text-slate-600 whitespace-pre-line">{invoice.paymentInfo}</p>
            </div>
          )}
          {invoice.qrisUrl && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase mb-1">{t.qrisPayment}</p>
              <img src={invoice.qrisUrl} alt="QRIS" className="w-32 h-32 object-contain border border-slate-100 rounded-lg mt-1" />
            </div>
          )}
          {invoice.notes && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase mb-1">{t.notes}</p>
              <p className="text-sm text-slate-600 whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase mb-1">{t.terms}</p>
              <p className="text-sm text-slate-600 whitespace-pre-line">{invoice.terms}</p>
            </div>
          )}
        </div>
        {invoice.publicId && <QRCodeBlock publicId={invoice.publicId} label={t.scanToVerify} />}
      </div>
    </div>
  )
}
