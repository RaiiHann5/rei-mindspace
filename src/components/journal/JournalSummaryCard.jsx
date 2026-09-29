import { Check, Circle, CircleDashed } from 'lucide-react'
import Card from '@/components/ui/Card'
import Progress from '@/components/ui/Progress'
import MoodFace, { MOOD_TONE, MOOD_NOTE } from '@/components/journal/MoodFace'
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

      {/* Mood card, per the reference: a tint-tinted block, the pixel face on
          the left, the label as the title and a coloured verdict underneath. */}
      <div className={cn('rounded-2xl p-3.5 flex items-center gap-3.5', mood ? (MOOD_TONE[entry.mood] || MOOD_TONE[3]).bg : 'bg-black/[0.03] dark:bg-white/[0.04]')}>
        {mood ? (
          <MoodFace value={entry.mood} size={40} title={mood.label} />
        ) : (
          <div className="h-10 w-12 shrink-0 grid place-items-center rounded-lg bg-black/[0.05] dark:bg-white/[0.07] text-dusk">
            <CircleDashed size={18} strokeWidth={2} />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{mood ? mood.label : 'Mood belum diisi'}</p>
          {mood ? (
            <p className={cn('text-[12px] font-medium flex items-center gap-1.5 mt-0.5', (MOOD_TONE[entry.mood] || MOOD_TONE[3]).text)}>
              <span aria-hidden="true">{MOOD_NOTE[entry.mood]?.icon || '–'}</span>
              <span className="truncate">{MOOD_NOTE[entry.mood]?.text}</span>
            </p>
          ) : (
            <p className="text-[12px] text-dusk mt-0.5">
              {entry ? `${(entry.gratitude || []).length} hal disyukuri` : 'Belum ada entri'}
            </p>
          )}
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
