import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { updateProfileInfo } from '../../services/businessService'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { Check } from 'lucide-react'

export default function Profile() {
  const { currentUser, updateDisplayName } = useAuth()
  const { t } = useLanguage()
  const [name, setName] = useState(currentUser.displayName || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateDisplayName(name)
      await updateProfileInfo(currentUser.uid, { name, email: currentUser.email })
      setSaved(true)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl">
      <Card title={t('profile.yourProfile')}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label={t('profile.fullName')} value={name} onChange={(e) => { setName(e.target.value); setSaved(false) }} />
          <Input label={t('profile.email')} value={currentUser.email} disabled className="opacity-60 cursor-not-allowed" />
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={saving}>{t('profile.saveProfile')}</Button>
            {saved && <span className="text-xs text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> {t('profile.saved')}</span>}
          </div>
        </form>
      </Card>
    </div>
  )
}
