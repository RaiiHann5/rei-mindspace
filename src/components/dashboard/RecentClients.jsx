import EmptyState from '../ui/EmptyState'
import { Users } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'

export default function RecentClients({ clients = [] }) {
  const { t } = useLanguage()
  if (clients.length === 0) {
    return <EmptyState icon={Users} title={t('dashboard.noClientsYet')} description={t('dashboard.noClientsYetDesc')} />
  }
  return (
    <div className="divide-y divide-slate-100">
      {clients.slice(0, 6).map((c) => (
        <div key={c.id} className="flex items-center gap-3 py-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-semibold shrink-0">
            {(c.name || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{c.name}</p>
            <p className="text-xs text-slate-500 truncate">{c.company || c.email}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
