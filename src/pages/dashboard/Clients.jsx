import { useEffect, useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { listClients, createClient, updateClient, deleteClient } from '../../services/clientService'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Loader from '../../components/ui/Loader'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import ClientForm from '../../components/clients/ClientForm'
import ClientTable from '../../components/clients/ClientTable'

export default function Clients() {
  const { currentUser } = useAuth()
  const { t } = useLanguage()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setClients(await listClients(currentUser.uid))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [currentUser.uid])

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(client) { setEditing(client); setModalOpen(true) }

  async function handleSubmit(data) {
    setSubmitting(true)
    try {
      if (editing) {
        await updateClient(editing.id, data)
      } else {
        await createClient(currentUser.uid, data)
      }
      setModalOpen(false)
      await load()
    } catch (e) {
      alert(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteConfirm() {
    if (!deleting) return
    try {
      await deleteClient(deleting.id)
      setDeleting(null)
      await load()
    } catch (e) {
      alert(e.message)
    }
  }

  if (loading) return <Loader full />
  if (error) return <ErrorState message={error} onRetry={load} />

  const countLabel = t(clients.length === 1 ? 'clients.countOne' : 'clients.countOther', { count: clients.length })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{countLabel}</p>
        <Button icon={Plus} onClick={openCreate}>{t('clients.addClient')}</Button>
      </div>

      <Card>
        {clients.length === 0 ? (
          <EmptyState
            icon={Users}
            title={t('clients.noClientsYet')}
            description={t('clients.noClientsDesc')}
            action={<Button icon={Plus} onClick={openCreate}>{t('clients.addClient')}</Button>}
          />
        ) : (
          <ClientTable clients={clients} onEdit={openEdit} onDelete={setDeleting} />
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('clients.editClient') : t('clients.addClient')}>
        <ClientForm initial={editing} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} submitting={submitting} />
      </Modal>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={t('clients.deleteTitle')}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)}>{t('clients.cancel')}</Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>{t('clients.delete')}</Button>
          </>
        )}
      >
        <p className="text-sm text-slate-600">
          {t('clients.deleteBody', { name: deleting?.name })}
        </p>
      </Modal>
    </div>
  )
}
