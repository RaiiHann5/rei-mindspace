import { useState, useEffect } from 'react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'
import InvoiceItemsTable from './InvoiceItemsTable'
import { CURRENCIES, formatCurrency } from '../../utils/formatCurrency'
import { calcTotals } from '../../utils/invoiceCalculations'
import { todayISO, addDaysISO } from '../../utils/dateUtils'
import { LANGUAGES } from '../../utils/i18n'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { uploadQrisImage } from '../../services/storageService'
import { QrCode, X } from 'lucide-react'

export default function InvoiceForm({ initial, clients = [], business, onSubmit, submitting, submitLabel }) {
  const { t } = useLanguage()
  const { currentUser } = useAuth()
  const [uploadingQris, setUploadingQris] = useState(false)

  const STATUS_OPTIONS = [
    { value: 'draft', label: t('invoiceForm.status_draft') },
    { value: 'unpaid', label: t('invoiceForm.status_unpaid') },
    { value: 'paid', label: t('invoiceForm.status_paid') },
  ]

  const [form, setForm] = useState(() => ({
    invoiceNumber: initial?.invoiceNumber || '',
    issueDate: initial?.issueDate || todayISO(),
    dueDate: initial?.dueDate || addDaysISO(14),
    currency: initial?.currency || business?.defaultCurrency || 'USD',
    language: initial?.language || 'en',
    status: initial?.status || 'draft',
    clientId: initial?.clientId || '',
    clientInfo: initial?.clientInfo || { name: '', company: '', email: '', address: '' },
    businessInfo: initial?.businessInfo || {
      businessName: business?.businessName || '',
      logoUrl: business?.logoUrl || '',
      email: business?.email || '',
      phone: business?.phone || '',
      address: business?.address || '',
    },
    items: initial?.items?.length ? initial.items : [
      { id: crypto.randomUUID(), name: '', description: '', quantity: 1, price: 0 },
    ],
    discount: initial?.discount || 0,
    discountType: initial?.discountType || 'fixed',
    tax: initial?.tax || 0,
    taxType: initial?.taxType || 'percent',
    notes: initial?.notes || '',
    terms: initial?.terms || 'Payment due within 14 days of invoice date.',
    paymentInfo: initial?.paymentInfo || business?.paymentInfo || '',
    qrisUrl: initial?.qrisUrl || business?.qrisUrl || '',
  }))

  useEffect(() => {
    if (!initial && business) {
      setForm((f) => ({
        ...f,
        businessInfo: {
          businessName: business.businessName || '',
          logoUrl: business.logoUrl || '',
          email: business.email || '',
          phone: business.phone || '',
          address: business.address || '',
        },
        paymentInfo: f.paymentInfo || business.paymentInfo || '',
        qrisUrl: f.qrisUrl || business.qrisUrl || '',
        currency: business.defaultCurrency || f.currency,
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }
  function updateNested(group, field, value) {
    setForm((f) => ({ ...f, [group]: { ...f[group], [field]: value } }))
  }

  function handleClientSelect(clientId) {
    const client = clients.find((c) => c.id === clientId)
    setForm((f) => ({
      ...f,
      clientId,
      clientInfo: client
        ? { name: client.name, company: client.company, email: client.email, address: client.address }
        : f.clientInfo,
    }))
  }

  async function handleQrisUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingQris(true)
    try {
      const url = await uploadQrisImage(currentUser.uid, file)
      update('qrisUrl', url)
    } catch (err) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploadingQris(false)
    }
  }

  const totals = calcTotals(form)

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ ...form, subtotal: totals.subtotal, total: totals.grandTotal })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">{t('invoiceForm.businessInformation')}</h3>
          <div className="space-y-3">
            <Input label={t('invoiceForm.businessName')} value={form.businessInfo.businessName} onChange={(e) => updateNested('businessInfo', 'businessName', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label={t('invoiceForm.email')} value={form.businessInfo.email} onChange={(e) => updateNested('businessInfo', 'email', e.target.value)} />
              <Input label={t('invoiceForm.phone')} value={form.businessInfo.phone} onChange={(e) => updateNested('businessInfo', 'phone', e.target.value)} />
            </div>
            <Textarea label={t('invoiceForm.address')} rows={2} value={form.businessInfo.address} onChange={(e) => updateNested('businessInfo', 'address', e.target.value)} />
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">{t('invoiceForm.clientInformation')}</h3>
          <div className="space-y-3">
            {clients.length > 0 && (
              <Select
                label={t('invoiceForm.selectExistingClient')}
                value={form.clientId}
                onChange={(e) => handleClientSelect(e.target.value)}
                options={[{ value: '', label: t('invoiceForm.enterManually') }, ...clients.map((c) => ({ value: c.id, label: c.name }))]}
              />
            )}
            <Input label={t('invoiceForm.clientName')} required value={form.clientInfo.name} onChange={(e) => updateNested('clientInfo', 'name', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label={t('invoiceForm.company')} value={form.clientInfo.company} onChange={(e) => updateNested('clientInfo', 'company', e.target.value)} />
              <Input label={t('invoiceForm.email')} value={form.clientInfo.email} onChange={(e) => updateNested('clientInfo', 'email', e.target.value)} />
            </div>
            <Textarea label={t('invoiceForm.address')} rows={2} value={form.clientInfo.address} onChange={(e) => updateNested('clientInfo', 'address', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">{t('invoiceForm.invoiceInformation')}</h3>
        <div className="grid sm:grid-cols-4 gap-3">
          <Input label={t('invoiceForm.invoiceNumber')} value={form.invoiceNumber} onChange={(e) => update('invoiceNumber', e.target.value)} />
          <Input label={t('invoiceForm.issueDate')} type="date" value={form.issueDate} onChange={(e) => update('issueDate', e.target.value)} />
          <Input label={t('invoiceForm.dueDate')} type="date" value={form.dueDate} onChange={(e) => update('dueDate', e.target.value)} />
          <Select label={t('invoiceForm.currency')} value={form.currency} onChange={(e) => update('currency', e.target.value)} options={CURRENCIES} />
        </div>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          <Select label={t('invoiceForm.status')} value={form.status} onChange={(e) => update('status', e.target.value)} options={STATUS_OPTIONS} />
          <Select label={t('invoiceForm.invoiceLanguage')} value={form.language} onChange={(e) => update('language', e.target.value)} options={LANGUAGES} />
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">{t('invoiceForm.invoiceItems')}</h3>
        <InvoiceItemsTable items={form.items} onChange={(items) => update('items', items)} currency={form.currency} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">{t('invoiceForm.additional')}</h3>
          <Textarea label={t('invoiceForm.notes')} rows={3} value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder={t('invoiceForm.notesPlaceholder')} />
          <Textarea label={t('invoiceForm.termsConditions')} rows={3} value={form.terms} onChange={(e) => update('terms', e.target.value)} />
          <Textarea label={t('invoiceForm.paymentInformation')} rows={3} value={form.paymentInfo} onChange={(e) => update('paymentInfo', e.target.value)} placeholder={t('invoiceForm.paymentInfoPlaceholder')} />

          <div className="pt-2">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">{t('invoiceForm.qrisCode')}</label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                {form.qrisUrl ? <img src={form.qrisUrl} alt="QRIS" className="w-full h-full object-contain" /> : <QrCode className="w-5 h-5 text-slate-400" />}
              </div>
              <div className="flex items-center gap-2">
                <label className="btn-secondary cursor-pointer text-xs">
                  {uploadingQris ? t('invoiceForm.qrisUploading') : t('invoiceForm.qrisUpload')}
                  <input type="file" accept="image/*" className="hidden" onChange={handleQrisUpload} disabled={uploadingQris} />
                </label>
                {form.qrisUrl && (
                  <button type="button" onClick={() => update('qrisUrl', '')} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> {t('invoiceForm.qrisRemove')}
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">{t('invoiceForm.qrisHelp')}</p>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">{t('invoiceForm.calculation')}</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex gap-2">
              <Input label={t('invoiceForm.discount')} type="number" min="0" value={form.discount} onChange={(e) => update('discount', Number(e.target.value))} containerClassName="flex-1" />
              <Select label={t('invoiceForm.type')} value={form.discountType} onChange={(e) => update('discountType', e.target.value)} options={[{ value: 'fixed', label: t('invoiceForm.fixed') }, { value: 'percent', label: '%' }]} containerClassName="w-24" />
            </div>
            <div className="flex gap-2">
              <Input label={t('invoiceForm.tax')} type="number" min="0" value={form.tax} onChange={(e) => update('tax', Number(e.target.value))} containerClassName="flex-1" />
              <Select label={t('invoiceForm.type')} value={form.taxType} onChange={(e) => update('taxType', e.target.value)} options={[{ value: 'percent', label: '%' }, { value: 'fixed', label: t('invoiceForm.fixed') }]} containerClassName="w-24" />
            </div>
          </div>
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex justify-between text-sm text-slate-600">
              <span>{t('invoiceForm.subtotal')}</span><span>{formatCurrency(totals.subtotal, form.currency)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>{t('invoiceForm.discount')}</span><span>-{formatCurrency(totals.discountAmount, form.currency)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>{t('invoiceForm.tax')}</span><span>{formatCurrency(totals.taxAmount, form.currency)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
              <span>{t('invoiceForm.grandTotal')}</span><span>{formatCurrency(totals.grandTotal, form.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" loading={submitting}>{submitLabel || t('invoiceForm.saveInvoice')}</Button>
      </div>
    </form>
  )
}
