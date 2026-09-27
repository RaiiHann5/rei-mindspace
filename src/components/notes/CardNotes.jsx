import { useEffect, useRef, useState } from 'react'
import { Pin, MoreHorizontal, Star, Trash2, Copy, Archive, ArchiveRestore, Palette } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { htmlToPlainText, looksLikeHtml } from '@/lib/safeMarkdown'

// Note accent palette. Cards themselves are flat in Space+ — the chosen colour
// only shows up on the small chips, the icon buttons and the picker dot, so a
// grid of notes never turns into a patchwork of pastel slabs.
//
// The palette is deliberately narrower than the old six-pastel set, so the
// legacy keys (which are persisted in data) map onto the sanctioned low-chroma
// hues: `blue` takes the user-configurable accent slot, and because Space+
// ships no green, `green` and `teal` share the cool hue and are separated by
// lightness (teal-500 vs teal-300) so the two swatches stay tellable apart in
// the picker without inventing a hue that would break the status palette.
export const NOTE_COLORS = {
  pink: {
    bg: 'bg-surface-light dark:bg-surface-dark',
    tag: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
    title: 'text-ink-light dark:text-ink-dark',
    body: 'text-muted-light dark:text-muted-dark',
    icon: 'text-rose-500 hover:bg-rose-500/10',
    dot: 'bg-rose-500',
  },
  blue: {
    bg: 'bg-surface-light dark:bg-surface-dark',
    tag: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
    title: 'text-ink-light dark:text-ink-dark',
    body: 'text-muted-light dark:text-muted-dark',
    icon: 'text-primary-500 hover:bg-primary-500/10',
    dot: 'bg-primary-500',
  },
  green: {
    bg: 'bg-surface-light dark:bg-surface-dark',
    tag: 'bg-teal-500/10 text-teal-700 dark:text-teal-300',
    title: 'text-ink-light dark:text-ink-dark',
    body: 'text-muted-light dark:text-muted-dark',
    icon: 'text-teal-500 hover:bg-teal-500/10',
    dot: 'bg-teal-500',
  },
  amber: {
    bg: 'bg-surface-light dark:bg-surface-dark',
    tag: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    title: 'text-ink-light dark:text-ink-dark',
    body: 'text-muted-light dark:text-muted-dark',
    icon: 'text-amber-500 hover:bg-amber-500/10',
    dot: 'bg-amber-500',
  },
  gray: {
    bg: 'bg-surface-light dark:bg-surface-dark',
    tag: 'bg-black/[0.05] dark:bg-white/[0.08] text-muted-light dark:text-muted-dark',
    title: 'text-ink-light dark:text-ink-dark',
    body: 'text-muted-light dark:text-muted-dark',
    icon: 'text-dusk hover:bg-black/[0.05] dark:hover:bg-white/[0.08]',
    dot: 'bg-dusk',
  },
  teal: {
    bg: 'bg-surface-light dark:bg-surface-dark',
    tag: 'bg-teal-500/10 text-teal-700 dark:text-teal-300',
    title: 'text-ink-light dark:text-ink-dark',
    body: 'text-muted-light dark:text-muted-dark',
    icon: 'text-teal-300 hover:bg-teal-500/10',
    dot: 'bg-teal-300',
  },
}

const COLOR_KEYS = Object.keys(NOTE_COLORS)

export function colorForNote(note, index = 0) {
  if (note?.color && NOTE_COLORS[note.color]) return note.color
  const basis = note?.folder || note?.id || String(index)
  let hash = 0
  for (let i = 0; i < basis.length; i++) hash = (hash * 31 + basis.charCodeAt(i)) >>> 0
  return COLOR_KEYS[hash % COLOR_KEYS.length]
}

