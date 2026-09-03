import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, FileText, CheckCircle2, Clock, AlertCircle, Plus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { listInvoices } from '../../services/invoiceService'
import { listClients } from '../../services/clientService'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import ErrorState from '../../components/ui/ErrorState'
import StatCard from '../../components/dashboard/StatCard'
import RevenueChart from '../../components/dashboard/RevenueChart'
import RecentInvoices from '../../components/dashboard/RecentInvoices'
import RecentClients from '../../components/dashboard/RecentClients'
import { formatCurrency } from '../../utils/formatCurrency'
import { effectiveStatus } from '../../utils/invoiceCalculations'

export default function DashboardOverview() {
  const { currentUser } = useAuth()
  const { t } = useLanguage()
  const [invoices, setInvoices] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [inv, cli] = await Promise.all([
        listInvoices(currentUser.uid),
        listClients(currentUser.uid),
      ])
      setInvoices(inv)
      setClients(cli)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [currentUser.uid])

  const stats = useMemo(() => {
    const withStatus = invoices.map((inv) => ({ ...inv, _status: effectiveStatus(inv) }))
    const paid = withStatus.filter((i) => i._status === 'paid')
    const unpaid = withStatus.filter((i) => i._status === 'unpaid')
    const overdue = withStatus.filter((i) => i._status === 'overdue')
    const totalRevenue = paid.reduce((sum, i) => sum + Number(i.total || 0), 0)
    return {
      totalRevenue,
      totalInvoices: invoices.length,
      paid: paid.length,
      unpaid: unpaid.length,
      overdue: overdue.length,
    }
  }, [invoices])

  const chartData = useMemo(() => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-US', { month: 'short' }), revenue: 0 })
    }
    invoices.forEach((inv) => {
      if (effectiveStatus(inv) !== 'paid' || !inv.issueDate) return
      const d = new Date(inv.issueDate)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      const bucket = months.find((m) => m.key === key)
      if (bucket) bucket.revenue += Number(inv.total || 0)
    })
    return months
  }, [invoices])

  const currency = invoices[0]?.currency || 'USD'

  if (loading) return <Loader full />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{t('dashboard.welcomeBack', { name: currentUser.displayName || t('dashboard.there') })}</p>
        <Link to="/app/invoices/new"><Button icon={Plus}>{t('dashboard.newInvoice')}</Button></Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label={t('dashboard.totalRevenue')} value={formatCurrency(stats.totalRevenue, currency)} icon={DollarSign} tint="brand" />
        <StatCard label={t('dashboard.totalInvoices')} value={stats.totalInvoices} icon={FileText} tint="slate" />
        <StatCard label={t('dashboard.paid')} value={stats.paid} icon={CheckCircle2} tint="emerald" />
        <StatCard label={t('dashboard.unpaid')} value={stats.unpaid} icon={Clock} tint="amber" />
        <StatCard label={t('dashboard.overdue')} value={stats.overdue} icon={AlertCircle} tint="red" />
      </div>

      <Card title={t('dashboard.revenueOverview')} subtitle={t('dashboard.revenueSubtitle')}>
        <RevenueChart data={chartData} currency={currency} />
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title={t('dashboard.recentInvoices')} action={<Link to="/app/invoices" className="text-xs font-medium text-brand-600 hover:underline">{t('dashboard.viewAll')}</Link>}>
          <RecentInvoices invoices={invoices} />
        </Card>
        <Card title={t('dashboard.recentClients')} action={<Link to="/app/clients" className="text-xs font-medium text-brand-600 hover:underline">{t('dashboard.viewAll')}</Link>}>
          <RecentClients clients={clients} />
        </Card>
      </div>
    </div>
  )
}
