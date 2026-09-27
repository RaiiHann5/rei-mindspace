import { useEffect, useState } from 'react'
import { Modal, Button, Input, Textarea, StarRating } from '@/components/ui'
import { parseGenres } from '@/lib/movies'
import { uid as makeId } from '@/lib/utils'

const empty = {
  title: '',
  year: '',
  genresText: '',
  poster: '',
  favorite: false,
}

const emptyFirstLog = { watched: true, date: new Date().toISOString().slice(0, 10), rating: 0, review: '' }

export default function MovieFormModal({ open, onClose, onSubmit, initial }) {
  const isEdit = !!initial
  const [form, setForm] = useState(empty)
  const [firstLog, setFirstLog] = useState(emptyFirstLog)

  useEffect(() => {
    if (!initial) { setForm(empty); setFirstLog(emptyFirstLog); return }
    setForm({ ...empty, ...initial, genresText: (initial.genres || []).join(', ') })
  }, [initial, open])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const setLog = (k, v) => setFirstLog((f) => ({ ...f, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const { genresText, ...rest } = form
    const payload = {
      ...rest,
      year: form.year ? Number(form.year) : null,
      genres: parseGenres(genresText),
    }
    if (!isEdit) {
      payload.logs = firstLog.watched
        ? [{ id: makeId(), date: new Date(firstLog.date).toISOString(), rating: firstLog.rating, review: firstLog.review, rewatch: false }]
        : []
    }
    onSubmit(payload)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit film' : 'Add a film'}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit}>{isEdit ? 'Save' : 'Add'}</Button></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-[1fr_100px] gap-3">
          <div>
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Title</label>
            <Input autoFocus value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Parasite" required />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Year</label>
            <Input type="number" value={form.year} onChange={(e) => set('year', e.target.value)} placeholder="2019" />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Genres</label>
          <Input value={form.genresText} onChange={(e) => set('genresText', e.target.value)} placeholder="Thriller, Drama" />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Poster</label>
          <Input value={form.poster} onChange={(e) => set('poster', e.target.value)} placeholder="https://..." />
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.favorite} onChange={(e) => set('favorite', e.target.checked)} className="h-4 w-4 accent-primary-500" />
          Favorite
        </label>

        {!isEdit && (
          <>
            <label className="flex items-center gap-2 text-sm cursor-pointer border-t border-black/10 dark:border-white/10 pt-4">
              <input type="checkbox" checked={firstLog.watched} onChange={(e) => setLog('watched', e.target.checked)} className="h-4 w-4 accent-primary-500" />
              Already watched
            </label>

            {firstLog.watched ? (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Watched on</label>
                  <Input type="date" value={firstLog.date} onChange={(e) => setLog('date', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1.5 block">Rating</label>
                  <StarRating rating={firstLog.rating} onChange={(v) => setLog('rating', v)} size={22} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Review</label>
                  <Textarea rows={3} value={firstLog.review} onChange={(e) => setLog('review', e.target.value)} placeholder="What did you think..." />
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-light dark:text-muted-dark">Added to the watchlist instead.</p>
            )}
          </>
        )}
      </form>
    </Modal>
  )
}
