import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { listClients } from '../../services/clientService'
import { listInvoices, createInvoice, nextInvoiceNumber } from '../../services/invoiceService'
import { getUserData } from '../../services/businessService'
import InvoiceForm from '../../components/invoices/InvoiceForm'
import Loader from '../../components/ui/Loader'

export default function CreateInvoice() {
  const { currentUser } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [business, setBusiness] = useState(null)
  const [suggestedNumber, setSuggestedNumber] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      const [cli, userData, invoices] = await Promise.all([
        listClients(currentUser.uid),
        getUserData(currentUser.uid),
        listInvoices(currentUser.uid),
      ])
      setClients(cli)
      setBusiness(userData?.business || null)
      setSuggestedNumber(nextInvoiceNumber(invoices))
      setLoading(false)
    }
    load()
  }, [currentUser.uid])

  async function handleSubmit(data) {
    setSubmitting(true)
    try {
      const payload = { ...data, invoiceNumber: data.invoiceNumber || suggestedNumber }
      const { id } = await createInvoice(currentUser.uid, payload)
      navigate(`/app/invoices/${id}`)
    } catch (e) {
      alert(e.message)
      setSubmitting(false)
    }
  }

  if (loading) return <Loader full label={t('common.loading')} />

  return (
    <InvoiceForm
      initial={{ invoiceNumber: suggestedNumber }}
      clients={clients}
      business={business}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel={t('invoiceForm.createInvoice')}
    />
  )
}
