import { Check, Circle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Progress from '@/components/ui/Progress'
import { cn } from '@/lib/utils'
import { moodInfo, countWords, estimateMinutes, entryCompletion } from '@/lib/journalPrompts'

export default function JournalSummaryCard({ entry, isToday }) {
  const { parts, done, total, pct } = entryCompletion(entry)
  const words = countWords(entry?.highlights) + countWords(entry?.learning)
  const minutes = estimateMinutes(words)
  const mood = entry ? moodInfo(entry.mood) : null

  return (
    <Card padding className="space-y-3.5">
      <p className="text-[11px] font-medium text-dusk">
        {isToday ? 'Ringkasan hari ini' : 'Ringkasan entri'}
      </p>

      <div className="flex items-center gap-3">
        <div className="h-11 w-11 shrink-0 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-xl">
          {mood ? mood.emoji : '❔'}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{mood ? mood.label : 'Mood belum diisi'}</p>
          <p className="text-[11px] text-muted-light dark:text-muted-dark">
            {entry ? `${(entry.gratitude || []).length} hal disyukuri` : 'Belum ada entri'}
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-dusk">Progres jurnal</span>
          <span className="flex items-baseline gap-0.5">
            {/* The one sanctioned hero number on the Journal screen. */}
            <span className="num text-[15px] ember-num">{done}</span>
            <span className="text-[11px] font-mono tabular-nums text-dusk">/{total} bagian</span>
          </span>
        </div>
        <Progress value={pct} tone={pct === 100 ? 'teal' : 'primary'} />
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {parts.map((p) => (
          <div key={p.key} className={cn('flex items-center gap-1.5 text-[11px] rounded-lg px-2 py-1.5', p.done ? 'bg-primary-500/10' : 'bg-black/[0.03] dark:bg-white/[0.05] text-muted-light dark:text-muted-dark')}>
            {p.done ? <Check size={11} className="shrink-0 text-primary-600 dark:text-primary-400" /> : <Circle size={11} className="shrink-0" />}
            <span className="truncate font-medium">{p.label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-[color:var(--line)] text-[11px] font-mono tabular-nums text-dusk">
        <span>{words} kata ditulis</span>
        <span>{words ? `~${minutes} mnt baca` : '—'}</span>
      </div>
    </Card>
  )
}
