import { useState } from 'react'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'
import { useLanguage } from '../../contexts/LanguageContext'

export default function ClientForm({ initial, onSubmit, onCancel, submitting }) {
  const { t } = useLanguage()
  const [form, setForm] = useState({
    name: initial?.name || '',
    company: initial?.company || '',
    email: initial?.email || '',
    phone: initial?.phone || '',
    address: initial?.address || '',
  })

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label={t('clientForm.clientName')} required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="John Doe" />
      <Input label={t('clientForm.companyName')} value={form.company} onChange={(e) => update('company', e.target.value)} placeholder="Acme Inc." />
      <div className="grid grid-cols-2 gap-4">
        <Input label={t('clientForm.email')} type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="client@email.com" />
        <Input label={t('clientForm.phone')} value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+62 812 0000 0000" />
      </div>
      <Textarea label={t('clientForm.address')} rows={3} value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Street, City, Country" />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>{t('clientForm.cancel')}</Button>
        <Button type="submit" loading={submitting}>{initial ? t('clientForm.saveChanges') : t('clientForm.addClient')}</Button>
      </div>
    </form>
  )
}
