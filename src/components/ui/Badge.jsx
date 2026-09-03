<<<<<<< HEAD
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
=======
import { cn } from '@/lib/utils'

const tones = {
  default: 'bg-black/[0.05] dark:bg-white/[0.08] text-inherit',
  primary: 'bg-primary-500/15 text-primary-600 dark:text-primary-300',
  amber: 'bg-amber-400/15 text-amber-500',
  teal: 'bg-teal-400/15 text-teal-500',
  rose: 'bg-rose-400/15 text-rose-500',
}

export default function Badge({ tone = 'default', className, children }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', tones[tone], className)}>
      {children}
>>>>>>> b4b2ee123dad43c2655a52eab73876263db4f19f
    </span>
  )
}
