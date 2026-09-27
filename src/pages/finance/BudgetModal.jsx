import { useEffect, useState } from 'react'
import { Modal, Button, Input } from '@/components/ui'
import { EXPENSE_CATEGORIES } from '@/lib/financeCategories'
import { cn } from '@/lib/utils'

export default function BudgetModal({ open, onClose, budgets, onSave }) {
  const [limits, setLimits] = useState({})

  useEffect(() => {
    if (!open) return
    const map = {}
    EXPENSE_CATEGORIES.forEach((c) => {
      const existing = budgets.find((b) => b.category === c.value)
      map[c.value] = existing ? String(existing.limit) : ''
    })
    setLimits(map)
  }, [open, budgets])

  const set = (category, v) => setLimits((m) => ({ ...m, [category]: v }))

  const submit = (e) => {
    e.preventDefault()
    onSave(
      Object.entries(limits)
        .filter(([, v]) => v !== '' && Number(v) > 0)
        .map(([category, v]) => ({ category, limit: Number(v) }))
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Atur anggaran bulanan"
      footer={<><Button variant="secondary" onClick={onClose}>Batal</Button><Button onClick={submit}>Simpan Anggaran</Button></>}
    >
      <form onSubmit={submit} className="space-y-3">
        <p className="text-xs text-muted-light dark:text-muted-dark -mt-1 mb-2">
          Kategori kosong tidak dibatasi.
        </p>
        {EXPENSE_CATEGORIES.map((c) => (
          <div key={c.value} className="flex items-center gap-3">
            <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-black/[0.05] dark:bg-white/[0.07]')}>
              <c.icon size={15} />
            </div>
            <label className="text-sm font-medium flex-1">{c.label}</label>
            <Input
              type="number"
              min="0"
              placeholder="Rp 0"
              value={limits[c.value] || ''}
              onChange={(e) => set(c.value, e.target.value)}
              className="w-36 h-9 text-sm"
            />
          </div>
        ))}
      </form>
    </Modal>
  )
}
