import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { id as idLocale } from 'date-fns/locale'
import { format } from 'date-fns'
import {
  Pin, Trash2, Sparkles, RefreshCw, X, Plus, Tag as TagIcon,
  Pencil, Check, Loader2, Heart,
} from 'lucide-react'
import { Button, Textarea } from '@/components/ui'
import MoodFace, { MOOD_TONE } from '@/components/journal/MoodFace'
import { cn, debounce } from '@/lib/utils'
import {
  MOODS, TAG_SUGGESTIONS, randomPrompt, countWords, estimateMinutes, entryCompletion, isEntryBlank,
} from '@/lib/journalPrompts'

const AUTOSAVE_DELAY = 900

export default function JournalEntryPanel({ entry, updateItem, onDeleteRequest }) {
  const [draft, setDraft] = useState(entry)
  const [isEditing, setIsEditing] = useState(isEntryBlank(entry))
  const [saveStatus, setSaveStatus] = useState('saved') // 'saved' | 'unsaved' | 'saving'
  const [saveButtonState, setSaveButtonState] = useState('idle') // 'idle' | 'saving' | 'success'
  const [gratitudeInput, setGratitudeInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [prompt, setPrompt] = useState(() => randomPrompt())

  const dirtyRef = useRef(false)
  const pendingRef = useRef({})
  const updateItemRef = useRef(updateItem)
  updateItemRef.current = updateItem

  // Reset local editor state whenever the selected entry changes.
  useEffect(() => {
    setDraft(entry)
    setIsEditing(isEntryBlank(entry))
    setSaveStatus('saved')
    setSaveButtonState('idle')
    setGratitudeInput('')
    setTagInput('')
    setPrompt(randomPrompt())
    dirtyRef.current = false
    pendingRef.current = {}
  }, [entry?.id])

  // One debounced flusher per entry — accumulates patches in pendingRef so
  // fast edits across different fields never clobber each other.
  const scheduleSave = useMemo(
    () => debounce(() => {
      const fields = pendingRef.current
      pendingRef.current = {}
      if (Object.keys(fields).length === 0) return
      setSaveStatus('saving')
      updateItemRef.current(entry.id, fields).then(() => {
        setSaveStatus('saved')
        dirtyRef.current = false
      })
    }, AUTOSAVE_DELAY),
    [entry?.id]
  )

  if (!entry || !draft) return null

  const patch = (fields, { immediate } = {}) => {
    setDraft((d) => ({ ...d, ...fields }))
    dirtyRef.current = true
    setSaveStatus('unsaved')
    if (immediate) {
      pendingRef.current = { ...pendingRef.current, ...fields }
      const toSend = pendingRef.current
      pendingRef.current = {}
      setSaveStatus('saving')
      updateItem(entry.id, toSend).then(() => {
        setSaveStatus('saved')
        dirtyRef.current = false
      })
    } else {
      pendingRef.current = { ...pendingRef.current, ...fields }
      scheduleSave()
    }
  }

  const flushSave = async () => {
    pendingRef.current = {}
    setSaveButtonState('saving')
    setSaveStatus('saving')
    await updateItem(entry.id, {
      mood: draft.mood, gratitude: draft.gratitude, highlights: draft.highlights,
      learning: draft.learning, tags: draft.tags, pinned: draft.pinned,
    })
    dirtyRef.current = false
    setSaveStatus('saved')
    setSaveButtonState('success')
    setTimeout(() => setSaveButtonState('idle'), 1600)
  }

  const finishEditing = async () => {
    await flushSave()
    setIsEditing(false)
  }

  const addGratitude = () => {
    const v = gratitudeInput.trim()
    if (!v) return
    patch({ gratitude: [...(draft.gratitude || []), v] }, { immediate: true })
    setGratitudeInput('')
  }
  const removeGratitude = (i) => patch({ gratitude: draft.gratitude.filter((_, idx) => idx !== i) }, { immediate: true })

  const toggleTag = (t) => {
    const has = (draft.tags || []).includes(t)
    patch({ tags: has ? draft.tags.filter((x) => x !== t) : [...(draft.tags || []), t] }, { immediate: true })
  }
  const addCustomTag = () => {
    const v = tagInput.trim()
    if (!v || (draft.tags || []).includes(v)) { setTagInput(''); return }
    patch({ tags: [...(draft.tags || []), v] }, { immediate: true })
    setTagInput('')
  }

  const togglePin = () => patch({ pinned: !draft.pinned }, { immediate: true })
  const shufflePrompt = () => setPrompt((p) => randomPrompt(p))

  const highlightsWords = countWords(draft.highlights)
  const learningWords = countWords(draft.learning)
  const totalWords = highlightsWords + learningWords
  const { pct } = entryCompletion(draft)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-semibold tracking-tight text-lg capitalize">
            {format(new Date(entry.date), 'EEEE, d MMMM yyyy', { locale: idLocale })}
          </h2>
          <SaveStatusLabel status={saveStatus} />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={togglePin}
            aria-label={draft.pinned ? 'Lepas sematan' : 'Sematkan entri'}
            className={cn('h-8 w-8 rounded-lg flex items-center justify-center transition-colors neo-press', draft.pinned ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300' : 'text-muted-light dark:text-muted-dark hover:bg-black/[0.05] dark:hover:bg-white/[0.07] hover:text-ink-light dark:hover:text-ink-dark')}
          >
            <Pin size={15} className={draft.pinned ? 'fill-current' : ''} />
          </button>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-xs font-semibold border border-[color:var(--line)] text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors neo-press">
              <Pencil size={12} /> Edit
            </button>
          )}
          <button onClick={() => onDeleteRequest(entry)} aria-label="Hapus entri" className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-light dark:text-muted-dark hover:bg-rose-500/10 hover:text-rose-500 neo-press">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {(draft.tags || []).length > 0 && !isEditing && (
        <div className="flex flex-wrap gap-1.5 -mt-2">
          {draft.tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-black/[0.05] dark:bg-white/[0.08] text-muted-light dark:text-muted-dark">
              <TagIcon size={9} /> {t}
            </span>
          ))}
        </div>
      )}

      {isEditing && (
        <div className="rounded-xl border border-[color:var(--line)] bg-primary-500/[0.06] p-3.5 flex items-start gap-2.5">
          <Sparkles size={15} className="mt-0.5 shrink-0 text-primary-600 dark:text-primary-400" />
          <p className="text-sm font-medium flex-1">{prompt}</p>
          <button onClick={shufflePrompt} aria-label="Ganti pertanyaan" className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.06] dark:hover:bg-white/[0.08] shrink-0 neo-press">
            <RefreshCw size={13} />
          </button>
        </div>
      )}

      {/* Mood */}
      <div>
        <p className="text-[11px] font-medium text-dusk mb-2">Bagaimana harimu?</p>
        <div className="flex gap-2 flex-wrap">
          {MOODS.map((m) => {
            const active = draft.mood === m.value
            const tone = MOOD_TONE[m.value] || MOOD_TONE[3]
            return (
              <button
                key={m.value}
                disabled={!isEditing}
                onClick={() => patch({ mood: m.value }, { immediate: true })}
                title={m.label}
                className={cn(
                  'group flex flex-col items-center gap-1.5 rounded-xl px-3 py-2 transition-all disabled:cursor-default neo-press',
                  active ? cn('ring-2', tone.bg, tone.text) : 'text-ink-light dark:text-ink-dark',
                  isEditing && !active && 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                )}
              >
                <MoodFace value={m.value} size={30} />
                <span className={cn('text-[10px] font-semibold', active ? '' : 'text-dusk')}>{m.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Gratitude */}
      <div>
        <p className="text-[11px] font-medium text-dusk mb-2 flex items-center gap-1.5"><Heart size={12} /> Gratitude</p>
        {isEditing && (
          <div className="flex gap-2 mb-2">
            <input
              value={gratitudeInput}
              onChange={(e) => setGratitudeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addGratitude()}
              placeholder="Sesuatu yang kamu syukuri..."
              className="flex-1 h-9 rounded-lg px-3 text-sm bg-black/[0.03] dark:bg-white/[0.05] border border-[color:var(--line)] outline-none placeholder:text-dusk focus:border-[color:var(--line-strong)] transition-colors"
            />
            <Button size="sm" onClick={addGratitude} disabled={!gratitudeInput.trim()}>Tambah</Button>
          </div>
        )}
        {(draft.gratitude || []).length === 0 ? (
          <p className="text-xs text-dusk italic">Belum ada yang disyukuri.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            <AnimatePresence initial={false}>
              {draft.gratitude.map((g, i) => (
                <motion.span
                  key={`${g}-${i}`}
                  layout
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-amber-500/12 text-amber-700 dark:text-amber-300"
                >
                  {g}
                  {isEditing && (
                    <button onClick={() => removeGratitude(i)} aria-label="Hapus" className="hover:opacity-70">
                      <X size={11} />
                    </button>
                  )}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <p className="text-[11px] font-medium text-dusk mb-2">Tag</p>
        {isEditing ? (
          <>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {TAG_SUGGESTIONS.map((t) => {
                const active = (draft.tags || []).includes(t)
                return (
                  <button
                    key={t}
                    onClick={() => toggleTag(t)}
                    className={cn('h-7 px-2.5 rounded-md text-xs font-semibold border transition-colors neo-press',
                      active
                        ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500/30'
                        : 'border-[color:var(--line)] text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark')}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
                placeholder="Tag lain..."
                className="flex-1 h-8 rounded-lg px-3 text-xs bg-black/[0.03] dark:bg-white/[0.05] outline-none placeholder:text-dusk"
              />
              {tagInput.trim() && (
                <button onClick={addCustomTag} aria-label="Tambah tag" className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.05] dark:hover:bg-white/[0.08] neo-press">
                  <Plus size={13} />
                </button>
              )}
            </div>
          </>
        ) : (draft.tags || []).length === 0 ? (
          <p className="text-xs text-dusk italic">Tidak ada tag.</p>
        ) : null}
      </div>

      {/* Highlights */}
      <JournalTextField
        label="Highlights"
        placeholder="Apa yang berjalan baik hari ini?"
        value={draft.highlights}
        editing={isEditing}
        words={highlightsWords}
        onChange={(v) => patch({ highlights: v })}
      />

      {/* Learning */}
      <JournalTextField
        label="Learning"
        placeholder="Apa yang kamu pelajari hari ini?"
        value={draft.learning}
        editing={isEditing}
        words={learningWords}
        onChange={(v) => patch({ learning: v })}
      />

      {isEditing && (
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-[color:var(--line)]">
          {/* Meta values stack instead of being joined by middle dots. */}
          <div className="flex flex-col text-[11px] leading-tight font-mono tabular-nums text-dusk">
            <span>{totalWords} kata</span>
            <span>{estimateMinutes(totalWords) || 0} mnt baca</span>
            <span>{pct}% lengkap</span>
          </div>
          <SaveButton state={saveButtonState} onClick={finishEditing} />
        </div>
      )}
    </div>
  )
}

function JournalTextField({ label, placeholder, value, editing, words, onChange }) {
  if (!editing) {
    return (
      <div>
        <p className="text-[11px] font-medium text-dusk mb-1.5">{label}</p>
        {value?.trim() ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{value}</p>
        ) : (
          <p className="text-xs text-dusk italic">Belum diisi.</p>
        )}
      </div>
    )
  }
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <p className="text-[11px] font-medium text-dusk">{label}</p>
        <span className={cn('flex flex-col items-end text-[10px] leading-tight font-mono tabular-nums', (value || '').length > 500 ? 'text-amber-600 dark:text-amber-300' : 'text-dusk')}>
          <span>{(value || '').length} karakter</span>
          <span>{words} kata</span>
        </span>
      </div>
      <Textarea rows={3} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function SaveStatusLabel({ status }) {
  const map = {
    saving: { text: 'Menyimpan', className: 'text-amber-600 dark:text-amber-300', icon: <Loader2 size={11} className="animate-spin" /> },
    unsaved: { text: 'Belum disimpan', className: 'text-dusk', icon: <span className="h-1.5 w-1.5 rounded-full bg-dusk" /> },
    saved: { text: 'Tersimpan', className: 'text-teal-600 dark:text-teal-300', icon: <Check size={11} /> },
  }
  const s = map[status] || map.saved
  return (
    <p className={cn('text-[11px] font-medium flex items-center gap-1 mt-0.5', s.className)}>
      {s.icon} {s.text}
    </p>
  )
}

function SaveButton({ state, onClick }) {
  return (
    <Button size="sm" onClick={onClick} disabled={state === 'saving'} className={cn(state === 'success' && '!bg-teal-500')}>
      <AnimatePresence mode="wait" initial={false}>
        {state === 'saving' ? (
          <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
            <Loader2 size={13} className="animate-spin" /> Menyimpan
          </motion.span>
        ) : state === 'success' ? (
          <motion.span key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
            <Check size={13} /> Tersimpan
          </motion.span>
        ) : (
          <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
            <Check size={13} /> Simpan
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  )
}
