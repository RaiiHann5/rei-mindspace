import { Search, Pin, Tag as TagIcon, X } from 'lucide-react'
import { id as idLocale } from 'date-fns/locale'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { MOODS, moodInfo, entryCompletion } from '@/lib/journalPrompts'
import Select from '@/components/ui/Select'
import Skeleton from '@/components/ui/Skeleton'

export default function JournalHistoryList({
  isLoading, entries, allTags, selectedKey, onSelect,
  search, onSearch, moodFilter, onMoodFilter, tagFilter, onTagFilter,
}) {
  const hasFilters = search || moodFilter || tagFilter

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="relative mb-2">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dusk" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Cari entri jurnal..."
          className="w-full h-9 rounded-xl pl-8 pr-7 text-sm bg-surface-light dark:bg-surface-dark border border-[color:var(--line)] outline-none placeholder:text-dusk focus:border-[color:var(--line-strong)] transition-colors"
        />
        {search && (
          <button onClick={() => onSearch('')} aria-label="Bersihkan pencarian" className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center text-muted-light dark:text-muted-dark hover:bg-black/[0.06] dark:hover:bg-white/[0.08] neo-press">
            <X size={11} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-0.5">
        <button
          onClick={() => onMoodFilter(null)}
          className={cn('h-7 px-2.5 rounded-md text-xs font-semibold border shrink-0 transition-colors neo-press',
            !moodFilter
              ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500/30'
              : 'border-[color:var(--line)] text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark')}
        >
          Semua
        </button>
        {MOODS.map((m) => (
          <button
            key={m.value}
            title={m.label}
            onClick={() => onMoodFilter(moodFilter === m.value ? null : m.value)}
            className={cn('h-7 w-7 shrink-0 rounded-full text-sm flex items-center justify-center transition-colors neo-press',
              moodFilter === m.value
                ? 'bg-primary-500/15 ring-1 ring-inset ring-primary-500/30'
                : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]')}
          >
            {m.emoji}
          </button>
        ))}
      </div>

      {allTags.length > 0 && (
        <div className="mb-2.5">
          <Select value={tagFilter || ''} onChange={(e) => onTagFilter(e.target.value || null)} className="h-8 text-xs">
            <option value="">Semua tag</option>
            {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </div>
      )}

      <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 min-h-[180px]">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)
        ) : entries.length === 0 ? (
          <p className="text-xs text-center text-muted-light dark:text-muted-dark py-8 px-2">
            {hasFilters ? 'Tidak ada entri yang cocok dengan filter.' : 'Belum ada entri jurnal.'}
          </p>
        ) : (
          entries.map((j) => {
            const mood = moodInfo(j.mood)
            const { done, total } = entryCompletion(j)
            const preview = j.highlights || j.learning || (j.gratitude || [])[0] || 'Belum ada catatan'
            const isActive = j.__key === selectedKey
            return (
              <button
                key={j.id}
                onClick={() => onSelect(j)}
                className={cn(
                  'w-full text-left p-2.5 rounded-xl border transition-colors neo-press',
                  isActive
                    ? 'bg-primary-500/[0.08] border-primary-500/30'
                    : 'border-transparent hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                )}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-base leading-none">{mood ? mood.emoji : '❔'}</span>
                  <span className="text-xs font-semibold capitalize">{format(new Date(j.date), 'EEE, d MMM', { locale: idLocale })}</span>
                  {j.pinned && <Pin size={10} className="fill-current text-amber-500 shrink-0" />}
                  <span className={cn('ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded-[7px] shrink-0 font-mono tabular-nums', done === total ? 'bg-teal-500/12 text-teal-700 dark:text-teal-300' : 'bg-black/[0.05] dark:bg-white/[0.08] text-dusk')}>
                    {done === total ? 'Lengkap' : `${done}/${total}`}
                  </span>
                </div>
                <p className="text-[11px] text-muted-light dark:text-muted-dark line-clamp-1 mb-1">{preview}</p>
                {(j.tags || []).length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {j.tags.slice(0, 3).map((t) => (
                      <span key={t} className="inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-[7px] bg-black/[0.05] dark:bg-white/[0.08] text-dusk">
                        <TagIcon size={8} /> {t}
                      </span>
                    ))}
                    {j.tags.length > 3 && <span className="text-[9px] font-mono tabular-nums text-dusk">+{j.tags.length - 3}</span>}
                  </div>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
