import clsx from 'clsx'

const STYLES = {
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  unpaid: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  overdue: 'bg-red-50 text-red-700 ring-red-600/20',
  draft: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  verified: 'bg-brand-50 text-brand-700 ring-brand-600/20',
}

export default function Badge({ status = 'draft', children }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset capitalize',
      STYLES[status] || STYLES.draft,
    )}>
      {children || status}
    </span>
  )
}
