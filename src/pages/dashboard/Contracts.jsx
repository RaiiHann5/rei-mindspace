import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileSignature } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { listContracts } from '../../services/contractService'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Loader from '../../components/ui/Loader'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import { formatDate } from '../../utils/dateUtils'

export default function Contracts() {
  const { currentUser } = useAuth()
  const { t, language } = useLanguage()
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setContracts(await listContracts(currentUser.uid))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [currentUser.uid])

  if (loading) return <Loader full />
  if (error) return <ErrorState message={error} onRetry={load} />

  const countLabel = t(contracts.length === 1 ? 'contracts.countOne' : 'contracts.countOther', { count: contracts.length })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{countLabel}</p>
        <Link to="/app/contracts/new"><Button icon={Plus}>{t('contracts.newContract')}</Button></Link>
      </div>

      <Card>
        {contracts.length === 0 ? (
          <EmptyState
            icon={FileSignature}
            title={t('contracts.noContractsYet')}
            description={t('contracts.noContractsDesc')}
            action={<Link to="/app/contracts/new"><Button icon={Plus}>{t('contracts.newContract')}</Button></Link>}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {contracts.map((c) => (
              <Link key={c.id} to={`/app/contracts/${c.id}`} className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center">
                    <FileSignature className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{c.title}</p>
                    <p className="text-xs text-slate-500">{c.clientName || t('contracts.noClient')} &middot; {formatDate(c.createdAt, language)}</p>
                  </div>
                </div>
                <Badge status={c.status === 'signed' ? 'paid' : 'draft'}>{t(`contracts.statusOptions.${c.status || 'draft'}`)}</Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
