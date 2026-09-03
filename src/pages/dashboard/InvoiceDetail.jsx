import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Download, FileText, Printer, Trash2, Pencil, ArrowLeft, Check } from 'lucide-react'
import { getInvoice, deleteInvoice, updateInvoiceStatus, updateInvoice } from '../../services/invoiceService'
import { listClients } from '../../services/clientService'
import { getUserData } from '../../services/businessService'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import InvoicePreview from '../../components/invoices/InvoicePreview'
import InvoiceForm from '../../components/invoices/InvoiceForm'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Loader from '../../components/ui/Loader'
import ErrorState from '../../components/ui/ErrorState'
import Select from '../../components/ui/Select'
import LanguageToggle from '../../components/ui/LanguageToggle'
import { generateInvoicePdf } from '../../utils/invoicePdfGenerator'
import { generateInvoiceWord } from '../../utils/invoiceWordGenerator'

export default function InvoiceDetail() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState(null)
  const [clients, setClients] = useState([])
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadingWord, setDownloadingWord] = useState(false)
  const [statusSaving, setStatusSaving] = useState(false)
  const [languageSaving, setLanguageSaving] = useState(false)

  const STATUS_OPTIONS = [
    { value: 'draft', label: t('invoiceForm.status_draft') },
    { value: 'unpaid', label: t('invoiceForm.status_unpaid') },
    { value: 'paid', label: t('invoiceForm.status_paid') },
  ]

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [inv, cli, userData] = await Promise.all([
        getInvoice(id),
        listClients(currentUser.uid),
        getUserData(currentUser.uid),
      ])
      if (!inv || inv.userId !== currentUser.uid) {
        setError('Invoice not found.')
      } else {
        setInvoice(inv)
      }
      setClients(cli)
      setBusiness(userData?.business || null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function handleDownload() {
    setDownloading(true)
    try {
      await generateInvoicePdf(invoice)
    } catch (e) {
      alert('Could not generate PDF: ' + e.message)
    } finally {
      setDownloading(false)
    }
  }

  async function handleDownloadWord() {
    setDownloadingWord(true)
    try {
      await generateInvoiceWord(invoice)
    } catch (e) {
      alert('Could not generate Word document: ' + e.message)
    } finally {
      setDownloadingWord(false)
    }
  }

  async function handleLanguageChange(language) {
    setLanguageSaving(true)
    try {
      await updateInvoice(id, { language })
      setInvoice((prev) => ({ ...prev, language }))
    } catch (e) {
      alert(e.message)
    } finally {
      setLanguageSaving(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  async function handleDeleteConfirm() {
    try {
      await deleteInvoice(id)
      navigate('/app/invoices')
    } catch (e) {
      alert(e.message)
    }
  }

  async function handleStatusChange(status) {
    setStatusSaving(true)
    try {
      await updateInvoiceStatus(id, status)
      setInvoice((prev) => ({ ...prev, status }))
    } catch (e) {
      alert(e.message)
    } finally {
      setStatusSaving(false)
    }
  }

  async function handleEditSubmit(data) {
    try {
      await updateInvoice(id, data)
      setEditing(false)
      await load()
    } catch (e) {
      alert(e.message)
    }
  }

  if (loading) return <Loader full />
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!invoice) return null

  if (editing) {
    return (
      <div className="space-y-4">
        <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4" /> {t('invoiceDetail.backToInvoices')}
        </button>
        <InvoiceForm initial={invoice} clients={clients} business={business} onSubmit={handleEditSubmit} submitLabel={t('invoiceForm.saveChanges')} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/app/invoices" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4" /> {t('invoiceDetail.backToInvoices')}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <LanguageToggle value={invoice.language || 'en'} onChange={handleLanguageChange} disabled={languageSaving} />
          <Select
            value={invoice.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            options={STATUS_OPTIONS}
            className="!py-2 text-xs"
            disabled={statusSaving}
          />
          <Button variant="secondary" icon={Pencil} onClick={() => setEditing(true)}>{t('invoiceDetail.edit')}</Button>
          <Button variant="secondary" icon={Printer} onClick={handlePrint}>{t('invoiceDetail.print')}</Button>
          <Button variant="secondary" icon={FileText} onClick={handleDownloadWord} loading={downloadingWord}>{t('invoiceDetail.word')}</Button>
          <Button icon={Download} onClick={handleDownload} loading={downloading}>{t('invoiceDetail.pdf')}</Button>
          <Button variant="danger" icon={Trash2} onClick={() => setDeleting(true)}>{t('invoiceDetail.delete')}</Button>
        </div>
      </div>

      <InvoicePreview invoice={invoice} />

      <Modal
        open={deleting}
        onClose={() => setDeleting(false)}
        title={t('invoiceDetail.deleteTitle')}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setDeleting(false)}>{t('invoiceDetail.cancel')}</Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>{t('invoiceDetail.delete')}</Button>
          </>
        )}
      >
        <p className="text-sm text-slate-600">
          {t('invoiceDetail.deleteBody', { number: invoice.invoiceNumber })}
        </p>
      </Modal>
    </div>
  )
}
