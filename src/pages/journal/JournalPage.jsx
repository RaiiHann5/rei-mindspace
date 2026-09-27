import { useEffect, useMemo, useRef, useState } from 'react'
import { id as idLocale } from 'date-fns/locale'
import { format, addDays, isSameDay, startOfDay } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, BookOpen, CalendarDays } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCollection } from '@/hooks/useCollection'
import { PageHeader, Button, Card, EmptyState, Skeleton } from '@/components/ui'
import JournalCalendar from '@/components/journal/JournalCalendar'
import JournalSummaryCard from '@/components/journal/JournalSummaryCard'
import JournalHistoryList from '@/components/journal/JournalHistoryList'
import JournalEntryPanel from '@/components/journal/JournalEntryPanel'
import DeleteJournalModal from '@/components/journal/DeleteJournalModal'

function dayKey(date) {
  return format(date, 'yyyy-MM-dd')
}

export default function JournalPage() {
  const { items, isLoading, createItem, updateItem, removeItem } = useCollection('journal')

  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()))
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [moodFilter, setMoodFilter] = useState(null)
  const [tagFilter, setTagFilter] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const calendarRef = useRef(null)

  useEffect(() => {
    if (!calendarOpen) return
    const onClick = (e) => { if (calendarRef.current && !calendarRef.current.contains(e.target)) setCalendarOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [calendarOpen])

  const entries = useMemo(
    () => items.map((j) => ({ ...j, __key: dayKey(new Date(j.date)) })),
    [items]
  )

  const today = startOfDay(new Date())
  const selectedKey = dayKey(selectedDate)
  const isToday = isSameDay(selectedDate, today)
  const activeEntry = entries.find((j) => j.__key === selectedKey) || null

  const entryDateKeys = useMemo(() => new Set(entries.map((j) => j.__key)), [entries])

  const allTags = useMemo(() => {
    const set = new Set()
    entries.forEach((j) => (j.tags || []).forEach((t) => set.add(t)))
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [entries])

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase()
    return entries
      .filter((j) => {
        if (moodFilter && j.mood !== moodFilter) return false
        if (tagFilter && !(j.tags || []).includes(tagFilter)) return false
        if (q) {
          const haystack = [j.highlights, j.learning, ...(j.gratitude || []), ...(j.tags || [])].join(' ').toLowerCase()
          if (!haystack.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => {
        if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1
        return new Date(b.date) - new Date(a.date)
      })
  }, [entries, search, moodFilter, tagFilter])

  const createEntryForDate = async (date) => {
    const key = dayKey(date)
    const existing = entries.find((j) => j.__key === key)
    if (existing) { setSelectedDate(date); return }
    await createItem({ date: date.toISOString(), mood: null, gratitude: [], highlights: '', learning: '', tags: [], pinned: false })
    setSelectedDate(date)
  }

  const goToday = () => setSelectedDate(today)
  const prevDay = () => setSelectedDate((d) => addDays(d, -1))
  const nextDay = () => setSelectedDate((d) => (isSameDay(d, today) ? d : addDays(d, 1)))
  const selectFromCalendar = (date) => { setSelectedDate(date); setCalendarOpen(false) }
  const selectFromHistory = (entry) => setSelectedDate(startOfDay(new Date(entry.date)))

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await removeItem(deleteTarget.id)
      toast.success('Entri jurnal dihapus')
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Journal"
        description="Catatan harian tentang mood, gratitude, dan pelajaran hidup."
        actions={
          !isToday ? (
            <Button variant="secondary" onClick={goToday}><CalendarDays size={16} /> Hari ini</Button>
          ) : !activeEntry ? (
            <Button onClick={() => createEntryForDate(today)}><Plus size={16} /> Tulis entri</Button>
          ) : null
        }
      />

      <div className="grid lg:grid-cols-[300px_1fr] gap-4">
        {/* Sidebar */}
        <div className="flex flex-col gap-4 lg:max-h-[78vh]">
          <Card padding className="space-y-2.5">
            <div className="flex items-center justify-between">
              <button onClick={prevDay} aria-label="Hari sebelumnya" className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.05] dark:hover:bg-white/[0.07] neo-press">
                <ChevronLeft size={16} />
              </button>
              <div className="relative" ref={calendarRef}>
                <button
                  onClick={() => setCalendarOpen((v) => !v)}
                  className="flex items-center gap-1.5 text-sm font-display font-semibold tracking-tight capitalize hover:opacity-70 transition-opacity neo-press"
                >
                  <CalendarDays size={13} />
                  {format(selectedDate, 'EEE, d MMM yyyy', { locale: idLocale })}
                </button>
                {calendarOpen && (
                  <JournalCalendar value={selectedDate} onChange={selectFromCalendar} entryDateKeys={entryDateKeys} />
                )}
              </div>
              <button onClick={nextDay} disabled={isToday} aria-label="Hari berikutnya" className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.05] dark:hover:bg-white/[0.07] disabled:opacity-30 disabled:pointer-events-none neo-press">
                <ChevronRight size={16} />
              </button>
            </div>
            {!isToday && (
              <button onClick={goToday} className="w-full text-center text-[11px] font-medium text-primary-600 dark:text-primary-400 hover:underline">
                Kembali ke hari ini
              </button>
            )}
          </Card>

          <JournalSummaryCard entry={activeEntry} isToday={isToday} />

          <Card padding className="flex-1 min-h-0 flex flex-col">
            <p className="text-[11px] font-medium text-dusk mb-2.5">Riwayat</p>
            <JournalHistoryList
              isLoading={isLoading}
              entries={filteredEntries}
              allTags={allTags}
              selectedKey={selectedKey}
              onSelect={selectFromHistory}
              search={search}
              onSearch={setSearch}
              moodFilter={moodFilter}
              onMoodFilter={setMoodFilter}
              tagFilter={tagFilter}
              onTagFilter={setTagFilter}
            />
          </Card>
        </div>

        {/* Main entry panel — the page-level panel, so 26px not 16px. */}
        <Card className="min-h-[60vh] !rounded-3xl">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : !activeEntry ? (
            <EmptyState
              icon={BookOpen}
              title={isToday ? 'Belum ada entri hari ini' : 'Belum ada entri untuk tanggal ini'}
              description={
                isToday
                  ? 'Catat mood, rasa syukur, pelajaran.'
                  : `Belum ada entri untuk ${format(selectedDate, 'EEEE, d MMMM yyyy', { locale: idLocale })}.`
              }
              actionLabel="Tulis entri"
              onAction={() => createEntryForDate(selectedDate)}
            />
          ) : (
            <JournalEntryPanel entry={activeEntry} updateItem={updateItem} onDeleteRequest={setDeleteTarget} />
          )}
        </Card>
      </div>

      <DeleteJournalModal
        entry={deleteTarget}
        isDeleting={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
