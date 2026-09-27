import { useEffect, useState } from 'react'
import { Modal, Button, Input, Select, Textarea } from '@/components/ui'
import { categoriesFor } from '@/lib/financeCategories'
import { cn } from '@/lib/utils'

const empty = {
  type: 'expense',
  category: 'makanan',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  note: '',
}

export default function TransactionFormModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    if (!initial) { setForm(empty); return }
    setForm({ ...empty, ...initial, date: (initial.date || new Date().toISOString()).slice(0, 10), amount: String(initial.amount ?? '') })
  }, [initial, open])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const setType = (type) => setForm((f) => ({ ...f, type, category: categoriesFor(type)[0].value }))

  const submit = (e) => {
    e.preventDefault()
    const amountNum = Number(form.amount)
    if (!amountNum || amountNum <= 0 || !form.date) return
    const dateIso = new Date(`${form.date}T${initial ? new Date(initial.date).toTimeString().slice(0, 8) : new Date().toTimeString().slice(0, 8)}`).toISOString()
    onSubmit({ ...form, amount: amountNum, date: dateIso })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit transaksi' : 'Tambah transaksi'}
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button onClick={submit}>{initial ? 'Simpan' : 'Tambah'}</Button></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={cn('flex-1 h-10 rounded-md text-sm font-semibold border transition-colors',
              form.type === 'expense'
                ? 'bg-rose-500/12 border-rose-500/50 text-rose-700 dark:text-rose-300'
                : 'border-[color:var(--line)] text-muted-light dark:text-muted-dark hover:border-[color:var(--line-strong)]')}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={cn('flex-1 h-10 rounded-md text-sm font-semibold border transition-colors',
              form.type === 'income'
                ? 'bg-teal-500/12 border-teal-500/50 text-teal-700 dark:text-teal-300'
                : 'border-[color:var(--line)] text-muted-light dark:text-muted-dark hover:border-[color:var(--line-strong)]')}
          >
            Pemasukan
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Jumlah (Rp)</label>
            <Input type="number" min="1" autoFocus value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="cth. 50000" required />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Tanggal</label>
            <Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} max={new Date().toISOString().slice(0, 10)} required />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Kategori</label>
          <Select value={form.category} onChange={(e) => set('category', e.target.value)}>
            {categoriesFor(form.type).map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Catatan <span className="opacity-60 font-normal">(opsional)</span></label>
          <Textarea rows={2} value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="cth. Makan siang bareng tim" />
        </div>
      </form>
    </Modal>
  )
}
