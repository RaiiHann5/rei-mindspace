import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Download, Upload, Trash2, LogOut, CheckCircle2, AlertCircle, User, Bell, BookOpen, Sparkles, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { PageHeader, Card, Button, Input, Avatar, Tabs } from '@/components/ui'
import { useAuthStore } from '@/store/useAuthStore'
import { useThemeStore, applyTheme } from '@/store/useThemeStore'
import { useAssistantStore } from '@/store/useAssistantStore'
import { isFirebaseConfigured, auth } from '@/lib/firebase'
import SettingsNotifications from './SettingsNotifications'
import SettingsGuide from './SettingsGuide'

const ACCENTS = [
  { id: 'primary', color: '#5A4FFF' },
  { id: 'teal', color: '#1EC4B0' },
  { id: 'amber', color: '#F7A331' },
  { id: 'rose', color: '#F4506A' },
]

const TABS = [
  { value: 'general', label: 'General', icon: User },
  { value: 'notifications', label: 'Notifikasi', icon: Bell },
  { value: 'guide', label: 'Panduan', icon: BookOpen },
]

export default function SettingsPage() {
  const { user, updateProfile, isLocalMode } = useAuthStore()
  const { theme, setTheme, accent, setAccent } = useThemeStore()
  const { apiKey, model, setApiKey, setModel } = useAssistantStore()
  const [showKey, setShowKey] = useState(false)
  const fileRef = useRef()
  const [tab, setTab] = useState('general')

  const exportData = () => {
    const data = {}
    Object.keys(localStorage).filter((k) => k.startsWith('meridian_os_v1')).forEach((k) => { data[k] = localStorage.getItem(k) })
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'meridian-backup.json'; a.click()
    URL.revokeObjectURL(url)
    toast.success('Data exported')
  }

  const importData = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v))
        toast.success('Data imported — reloading')
        setTimeout(() => window.location.reload(), 800)
      } catch {
        toast.error('Invalid backup file')
      }
    }
    reader.readAsText(file)
  }

  const resetData = () => {
    if (!confirm('This will erase all local data and restore demo content. Continue?')) return
    Object.keys(localStorage).filter((k) => k.startsWith('meridian_os_v1')).forEach((k) => localStorage.removeItem(k))
    toast.success('Local data reset')
    setTimeout(() => window.location.reload(), 600)
  }

  const signOut = async () => {
    if (isFirebaseConfigured) {
      const { signOut: fbSignOut } = await import('firebase/auth')
      await fbSignOut(auth)
    }
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <PageHeader title="Settings" description="Your profile, theme, notifications, and data." />
      <Tabs tabs={TABS} active={tab} onChange={setTab} className="mb-1" />

      {tab === 'general' && (
        <div className="space-y-4">
      <Card>
        <h3 className="font-display font-semibold mb-4">Profile</h3>
        <div className="flex items-center gap-4 mb-4">
          <Avatar name={user?.displayName || 'You'} src={user?.photoURL} size={56} />
          <div className="flex-1 space-y-2">
            <Input value={user?.displayName || ''} onChange={(e) => updateProfile({ displayName: e.target.value })} placeholder="Display name" />
            <Input value={user?.email || ''} disabled placeholder="Email" />
          </div>
        </div>
        <Input value={user?.photoURL || ''} onChange={(e) => updateProfile({ photoURL: e.target.value })} placeholder="Avatar image URL" />
      </Card>

      <Card>
        <h3 className="font-display font-semibold mb-4">Appearance</h3>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-muted-light dark:text-muted-dark">Choose light, dark, or follow system</p>
          </div>
          <div className="flex gap-1 p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.06]">
            {['light', 'dark', 'system'].map((t) => (
              <button key={t} onClick={() => { setTheme(t); setTimeout(applyTheme, 0) }} className={`px-3 h-8 rounded-lg text-xs font-medium capitalize ${theme === t ? 'bg-white dark:bg-surface-dark shadow-sm' : 'text-muted-light dark:text-muted-dark'}`}>{t}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Accent color</p>
          <div className="flex gap-2">
            {ACCENTS.map((a) => (
              <button key={a.id} onClick={() => { setAccent(a.id); setTimeout(applyTheme, 0) }} className="h-9 w-9 rounded-full flex items-center justify-center" style={{ backgroundColor: a.color }}>
                {accent === a.id && <CheckCircle2 size={16} className="text-white" />}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-primary-500" />
          <h3 className="font-display font-semibold">AI Assistant (Gemini)</h3>
        </div>
        <p className="text-xs text-muted-light dark:text-muted-dark mb-4">
          API key disimpan hanya di browser ini (localStorage) — tidak pernah ikut ter-bundle saat kamu deploy aplikasi ini, jadi aman dipakai meski di-hosting publik.
        </p>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Gemini API key</label>
            <div className="relative">
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza..."
                className="pr-10"
              />
              <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center text-muted-light dark:text-muted-dark">
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-xs text-primary-500 flex items-center gap-1 mt-1.5 w-fit">
              Ambil API key gratis di Google AI Studio <ExternalLink size={11} />
            </a>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Model</label>
            <Input list="gemini-models" value={model} onChange={(e) => setModel(e.target.value)} placeholder="gemini-2.5-flash" />
            <datalist id="gemini-models">
              <option value="gemini-2.5-flash" />
              <option value="gemini-2.5-pro" />
              <option value="gemini-2.5-flash-lite" />
            </datalist>
            <p className="text-xs text-muted-light dark:text-muted-dark mt-1.5">Google kadang merilis model baru dan mempensiunkan yang lama — kalau nama model di atas sudah tidak berlaku, cek nama terbaru di <a href="https://ai.google.dev/gemini-api/docs/models" target="_blank" rel="noreferrer" className="text-primary-500">daftar model Gemini API</a> lalu ketik nama modelnya di sini.</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-display font-semibold mb-3">Connection</h3>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.05]">
          {isFirebaseConfigured ? <CheckCircle2 size={18} className="text-teal-500" /> : <AlertCircle size={18} className="text-amber-500" />}
          <div>
            <p className="text-sm font-medium">{isFirebaseConfigured ? 'Connected to Firebase' : 'Running in local mode'}</p>
            <p className="text-xs text-muted-light dark:text-muted-dark">
              {isFirebaseConfigured ? 'Your data syncs to Firestore and Firebase Auth.' : 'Data is stored in this browser only. Add Firebase keys to .env to sync across devices.'}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-display font-semibold mb-3">Data management</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={exportData}><Download size={14} /> Export backup</Button>
          <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}><Upload size={14} /> Import backup</Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={importData} />
          <Button variant="danger" size="sm" onClick={resetData}><Trash2 size={14} /> Reset all data</Button>
          {isFirebaseConfigured && <Button variant="secondary" size="sm" onClick={signOut}><LogOut size={14} /> Sign out</Button>}
        </div>
      </Card>
        </div>
      )}

      {tab === 'notifications' && <SettingsNotifications />}
      {tab === 'guide' && <SettingsGuide />}
    </div>
  )
}
