import Button from './Button'
import { cn } from '@/lib/utils'

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction, actionVariant = 'primary', className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl',
        'border border-dashed border-[color:var(--line-strong)]',
        className
      )}
    >
      {Icon && (
        <div
          className="h-14 w-14 rounded-2xl mb-4 flex items-center justify-center text-ember-500"
          style={{ background: 'var(--accent-gradient-soft)' }}
        >
          <Icon size={26} strokeWidth={1.8} />
        </div>
      )}
      <h3 className="font-display font-semibold text-lg mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-light dark:text-muted-dark max-w-sm mb-5">{description}</p>
      )}
      {actionLabel && (
        <Button onClick={onAction} size="sm" variant={actionVariant}>{actionLabel}</Button>
      )}
    </div>
  )
}
