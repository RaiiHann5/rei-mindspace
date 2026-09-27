import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Modal({ open, onClose, title, children, size = 'md', footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])

  if (!open) return null

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Warm-tinted scrim — a flat black overlay would fight the ember glow. */}
      <div
        className="absolute inset-0 bg-ink-light/55 dark:bg-ink-dark/72 backdrop-blur-[3px] animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full rounded-3xl glass-solid animate-pop max-h-[85vh] flex flex-col overflow-hidden',
          sizes[size]
        )}
        style={{ boxShadow: 'var(--shadow-pop)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--line)] shrink-0">
          <h2 className="font-display font-semibold text-lg tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.05] dark:hover:bg-white/[0.07] transition-colors neo-press"
          >
            <X size={17} strokeWidth={2.2} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-[color:var(--line)] flex justify-end gap-2 shrink-0 bg-canvas-light dark:bg-canvas-dark">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
