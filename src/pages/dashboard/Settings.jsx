import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { getUserData, updateBusinessInfo } from '../../services/businessService'
import { uploadBusinessLogo, uploadQrisImage } from '../../services/storageService'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import { CURRENCIES } from '../../utils/formatCurrency'
import { UploadCloud, Check, QrCode, X } from 'lucide-react'

export default function Settings() {
  const { currentUser } = useAuth()
  const { t } = useLanguage()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingQris, setUploadingQris] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const data = await getUserData(currentUser.uid)
      setForm(data?.business || {
        businessName: '', logoUrl: '', ownerName: '', email: '', phone: '', address: '', defaultCurrency: 'USD', paymentInfo: '', qrisUrl: '',
      })
      setLoading(false)
    }
    load()
  }, [currentUser.uid])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setSaved(false)
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadBusinessLogo(currentUser.uid, file)
      update('logoUrl', url)
    } catch (err) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleQrisUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingQris(true)
    try {
      const url = await uploadQrisImage(currentUser.uid, file)
      update('qrisUrl', url)
    } catch (err) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploadingQris(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateBusinessInfo(currentUser.uid, form)
      setSaved(true)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !form) return <Loader full />

  return (
    <form onSubmit={handleSave} className="max-w-2xl space-y-6">
      <Card title={t('settings.businessProfile')} subtitle={t('settings.businessProfileSubtitle')}>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
            {form.logoUrl ? <img src={form.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <UploadCloud className="w-6 h-6 text-slate-400" />}
          </div>
          <div>
            <label className="btn-secondary cursor-pointer text-xs">
              {uploading ? t('settings.uploading') : t('settings.uploadLogo')}
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
            </label>
            <p className="text-xs text-slate-400 mt-1.5">{t('settings.logoHelp')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input label={t('settings.businessName')} value={form.businessName} onChange={(e) => update('businessName', e.target.value)} />
          <Input label={t('settings.ownerName')} value={form.ownerName} onChange={(e) => update('ownerName', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('settings.email')} type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
            <Input label={t('settings.phone')} value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          </div>
          <Textarea label={t('settings.address')} rows={2} value={form.address} onChange={(e) => update('address', e.target.value)} />
          <Select label={t('settings.defaultCurrency')} value={form.defaultCurrency} onChange={(e) => update('defaultCurrency', e.target.value)} options={CURRENCIES} />
        </div>
      </Card>

      <Card title={t('settings.paymentInformation')} subtitle={t('settings.paymentInfoSubtitle')}>
        <Textarea rows={4} value={form.paymentInfo} onChange={(e) => update('paymentInfo', e.target.value)} placeholder={t('settings.paymentInfoPlaceholder')} />

        <div className="mt-5 pt-5 border-t border-slate-100">
          <p className="text-sm font-medium text-slate-900 mb-3">{t('settings.qrisCode')}</p>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
              {form.qrisUrl ? <img src={form.qrisUrl} alt="QRIS" className="w-full h-full object-contain" /> : <QrCode className="w-6 h-6 text-slate-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <label className="btn-secondary cursor-pointer text-xs">
                  {uploadingQris ? t('settings.uploading') : t('settings.qrisUpload')}
                  <input type="file" accept="image/*" className="hidden" onChange={handleQrisUpload} disabled={uploadingQris} />
                </label>
                {form.qrisUrl && (
                  <button type="button" onClick={() => update('qrisUrl', '')} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> {t('settings.qrisRemove')}
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1.5 max-w-sm">{t('settings.qrisHelp')}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={saving}>{t('settings.saveSettings')}</Button>
        {saved && <span className="text-xs text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> {t('settings.saved')}</span>}
      </div>
    </form>
  )
}