// Turns raw markdown-ish content into either a short list preview
// (for checklist/ingredient-style notes) or a heading + paragraph preview.
function parsePreview(content) {
  const plain = looksLikeHtml(content) ? htmlToPlainText(content) : (content || '')
  const lines = plain.split('\n').map((l) => l.trim()).filter(Boolean)
  if (!lines.length) return { type: 'empty' }

  const isListLine = (l) => /^[-*•]\s+/.test(l) || /^\d+[.)]\s+/.test(l)
  const listLines = lines.filter(isListLine)

  if (listLines.length >= Math.max(2, Math.ceil(lines.length * 0.5))) {
    const items = listLines.map((l) => l.replace(/^[-*•]\s+/, '').replace(/^\d+[.)]\s+/, ''))
    return { type: 'list', items: items.slice(0, 6), more: items.length > 6 }
  }

  const headingLine = lines.find((l) => /^#{1,3}\s+/.test(l))
  const heading = headingLine ? headingLine.replace(/^#{1,3}\s+/, '') : null
  const body = lines
    .filter((l) => l !== headingLine)
    .join(' ')
    .replace(/[#*_`>]/g, '')
    .trim()

  return { type: 'text', heading, body }
}

export default function CardNotes({
  note,
  colorKey,
  onOpen,
  onTogglePin,
  onToggleFavorite,
  onDelete,
  onDuplicate,
  onToggleArchive,
  onChangeColor,
  className,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const palette = NOTE_COLORS[colorKey] || NOTE_COLORS.gray
  const preview = parsePreview(note.content)

  useEffect(() => {
    if (!menuOpen) return
    const onDocClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [menuOpen])

  const stop = (fn) => (e) => { e.stopPropagation(); fn?.() }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen?.() }}
      className={cn(
        'group relative flex flex-col gap-3 rounded-2xl p-5 cursor-pointer card-hover',
        'border border-[color:var(--line)]',
        palette.bg,
        className
      )}
    >
      {/* header: tags + actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {note.folder && (
            <span className={cn('inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium truncate max-w-[9rem]', palette.tag)}>
              {note.folder}
            </span>
          )}
          {note.tags?.slice(0, 2).map((t) => (
            <span key={t} className={cn('inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium truncate max-w-[9rem]', palette.tag)}>
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={stop(onTogglePin)}
            aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
            className={cn('h-7 w-7 rounded-lg flex items-center justify-center transition-colors neo-press', palette.icon, note.pinned && 'bg-black/[0.06] dark:bg-white/[0.10]')}
          >
            <Pin size={13} className={note.pinned ? 'fill-current' : ''} />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={stop(() => setMenuOpen((v) => !v))}
              aria-label="More options"
              className={cn('h-7 w-7 rounded-lg flex items-center justify-center transition-colors neo-press', palette.icon)}
            >
              <MoreHorizontal size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-20 w-40 rounded-2xl glass-solid py-1 animate-pop" style={{ boxShadow: 'var(--shadow-pop)' }}>
                <button
                  onClick={stop(() => { onToggleFavorite?.(); setMenuOpen(false) })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-ink-light dark:text-ink-dark"
                >
                  <Star size={13} className={note.favorite ? 'fill-amber-500 text-amber-500' : ''} />
                  {note.favorite ? 'Unfavorite' : 'Favorite'}
                </button>
                {onDuplicate && (
                  <button
                    onClick={stop(() => { onDuplicate?.(); setMenuOpen(false) })}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-ink-light dark:text-ink-dark"
                  >
                    <Copy size={13} /> Duplicate
                  </button>
                )}
                {onToggleArchive && (
                  <button
                    onClick={stop(() => { onToggleArchive?.(); setMenuOpen(false) })}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-ink-light dark:text-ink-dark"
                  >
                    {note.archived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
                    {note.archived ? 'Unarchive' : 'Archive'}
                  </button>
                )}
                {onChangeColor && (
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-1 mb-1.5 text-[11px] text-dusk">
                      <Palette size={12} /> Color
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {COLOR_KEYS.map((key) => (
                        <button
                          key={key}
                          onClick={stop(() => { onChangeColor?.(key) })}
                          aria-label={`Color ${key}`}
                          className={cn(
                            'h-5 w-5 rounded-full transition-transform neo-press',
                            NOTE_COLORS[key].dot,
                            colorKey === key ? 'ring-2 ring-ember-500 scale-110' : 'opacity-70 hover:opacity-100 hover:scale-105'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={stop(() => { onDelete?.(); setMenuOpen(false) })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-rose-500/10 text-rose-500"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* title */}
      <h3 className={cn('font-display font-semibold tracking-tight text-[17px] leading-snug line-clamp-2', palette.title)}>
        {note.title || 'Untitled note'}
      </h3>

      {/* content preview */}
      <div className={cn('text-[13px] leading-relaxed flex-1', palette.body)}>
        {preview.type === 'empty' && <p className="italic text-dusk">No content yet</p>}

        {preview.type === 'text' && (
          <>
            {preview.heading && <p className={cn('font-semibold mb-1', palette.title)}>{preview.heading}</p>}
            <p className="line-clamp-4">{preview.body}</p>
          </>
        )}

        {preview.type === 'list' && (
          <ul className="space-y-1">
            {preview.items.map((item, i) => (
              <li
                key={i}
                className={cn(
                  'truncate',
                  i === preview.items.length - 1 && !preview.more && 'font-medium'
                )}
              >
                {item}
              </li>
            ))}
            {preview.more && <li className="text-dusk">…</li>}
          </ul>
        )}
      </div>

      {/* footer */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-dusk">
          {formatDate(note.updatedAt || note.createdAt)}
        </span>
        {note.favorite && <Star size={13} className="text-amber-500 fill-amber-500" />}
      </div>
    </div>
  )
}
