import { useEffect, useState } from 'react'
import { Lock, Unlock, Plus, Pencil, Trash2, ShieldAlert, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageHeader, Card, Button, Input, Textarea, Modal } from '@/components/ui'
import { useCollection } from '@/hooks/useCollection'
import { useVaultStore } from '@/store/useVaultStore'
import { cn } from '@/lib/utils'

// Private notebook encrypted client-side with AES-GCM (see lib/vault.js).
// Whole vault = one record whose data is ciphertext; the password never
// leaves memory. Losing it means the data is gone — that's intentional.
export default function VaultPage() {
  const { items, isLoading, createItem, removeItem } = useCollection('vault')
  const record = items[0] || null
  const v = useVaultStore()

  const attachId = record?.id || null
  useEffect(() => {
    if (attachId) v.attach(attachId)
    else v.detach()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachId])

  const status = v.status

  if (isLoading) {
    return <div className="space-y-4 animate-fade-in"><Card className="h-32" /></div>
  }

  return (
    <div className="animate-fade-in space-y-5">
      <PageHeader
        title="Private vault"
        description="Catatan pribadi terenkripsi end-to-end di browser."
        actions={
          status === 'unlocked' ? (
            <Button variant="secondary" onClick={v.lock}><Lock size={15} /> Kunci</Button>
          ) : undefined
        }
      />

      {!record ? <SetupView onSetup={async (pw) => {
        const envelope = await v.create(pw)
        const now = new Date().toISOString()
        const created = await createItem({ ...envelope, createdAt: now, updatedAt: now })
        await v.unlock(envelope, pw, created?.id)
        toast.success('Vault berhasil dibuat')
      }} /> : null}

      {record && status === 'locked' && (
        <UnlockView onUnlock={async (pw) => {
          const ok = await v.unlock(record, pw, record.id)
          if (ok) toast.success('Vault terbuka')
        }} onDestroy={async () => {
          if (!confirm('Hapus vault ini? Semua catatan terenkripsi di dalamnya akan hilang permanen.')) return
          await removeItem(record.id)
          toast.success('Vault dihapus')
        }} />
      )}

      {record && status === 'unlocked' && <NotesHub record={record} />}
    </div>
  )
}

function SetupView({ onSetup }) {
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (pw.length < 4) { toast.error('Password minimal 4 karakter'); return }
    if (pw !== pw2) { toast.error('Password tidak sama'); return }
    setBusy(true)
    try { await onSetup(pw) } catch { toast.error('Gagal membuat vault') } finally { setBusy(false) }
  }

  return (
    <Card>
      <div className="flex items-start gap-3 mb-5">
        <div className="h-10 w-10 rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0"><ShieldAlert size={18} /></div>
        <div>
          <h3 className="font-display font-semibold tracking-tight">Buat vault pribadi</h3>
          <p className="text-sm text-muted-light dark:text-muted-dark">
            Set password sekali. Semua catatan disimpan <strong className="font-semibold text-ink-light dark:text-ink-dark">terenkripsi</strong> — bahkan server tidak bisa membacanya.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4 max-w-xs">
        <PasswordField label="Password" value={pw} show={show} setShow={setShow} onChange={setPw} />
        <PasswordField label="Ulangi password" value={pw2} show={show} setShow={setShow} onChange={setPw2} />
        <Button type="submit" loading={busy} className="w-full"><ShieldAlert size={15} /> Buat Vault</Button>
      </form>

      <p className="mt-5 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
        <ShieldAlert size={13} className="mt-0.5 shrink-0" />
        Kalau lu lupa password, data vault tidak bisa dipulihkan oleh siapa pun — termasuk aplikasi ini.
      </p>
    </Card>
  )
}

