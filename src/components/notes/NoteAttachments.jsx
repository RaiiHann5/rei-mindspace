import { useEffect, useRef, useState } from 'react'
import { Link2, FileText, Upload, Plus, X, ExternalLink, FileArchive } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Input } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  ACCEPTED_DOCS, MAX_DOCUMENT_BYTES, humanSize, isAcceptedFile,
  resolveAttachment, makeLink, storeDocument,
} from '@/lib/noteAttachments'

// Link + document attachments for a note.
//
// Local blobs are resolved to object URLs asynchronously, so each row keeps
// its own `href` state. Object URLs are cached in noteAttachments.js and
// revoked when the note is deleted, so a note reopened in the same session
// does not leak another copy.
export default function NoteAttachments({ links, attachments, onChange, readOnly = false }) {
  const [urlDraft, setUrlDraft] = useState('')
  const [titleDraft, setTitleDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef(null)
  const dragOver = useState(false)

  const addLink = (e) => {
    e.preventDefault()
    const link = makeLink(urlDraft, titleDraft)
    if (!link) return
    onChange({ links: [...links, link] })
    setUrlDraft('')
    setTitleDraft('')
  }

  const pickFiles = async (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return
    const rejected = files.filter((f) => !isAcceptedFile(f))
    if (rejected.length) {
      toast.error(`${rejected[0].name} — unsupported file type`)
    }
    const good = files.filter(isAcceptedFile).filter((f) => f.size <= MAX_DOCUMENT_BYTES)
    if (good.length < files.length && rejected.length === 0) {
      toast.error(`Too large — max ${humanSize(MAX_DOCUMENT_BYTES)}`)
    }
    if (!good.length) return

    setBusy(true)
    const added = []
    for (const file of good) {
      try {
        const src = await storeDocument(file)
        added.push({ id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: file.name, size: file.size, type: file.type || 'application/octet-stream', src })
      } catch (err) {
        toast.error(err?.message || `Could not attach ${file.name}`)
      }
    }
    if (added.length) onChange({ attachments: [...attachments, ...added] })
    setBusy(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const removeLink = (id) => onChange({ links: links.filter((l) => l.id !== id) })
  const removeAttachment = (id) =>
    onChange({ attachments: attachments.filter((a) => a.id !== id) })

  const empty = !links.length && !attachments.length

  return (
    <section className="rounded-2xl border border-[color:var(--line)] bg-panel2-light dark:bg-panel2-dark overflow-hidden">
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[color:var(--line)]">
        <h3 className="font-display font-semibold text-sm flex items-center gap-2">
          <Link2 size={14} strokeWidth={2.2} />
          Attachments
        </h3>
        {!readOnly && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-dusk hidden sm:inline">
              {links.length + attachments.length || 'none'}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={13} /> {busy ? 'Uploading' : 'Document'}
            </Button>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept={ACCEPTED_DOCS}
              className="hidden"
              onChange={(e) => pickFiles(e.target.files)}
            />
          </div>
        )}
      </header>

      {/* Drop zone doubles as the empty state. */}
      {!readOnly && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); pickFiles(e.dataTransfer.files) }}
          className={cn(
            'px-4 py-3 border-b border-dashed transition-colors',
            dragOver
              ? 'border-ember-500 bg-primary-500/[0.07]'
              : 'border-[color:var(--line)]'
          )}
        >
          <p className="text-[11.5px] text-dusk flex items-center gap-1.5">
            <Upload size={12} strokeWidth={2} />
            Drop documents here, or use the button above
          </p>
        </div>
      )}

      {empty ? (
        <p className="px-4 py-6 text-sm text-dusk text-center">Nothing attached</p>
      ) : (
        <ul className="divide-y divide-[color:var(--line)]">
          {links.map((l) => (
            <li key={l.id} className="flex items-center gap-3 px-4 py-2.5 group">
              <span className="h-7 w-7 shrink-0 rounded-lg grid place-items-center bg-primary-500/10 text-primary-600 dark:text-ember-300">
                <Link2 size={13} strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium truncate">{l.title || l.url}</p>
                {l.title && <p className="text-[11px] text-dusk font-mono truncate">{l.url}</p>}
              </div>
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                aria-label="Open link"
                className="h-7 w-7 shrink-0 rounded-md grid place-items-center text-dusk hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
              >
                <ExternalLink size={13} />
              </a>
              {!readOnly && (
                <button
                  onClick={() => removeLink(l.id)}
                  aria-label="Remove link"
                  className="h-7 w-7 shrink-0 rounded-md grid place-items-center text-dusk hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </li>
          ))}

          {attachments.map((a) => (
            <AttachmentRow key={a.id} attachment={a} readOnly={readOnly} onRemove={() => removeAttachment(a.id)} />
          ))}
        </ul>
      )}

      {!readOnly && (
        <form onSubmit={addLink} className="flex flex-wrap items-center gap-2 px-4 py-3 border-t border-[color:var(--line)]">
          <Input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="Paste a link"
            className="flex-1 min-w-[160px] h-9"
          />
          <Input
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            placeholder="Label (optional)"
            className="w-40 h-9"
          />
          <Button type="submit" size="sm" disabled={!urlDraft.trim()} className="h-9">
            <Plus size={13} /> Add
          </Button>
        </form>
      )}
    </section>
  )
}

// Split out so the async blob resolve is isolated per file — one slow or
// missing blob must not block the rest of the list from rendering.
function AttachmentRow({ attachment, readOnly, onRemove }) {
  const [href, setHref] = useState(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let alive = true
    resolveAttachment(attachment.src)
      .then((url) => { if (alive) { setHref(url); setMissing(!url) } })
      .catch(() => { if (alive) setMissing(true) })
    return () => { alive = false }
  }, [attachment.src])

  const isImage = attachment.type?.startsWith('image/')
  const Icon = attachment.type === 'application/pdf' ? FileText : isImage ? FileArchive : FileText

  return (
    <li className="flex items-center gap-3 px-4 py-2.5">
      <span className="h-7 w-7 shrink-0 rounded-lg grid place-items-center bg-black/[0.05] dark:bg-white/[0.06] text-muted-light dark:text-muted-dark">
        <Icon size={13} strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium truncate">{attachment.name}</p>
        <p className="text-[11px] text-dusk font-mono">
          {humanSize(attachment.size)}
          {missing && <span className="text-rose-500"> · file missing</span>}
        </p>
      </div>
      {href && !isImage && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label="Open document"
          className="h-7 w-7 shrink-0 rounded-md grid place-items-center text-dusk hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
        >
          <ExternalLink size={13} />
        </a>
      )}
      {!readOnly && (
        <button
          onClick={onRemove}
          aria-label="Remove document"
          className="h-7 w-7 shrink-0 rounded-md grid place-items-center text-dusk hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
        >
          <X size={13} />
        </button>
      )}
    </li>
  )
}
