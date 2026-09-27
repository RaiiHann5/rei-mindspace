import { id as idLocale } from 'date-fns/locale'
import { format } from 'date-fns'
import { AlertTriangle } from 'lucide-react'
import { Modal, Button } from '@/components/ui'

export default function DeleteJournalModal({ entry, onCancel, onConfirm, isDeleting }) {
  return (
    <Modal open={!!entry} onClose={onCancel} title="Hapus entri jurnal?" size="sm">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 shrink-0 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <AlertTriangle size={16} />
        </div>
        <p className="text-sm text-muted-light dark:text-muted-dark">
          Entri jurnal untuk{' '}
          <span className="font-semibold text-ink-light dark:text-ink-dark capitalize">
            {entry ? format(new Date(entry.date), 'EEEE, d MMMM yyyy', { locale: idLocale }) : ''}
          </span>{' '}
          akan dihapus permanen dan tidak bisa dikembalikan.
        </p>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="secondary" size="sm" onClick={onCancel}>Batal</Button>
        <Button variant="danger" size="sm" onClick={onConfirm} loading={isDeleting}>Hapus</Button>
      </div>
    </Modal>
  )
}