function UnlockView({ onUnlock, onDestroy }) {
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const error = useVaultStore((s) => s.error)

  const submit = async (e) => {
    e.preventDefault()
    if (!pw) return
    setBusy(true)
    try { await onUnlock(pw) } finally { setBusy(false) }
  }

  return (
    <Card className="max-w-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0"><Lock size={18} /></div>
        <div>
          <h3 className="font-display font-semibold tracking-tight">Vault terkunci</h3>
          <p className="text-sm text-muted-light dark:text-muted-dark">Masukkan password untuk membuka.</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <PasswordField label="Password" value={pw} show={show} setShow={setShow} onChange={setPw} autoFocus />
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" loading={busy} className="flex-1"><Unlock size={15} /> Buka</Button>
          <Button variant="danger" onClick={onDestroy} title="Hapus vault permanen" aria-label="Hapus vault permanen"><Trash2 size={15} /></Button>
        </div>
      </form>
    </Card>
  )
}

function PasswordField({ label, value, show, setShow, onChange, autoFocus }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-dusk mb-1.5 block">{label}</label>
      <div className="relative">
        <Input type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} autoFocus={autoFocus} className="pr-10" />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  )
}

function NotesHub({ record }) {
  const v = useVaultStore()
  const notes = v.notes
  const { updateItem } = useCollection('vault')
  const [editing, setEditing] = useState(null) // { id, title, content } | 'new'

  const saveEnvelope = async (env) => {
    await updateItem(record.id, { ...env })
  }

  const persist = async (fn) => { await saveEnvelope(await fn()) }

  const openNew = () => setEditing({ id: null, title: '', content: '' })
  const openEdit = (n) => setEditing({ id: n.id, title: n.title, content: n.content })

  const submit = async () => {
    if (!editing?.title.trim()) return
    await persist(async () => {
      if (editing.id) return v.updateNote(editing.id, { title: editing.title.trim(), content: editing.content })
      return v.addNote({ title: editing.title.trim(), content: editing.content })
    })
    toast.success(editing.id ? 'Catatan diupdate' : 'Catatan ditambahkan')
    setEditing(null)
  }

  const remove = async (note) => {
    if (!confirm('Hapus catatan ini?')) return
    await persist(() => v.removeNote(note.id))
    toast.success('Catatan dihapus')
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-medium text-dusk leading-snug">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="inline text-teal-500" />
            <span><span className="font-mono tabular-nums">{notes.length}</span> catatan</span>
          </span>
          <span className="block pl-5.5">terenkripsi AES-256</span>
        </div>
        <Button onClick={openNew} size="sm"><Plus size={15} /> New note</Button>
      </div>

      {notes.length === 0 ? (
        <Card className="text-center py-10 text-sm text-muted-light dark:text-muted-dark">
          Belum ada catatan. Klik <strong className="font-semibold text-ink-light dark:text-ink-dark">New note</strong> untuk mulai.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {notes.map((n) => (
            <Card key={n.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-display font-semibold tracking-tight leading-snug">{n.title}</h3>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(n)} aria-label={`Edit catatan ${n.title}`} title="Edit" className={iconBtn}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => remove(n)} aria-label={`Hapus catatan ${n.title}`} title="Hapus" className={cn(iconBtn, 'hover:text-rose-500')}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-light dark:text-muted-dark whitespace-pre-wrap line-clamp-4 flex-1">{n.content || '—'}</p>
              <p className="mt-3 text-[11px] text-dusk font-mono tabular-nums">
                {new Date(n.updatedAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit catatan' : 'Catatan baru'}
        footer={<>
          <Button variant="secondary" onClick={() => setEditing(null)}>Batal</Button>
          <Button onClick={submit} disabled={!editing?.title.trim()}><Lock size={14} /> Simpan terenkripsi</Button>
        </>}>
        <div className="space-y-3">
          <Input autoFocus value={editing?.title || ''} onChange={(e) => setEditing((s) => ({ ...s, title: e.target.value }))} placeholder="Judul…" />
          <Textarea rows={8} value={editing?.content || ''} onChange={(e) => setEditing((s) => ({ ...s, content: e.target.value }))} placeholder="Tulis catatan rahasia…" className="font-mono" />
        </div>
      </Modal>
    </>
  )
}

const iconBtn = 'h-8 w-8 rounded-lg flex items-center justify-center text-dusk hover:bg-black/5 dark:hover:bg-white/5 transition-colors neo-press'