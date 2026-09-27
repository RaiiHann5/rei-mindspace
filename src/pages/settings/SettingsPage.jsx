import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Download, Upload, Trash2, LogOut, CheckCircle2, AlertCircle, User, Bell, BookOpen, Sparkles, ExternalLink, Eye, EyeOff, Radio, Pipette, Plus, X, Play, Square, Languages, Mic, VolumeX, ImagePlus, Loader2 } from 'lucide-react'
import { PageHeader, Card, Button, Input, Switch, Avatar, Tabs, Select } from '@/components/ui'
import { useAuthStore } from '@/store/useAuthStore'
import { useThemeStore, applyTheme, ACCENT_PRESETS, GRADIENT_PRESETS } from '@/store/useThemeStore'
import { storeImage } from '@/lib/image'
import { useAssistantStore } from '@/store/useAssistantStore'
import { PROVIDER_LIST, buildCustomProviderConfig } from '@/lib/providers'
import { getVoices, onVoicesChanged, speak, stopSpeaking, isSpeechSupported, OPENAI_TTS_VOICES, GOOGLE_TTS_VOICES } from '@/lib/tts'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { exportBackup, importBackup, normalizeBackup, BACKUP_COLLECTIONS } from '@/lib/backup'
import { dataService } from '@/lib/dataService'
import { cn } from '@/lib/utils'
import SettingsNotifications from './SettingsNotifications'
import SettingsGuide from './SettingsGuide'


const TABS = [
  { value: 'general', label: 'General', icon: User },
  { value: 'notifications', label: 'Notifikasi', icon: Bell },
  { value: 'guide', label: 'Panduan', icon: BookOpen },
]

const REPLY_LANGUAGE_PRESETS = [
  { value: 'auto', label: 'Otomatis — ikuti bahasa pengguna' },
  { value: 'Bahasa Indonesia', label: 'Bahasa Indonesia' },
  { value: 'English', label: 'English' },
  { value: 'Bahasa Melayu', label: 'Bahasa Melayu' },
  { value: '日本語 (Japanese)', label: '日本語 — Japanese' },
  { value: '한국어 (Korean)', label: '한국어 — Korean' },
  { value: 'custom', label: 'Custom (ketik sendiri)' },
]

// One row per AI provider: enable/disable switch, API key, model picker, and
// a "pakai ini" indicator for which provider is currently active in the chat.
function ProviderRow({ provider, state, isActive, showKey, onToggleShowKey, onKeyChange, onModelChange, onEnabledChange, onMakeActive, customModels, onAddCustomModel, onRemoveCustomModel, onRemoveProvider }) {
  // Defensive fallback: `state` should always exist (see the store's
  // `merge`/migration backfill), but never crash the whole settings page
  // over one row if it somehow doesn't.
  const safeState = state || { apiKey: '', model: provider.defaultModel, enabled: false }
  return (
    <div className={cn('rounded-xl border p-3.5 transition-colors', safeState.enabled ? 'border-primary-500/30 bg-primary-500/[0.03]' : 'border-border-light dark:border-border-dark')}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm">{provider.label}</h4>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-muted-light dark:text-muted-dark">{provider.tagline}</span>
            {isActive && (
              <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-primary-500/15 text-primary-600 dark:text-primary-400 font-medium">
                <Radio size={9} /> Aktif dipakai
              </span>
            )}
          </div>
          <p className="text-xs text-muted-light dark:text-muted-dark mt-1 break-all">{provider.blurb}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Switch checked={safeState.enabled} onChange={onEnabledChange} />
          {onRemoveProvider && (
            <button type="button" onClick={onRemoveProvider} title="Hapus provider ini" className="h-6 w-6 flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-rose-500">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {safeState.enabled && (
        <div className="space-y-2.5 animate-fade-in">
          <div>
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">API key{provider.isCustom ? ' (opsional)' : ''}</label>
            <div className="relative">
              <Input
                type={showKey ? 'text' : 'password'}
                value={safeState.apiKey}
                onChange={(e) => onKeyChange(e.target.value)}
                placeholder={provider.keyPlaceholder}
                className="pr-10"
              />
              <button type="button" onClick={onToggleShowKey} className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center text-muted-light dark:text-muted-dark">
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {provider.keyUrl && (
              <a href={provider.keyUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1 mt-1.5 w-fit">
                Ambil API key gratis <ExternalLink size={11} />
              </a>
            )}
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Model</label>
              <div className="flex items-center gap-1.5">
                <Input
                  list={`${provider.id}-models`}
                  value={safeState.model}
                  onChange={(e) => onModelChange(e.target.value)}
                  placeholder={provider.defaultModel}
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  type="button"
                  className="h-9 w-9 shrink-0"
                  onClick={() => onAddCustomModel(safeState.model)}
                  disabled={!safeState.model?.trim() || customModels.includes(safeState.model.trim())}
                  title="Simpan sebagai pilihan tetap di dropdown"
                  aria-label="Simpan model ke daftar pilihan"
                >
                  <Plus size={14} />
                </Button>
              </div>
              <datalist id={`${provider.id}-models`}>
                {provider.models.map((m) => <option key={m} value={m} />)}
                {customModels.map((m) => <option key={m} value={m} />)}
              </datalist>
              {customModels.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {customModels.map((m) => (
                    <span key={m} className={cn(
                      'flex items-center gap-1 text-[11px] pl-2.5 pr-1.5 py-1 rounded-full bg-black/[0.05] dark:bg-white/[0.08]',
                      safeState.model === m && 'bg-primary-500/15 text-primary-600 dark:text-primary-300'
                    )}>
                      <button type="button" onClick={() => onModelChange(m)} className="font-medium">{m}</button>
                      <button type="button" onClick={() => onRemoveCustomModel(m)} className="h-3.5 w-3.5 flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-rose-500">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-muted-light dark:text-muted-dark mt-1">
                {provider.docsUrl
                  ? <>Ketik nama model bebas kalau yang kamu mau nggak ada di saran, lalu klik <Plus size={9} className="inline" /> untuk menyimpannya sebagai pilihan tetap di dropdown ini. Cek nama terbaru di <a href={provider.docsUrl} target="_blank" rel="noreferrer" className="text-primary-600 dark:text-primary-400">dokumentasi model {provider.label}</a>.</>
                  : <>Ketik nama model persis seperti yang dikenal server kamu (mis. nama model di Ollama), lalu klik <Plus size={9} className="inline" /> untuk menyimpannya sebagai pilihan tetap.</>}
              </p>
            </div>
            {!isActive && (
              <Button variant="secondary" size="sm" onClick={onMakeActive} disabled={provider.isCustom ? !provider.baseURL : !safeState.apiKey}>Pakai ini</Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Form for adding a new self-hosted/custom OpenAI-compatible provider —
// Ollama, vLLM, LM Studio, a personal proxy, or anything not in the built-in
// list. Once added it behaves exactly like a built-in provider (shows up as
// a ProviderRow above, selectable everywhere).
function AddCustomProviderForm({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [baseURL, setBaseURL] = useState('')
  const [defaultModel, setDefaultModel] = useState('')
  const [supportsVision, setSupportsVision] = useState(false)

  const reset = () => { setLabel(''); setBaseURL(''); setDefaultModel(''); setSupportsVision(false); setOpen(false) }

  const submit = () => {
    const cleanURL = baseURL.trim().replace(/\/+$/, '')
    if (!cleanURL) { toast.error('Base URL wajib diisi.'); return }
    if (!/^https?:\/\//.test(cleanURL)) { toast.error('Base URL harus mulai dengan http:// atau https://'); return }
    onAdd({ label: label.trim() || 'Custom Provider', baseURL: cleanURL, defaultModel: defaultModel.trim(), supportsVision })
    reset()
    toast.success('Provider custom ditambahkan.')
  }

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)} className="w-full justify-center">
        <Plus size={14} /> Tambah provider custom (self-hosted / lainnya)
      </Button>
    )
  }

  return (
    <div className="rounded-xl border border-dashed border-border-light dark:border-border-dark p-3.5 space-y-2.5 animate-fade-in">
      <div>
        <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Nama</label>
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ollama Lokal" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Base URL (OpenAI-compatible)</label>
        <Input value={baseURL} onChange={(e) => setBaseURL(e.target.value)} placeholder="http://localhost:11434/v1" />
        <p className="text-[11px] text-muted-light dark:text-muted-dark mt-1">Harus endpoint yang punya route <code className="px-1 rounded bg-black/10 dark:bg-white/10">/chat/completions</code> (Ollama, vLLM, LM Studio, dst). Kalau server-nya bukan di localhost, tambahkan domainnya ke connect-src di index.html sebelum deploy, kalau tidak nanti diblokir CSP browser.</p>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Model default</label>
        <Input value={defaultModel} onChange={(e) => setDefaultModel(e.target.value)} placeholder="llama3.1" />
      </div>
      <label className="flex items-center gap-2 text-xs">
        <Switch checked={supportsVision} onChange={setSupportsVision} />
        Model ini mendukung vision (bisa baca gambar)
      </label>
      <div className="flex gap-2 pt-1">
        <Button size="sm" onClick={submit}>Tambahkan</Button>
        <Button variant="secondary" size="sm" onClick={reset}>Batal</Button>
      </div>
    </div>
  )
}

// AI reply language + text-to-speech provider/voice/rate/pitch controls.
// Provider can be the free browser voice, or a remote engine (ElevenLabs,
// OpenAI TTS) for higher-quality/custom voices — each needs its own API key.
function VoiceLanguageSettings() {
  const {
    replyLanguage, setReplyLanguage, voice, setVoice, autoSpeak, setAutoSpeak,
    ttsProvider, setTtsProvider, ttsKeys, setTtsKey,
    elevenLabsVoiceId, setElevenLabsVoiceId, openaiVoice, setOpenaiVoice,
    googleVoice, setGoogleVoice, cambVoiceId, setCambVoiceId,
  } = useAssistantStore()
  const [voices, setVoices] = useState(() => getVoices())
  const [customLang, setCustomLang] = useState(REPLY_LANGUAGE_PRESETS.some((p) => p.value === replyLanguage) ? '' : replyLanguage)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [showElevenKey, setShowElevenKey] = useState(false)
  const [showOpenaiKey, setShowOpenaiKey] = useState(false)
  const [showGoogleKey, setShowGoogleKey] = useState(false)
  const [showCambKey, setShowCambKey] = useState(false)
  const isCustomLang = !REPLY_LANGUAGE_PRESETS.some((p) => p.value === replyLanguage) && replyLanguage !== 'auto'

  useEffect(() => onVoicesChanged(setVoices), [])

  const browserSupported = isSpeechSupported()
  // Remote providers only need their API key filled in — browser support
  // isn't a blocker there.
  const supported = ttsProvider === 'browser' ? browserSupported : true

  const previewVoice = () => {
    if (isPreviewing) {
      stopSpeaking()
      setIsPreviewing(false)
      return
    }
    const text = 'Halo, ini contoh suara asisten AI kamu di Space+.'
    const common = {
      rate: voice.rate,
      onStart: () => setIsPreviewing(true),
      onEnd: () => setIsPreviewing(false),
      onError: (msg) => { setIsPreviewing(false); toast.error(msg) },
    }
    if (ttsProvider === 'elevenlabs') {
      speak(text, { provider: 'elevenlabs', apiKey: ttsKeys.elevenlabs, voiceId: elevenLabsVoiceId, ...common })
    } else if (ttsProvider === 'openai') {
      speak(text, { provider: 'openai', apiKey: ttsKeys.openai, voice: openaiVoice, ...common })
    } else if (ttsProvider === 'google') {
      speak(text, { provider: 'google', apiKey: ttsKeys.google, voiceName: googleVoice, ...common })
    } else if (ttsProvider === 'camb') {
      speak(text, { provider: 'camb', apiKey: ttsKeys.camb, voiceId: cambVoiceId, lang: voice.lang, ...common })
    } else {
      speak(text, { provider: 'browser', ...voice, ...common })
    }
  }

  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">
        <Languages size={16} className="text-primary-600 dark:text-primary-400" />
        <h3 className="font-display font-semibold">Bahasa & Suara AI</h3>
      </div>
      <p className="text-xs text-muted-light dark:text-muted-dark mb-4">
        Atur bahasa balasan teks AI dan suara text-to-speech saat AI membacakan balasannya.
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Bahasa balasan AI</label>
          <Select
            value={isCustomLang ? 'custom' : replyLanguage}
            onChange={(e) => {
              const v = e.target.value
              if (v === 'custom') setReplyLanguage(customLang || 'English')
              else setReplyLanguage(v)
            }}
          >
            {REPLY_LANGUAGE_PRESETS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </Select>
          {(isCustomLang || replyLanguage === 'custom') && (
            <Input
              className="mt-2"
              value={isCustomLang ? replyLanguage : customLang}
              onChange={(e) => { setCustomLang(e.target.value); setReplyLanguage(e.target.value) }}
              placeholder="Contoh: Bahasa Sunda, Français, Español..."
            />
          )}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-border-light dark:border-border-dark">
          <div className="pt-3">
            <p className="text-sm font-medium">AI bersuara otomatis</p>
            <p className="text-xs text-muted-light dark:text-muted-dark">Setiap balasan AI langsung dibacakan, tanpa perlu klik "Dengarkan" manual</p>
          </div>
          <div className="pt-3"><Switch checked={autoSpeak} onChange={setAutoSpeak} disabled={!supported} /></div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Mesin suara (TTS provider)</label>
          <Select value={ttsProvider} onChange={(e) => setTtsProvider(e.target.value)}>
            <option value="browser">Browser (gratis, instan, bawaan OS)</option>
            <option value="google">Google Cloud TTS (gratis s/d ~4 juta karakter/bulan)</option>
            <option value="camb">Camb.ai TTS</option>
            <option value="elevenlabs">ElevenLabs (custom/clone voice)</option>
            <option value="openai">OpenAI TTS</option>
          </Select>
        </div>

        {ttsProvider === 'browser' && (
          !browserSupported ? (
            <p className="text-xs text-amber-500 flex items-center gap-1.5"><AlertCircle size={13} /> Browser ini tidak mendukung text-to-speech. Coba pakai Chrome atau Edge.</p>
          ) : (
            <>
              <div>
                <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Suara (voice)</label>
                <Select value={voice.voiceURI} onChange={(e) => setVoice({ voiceURI: e.target.value })}>
                  <option value="">Otomatis (ikuti bahasa balasan)</option>
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>{v.name} — {v.lang}</option>
                  ))}
                </Select>
                {voices.length === 0 && <p className="text-[11px] text-muted-light dark:text-muted-dark mt-1">Memuat daftar suara dari browser...</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 flex items-center justify-between">
                  <span>Nada (pitch)</span><span className="text-primary-600 dark:text-primary-400 font-mono">{voice.pitch.toFixed(1)}</span>
                </label>
                <input
                  type="range" min="0" max="2" step="0.1" value={voice.pitch}
                  onChange={(e) => setVoice({ pitch: Number(e.target.value) })}
                  className="w-full accent-primary-500"
                />
              </div>
            </>
          )
        )}

        {ttsProvider === 'elevenlabs' && (
          <div className="space-y-3 animate-fade-in">
            <div>
              <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">ElevenLabs API key</label>
              <div className="relative">
                <Input
                  type={showElevenKey ? 'text' : 'password'}
                  value={ttsKeys.elevenlabs}
                  onChange={(e) => setTtsKey('elevenlabs', e.target.value)}
                  placeholder="sk_..."
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowElevenKey((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center text-muted-light dark:text-muted-dark">
                  {showElevenKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noreferrer" className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1 mt-1.5 w-fit">
                Ambil API key ElevenLabs <ExternalLink size={11} />
              </a>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Voice ID</label>
              <Input
                value={elevenLabsVoiceId}
                onChange={(e) => setElevenLabsVoiceId(e.target.value)}
                placeholder="Contoh: 21m00Tcm4TlvDq8ikWAM"
              />
              <a href="https://elevenlabs.io/app/voice-library" target="_blank" rel="noreferrer" className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1 mt-1.5 w-fit">
                Jelajahi & salin Voice ID dari Voice Library <ExternalLink size={11} />
              </a>
            </div>
          </div>
        )}

        {ttsProvider === 'google' && (
          <div className="space-y-3 animate-fade-in">
            <div>
              <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Google Cloud TTS API key</label>
              <div className="relative">
                <Input
                  type={showGoogleKey ? 'text' : 'password'}
                  value={ttsKeys.google}
                  onChange={(e) => setTtsKey('google', e.target.value)}
                  placeholder="AIza..."
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowGoogleKey((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center text-muted-light dark:text-muted-dark">
                  {showGoogleKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <a href="https://console.cloud.google.com/apis/library/texttospeech.googleapis.com" target="_blank" rel="noreferrer" className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1 mt-1.5 w-fit">
                Aktifkan Text-to-Speech API & ambil API key <ExternalLink size={11} />
              </a>
              <p className="text-[11px] text-muted-light dark:text-muted-dark mt-1">Tier gratis: ~4 juta karakter/bulan untuk suara Standard.</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Suara (voice)</label>
              <Select value={googleVoice} onChange={(e) => setGoogleVoice(e.target.value)}>
                {GOOGLE_TTS_VOICES.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
              </Select>
            </div>
          </div>
        )}

        {ttsProvider === 'camb' && (
          <div className="space-y-3 animate-fade-in">
            <div>
              <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Camb.ai API key</label>
              <div className="relative">
                <Input
                  type={showCambKey ? 'text' : 'password'}
                  value={ttsKeys.camb}
                  onChange={(e) => setTtsKey('camb', e.target.value)}
                  placeholder="camb_..."
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowCambKey((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center text-muted-light dark:text-muted-dark">
                  {showCambKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <a href="https://studio.camb.ai" target="_blank" rel="noreferrer" className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1 mt-1.5 w-fit">
                Ambil API key & jelajahi Voice Library Camb.ai <ExternalLink size={11} />
              </a>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Voice ID</label>
              <Input
                value={cambVoiceId}
                onChange={(e) => setCambVoiceId(e.target.value)}
                placeholder="Contoh: 147320"
              />
              <p className="text-[11px] text-muted-light dark:text-muted-dark mt-1">Voice ID numerik dari Studio Camb.ai → Voice Library.</p>
            </div>
          </div>
        )}

        {ttsProvider === 'openai' && (
          <div className="space-y-3 animate-fade-in">
            <div>
              <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">OpenAI API key</label>
              <div className="relative">
                <Input
                  type={showOpenaiKey ? 'text' : 'password'}
                  value={ttsKeys.openai}
                  onChange={(e) => setTtsKey('openai', e.target.value)}
                  placeholder="sk-..."
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowOpenaiKey((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center text-muted-light dark:text-muted-dark">
                  {showOpenaiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1 mt-1.5 w-fit">
                Ambil API key OpenAI <ExternalLink size={11} />
              </a>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Suara (voice)</label>
              <Select value={openaiVoice} onChange={(e) => setOpenaiVoice(e.target.value)}>
                {OPENAI_TTS_VOICES.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
          </div>
        )}

        {supported && (
          <div>
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 flex items-center justify-between">
              <span>Kecepatan</span><span className="text-primary-600 dark:text-primary-400 font-mono">{voice.rate.toFixed(1)}x</span>
            </label>
            <input
              type="range" min="0.5" max="2" step="0.1" value={voice.rate}
              onChange={(e) => setVoice({ rate: Number(e.target.value) })}
              className="w-full accent-primary-500"
            />
          </div>
        )}

        {supported && (
          <Button variant="secondary" size="sm" onClick={previewVoice}>
            {isPreviewing ? <Square size={13} className="fill-current" /> : <Play size={13} />}
            {isPreviewing ? 'Berhenti' : 'Coba suara ini'}
          </Button>
        )}
      </div>
    </Card>
  )
}

// Toggles for the assistant's two "beyond chat" capabilities — both native
// to Gemini, so both need the Gemini API key filled in above, regardless of
// which provider is the active chat one.
function AiCapabilitiesSettings() {
  const { researchEnabled, setResearchEnabled, providers } = useAssistantStore()
  const hasGeminiKey = Boolean(providers.gemini?.apiKey)

  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} className="text-primary-600 dark:text-primary-400" />
        <h3 className="font-display font-semibold">Kemampuan AI: Riset & Gambar</h3>
      </div>
      <p className="text-xs text-muted-light dark:text-muted-dark mb-4">
        Dua kemampuan tambahan di luar ngobrol biasa — keduanya native dari Gemini API, jadi butuh Gemini API key di atas (walau chat provider aktifmu bukan Gemini).
      </p>

      {!hasGeminiKey && (
        <p className="text-xs text-amber-500 flex items-center gap-1.5 mb-4"><AlertCircle size={13} /> Isi dulu Gemini API key di daftar provider di atas biar dua fitur ini jalan.</p>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">AI bisa riset web</p>
            <p className="text-xs text-muted-light dark:text-muted-dark">Gemini mencari info terkini lewat Google Search lalu sertakan sumbernya. Hanya aktif kalau provider chat yang dipakai adalah Gemini.</p>
          </div>
          <Switch checked={researchEnabled} onChange={setResearchEnabled} />
        </div>

        <div className="pt-3 border-t border-border-light dark:border-border-dark">
          <p className="text-sm font-medium mb-1">AI bisa menggambar</p>
          <p className="text-xs text-muted-light dark:text-muted-dark">
            Selalu aktif — tinggal minta "gambarin..." di chat, dan asisten akan memanggil fungsi generate_image untuk membuat gambar sungguhan, apapun provider chat yang lagi kamu pakai.
          </p>
        </div>
      </div>
    </Card>
  )
}

// While the assistant is talking, listens for a barge-in phrase ("stop",
// "oke", ...) and cuts playback off immediately, so the user doesn't have to
// wait for it to finish before speaking again.
function InterruptSettings() {
  const { interruptEnabled, setInterruptEnabled, interruptPhrases, setInterruptPhrases } = useAssistantStore()
  const [draft, setDraft] = useState(interruptPhrases)
  const recognitionSupported = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

  const commitPhrases = () => {
    const clean = draft.trim()
    setInterruptPhrases(clean || 'stop, oke, okay, berhenti')
    setDraft(clean || 'stop, oke, okay, berhenti')
  }

  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">
        <VolumeX size={16} className="text-primary-600 dark:text-primary-400" />
        <h3 className="font-display font-semibold">Interupsi Suara (Barge-in)</h3>
      </div>
      <p className="text-xs text-muted-light dark:text-muted-dark mb-4">
        Kalau aktif, selama AI lagi bicara, ucapkan salah satu kata di bawah buat langsung motong omongannya — nggak perlu nunggu dia selesai dulu sebelum kamu bisa ngomong lagi.
      </p>

      {!recognitionSupported ? (
        <p className="text-xs text-amber-500 flex items-center gap-1.5"><AlertCircle size={13} /> Browser ini tidak mendukung voice recognition. Coba pakai Chrome atau Edge.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Aktifkan interupsi suara</p>
              <p className="text-xs text-muted-light dark:text-muted-dark">Mic aktif hanya selagi AI sedang bicara</p>
            </div>
            <Switch checked={interruptEnabled} onChange={setInterruptEnabled} />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Kata pemotong (pisahkan dengan koma)</label>
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitPhrases}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitPhrases() } }}
              placeholder="stop, oke, okay, berhenti"
            />
            <p className="text-[11px] text-muted-light dark:text-muted-dark mt-1">
              Ucapkan salah satu — nggak perlu semuanya, dan dicocokkan longgar (boleh di tengah kalimat).
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}

// Background wake-word activation ("Hei, Jarvis" style) — lets the assistant
// listen for a chosen phrase and open + start recording on its own, with no
// click. Runs entirely on the browser's SpeechRecognition, same engine as the
// manual mic button uses.
function WakeWordSettings() {
  const { wakeWordEnabled, setWakeWordEnabled, wakeWord, setWakeWord } = useAssistantStore()
  const [draft, setDraft] = useState(wakeWord)
  const recognitionSupported = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

  const commitPhrase = () => {
    const clean = draft.trim()
    setWakeWord(clean || 'hei jarvis')
    setDraft(clean || 'hei jarvis')
  }

  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">
        <Mic size={16} className="text-primary-600 dark:text-primary-400" />
        <h3 className="font-display font-semibold">Aktivasi Suara (Wake Word)</h3>
      </div>
      <p className="text-xs text-muted-light dark:text-muted-dark mb-4">
        Kalau aktif, asisten dengerin terus di background — begitu kamu ucapkan kata kuncinya, panel langsung kebuka, merekam perintah kamu, dan otomatis mengirimnya begitu kamu selesai bicara. Tidak perlu klik apa pun. Semua diproses di browser, nggak ada audio yang dikirim ke server.
      </p>

      {!recognitionSupported ? (
        <p className="text-xs text-amber-500 flex items-center gap-1.5"><AlertCircle size={13} /> Browser ini tidak mendukung voice recognition. Coba pakai Chrome atau Edge.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Aktifkan wake word</p>
              <p className="text-xs text-muted-light dark:text-muted-dark">Butuh izin microphone selama tab ini terbuka</p>
            </div>
            <Switch checked={wakeWordEnabled} onChange={setWakeWordEnabled} />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-light dark:text-muted-dark mb-1 block">Kata kunci pengaktif</label>
            <div className="flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitPhrase}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitPhrase() } }}
                placeholder="Contoh: hei jarvis"
                className="flex-1"
              />
              <Button variant="secondary" size="sm" onClick={commitPhrase}>Simpan</Button>
            </div>
            <p className="text-[11px] text-muted-light dark:text-muted-dark mt-1">
              Dicocokkan longgar (tidak perlu persis) — cukup ucapkan frasa ini di tengah kalimat.
            </p>
          </div>

          <p className="text-[11px] text-muted-light dark:text-muted-dark">
            Tips: nyalain juga "AI bersuara otomatis" di atas biar balasannya kebaca keras — jadinya obrolan dua arah tanpa sentuh layar sama sekali. Wake word hanya jalan selagi tab ini terbuka di foreground.
          </p>
        </div>
      )}
    </Card>
  )
}

export default function SettingsPage() {
  const { user, updateProfile, isLocalMode } = useAuthStore()
  const { theme, setTheme, accent, setAccent, customHex, setCustomHex } = useThemeStore()
  const {
    providers, activeProvider, setActiveProvider,
    setProviderKey, setProviderModel, setProviderEnabled,
    customModels, addCustomModel, removeCustomModel,
    customProviders, addCustomProvider, removeCustomProvider,
  } = useAssistantStore()
  const [visibleKeys, setVisibleKeys] = useState({})
  const fileRef = useRef()
  const avatarFileRef = useRef()
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [tab, setTab] = useState('general')

  const exportData = async () => {
    const toastId = toast.loading('Collecting your data…')
    try {
      const backup = await exportBackup()
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meridian-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      const n = Object.keys(backup.collections).length
      toast.success(`Backup exported — ${n} collections`, { id: toastId })
    } catch {
      toast.error('Export failed — are you signed in?', { id: toastId })
    }
  }

  const importData = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const toastId = toast.loading('Restoring data…')
      try {
        const doc = normalizeBackup(JSON.parse(reader.result))
        const result = await importBackup(doc)
        toast.success(`Restored ${result.items} records across ${result.collections} collections — reloading`, { id: toastId })
        setTimeout(() => window.location.reload(), 800)
      } catch {
        toast.error('Invalid or incompatible backup file', { id: toastId })
      }
    }
    reader.readAsText(file)
  }

  const resetData = async () => {
    if (!confirm('This will erase all your data and restore the demo content. Continue?')) return
    const toastId = toast.loading('Clearing data…')
    try {
      if (isSupabaseConfigured) {
        for (const name of BACKUP_COLLECTIONS) await dataService.setAll(name, [])
      } else {
        Object.keys(localStorage).filter((k) => k.startsWith('meridian_os_v1')).forEach((k) => localStorage.removeItem(k))
      }
      toast.success('All data cleared', { id: toastId })
    } catch {
      toast.error('Reset failed', { id: toastId })
    }
    setTimeout(() => window.location.reload(), 600)
  }

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('File harus berupa gambar.'); return }
    setUploadingAvatar(true)
    try {
      const url = await storeImage(file, 'avatars')
      await handleProfileUpdate({ photoURL: url })
      toast.success('Foto profil diperbarui.')
    } catch (err) {
      toast.error(err?.message || 'Gagal upload foto.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
  }

  // Local zustand update for instant UI feedback; also persisted to
  // Supabase Auth's user metadata when connected so it survives reloads
  // and other devices, not just this browser.
  const handleProfileUpdate = async (patch) => {
    updateProfile(patch)
    if (isSupabaseConfigured) {
      const authPatch = {}
      if ('displayName' in patch) authPatch.display_name = patch.displayName
      if ('photoURL' in patch) authPatch.avatar_url = patch.photoURL
      await supabase.auth.updateUser({ data: authPatch })
    }
  }

  return (
    // Settings spans the full content width. The tab strip is a sticky rail on
    // the left (a real Settings layout, and it stops the form from being
    // marooned in an 768px column with half the viewport empty beside it),
    // collapsing to a horizontal strip on narrow screens.
    <div className="w-full">
      <PageHeader title="Settings" description="Your profile, theme, notifications, and data." />

      <div className="grid lg:grid-cols-[212px_1fr] xl:grid-cols-[240px_1fr] gap-6 lg:gap-8 items-start">
        <div className="lg:sticky lg:top-24">
          <div className="hidden lg:block">
            <nav className="flex flex-col gap-1">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTab(t.value)}
                  className={cn(
                    'flex items-center gap-3 h-10 px-3 rounded-md text-sm font-medium transition-colors text-left',
                    tab === t.value
                      ? 'ember-rail bg-primary-500/10 text-ink-light dark:text-ink-dark'
                      : 'text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                  )}
                >
                  <t.icon size={17} strokeWidth={tab === t.value ? 2.3 : 2} className="shrink-0" />
                  <span className="truncate">{t.label}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="lg:hidden">
            <Tabs tabs={TABS} active={tab} onChange={setTab} className="flex-wrap" />
          </div>
        </div>

        <div className="min-w-0">
      {tab === 'general' && (
        <div className="space-y-4">
      <Card>
        <h3 className="font-display font-semibold mb-4">Profile</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative shrink-0">
            <Avatar name={user?.displayName || 'You'} src={user?.photoURL} size={56} />
            <button
              type="button"
              onClick={() => avatarFileRef.current?.click()}
              disabled={uploadingAvatar}
              title="Ganti foto dari perangkat"
              className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-accent-gradient text-accent-ink flex items-center justify-center disabled:opacity-60 transition-transform hover:brightness-110"
            >
              {uploadingAvatar ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={12} />}
            </button>
            <input ref={avatarFileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
          </div>
          <div className="flex-1 space-y-2">
            <Input value={user?.displayName || ''} onChange={(e) => handleProfileUpdate({ displayName: e.target.value })} placeholder="Display name" />
            <Input value={user?.email || ''} disabled placeholder="Email" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => avatarFileRef.current?.click()} disabled={uploadingAvatar}>
            {uploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />} Upload foto
          </Button>
          {user?.photoURL && (
            <Button variant="ghost" size="sm" onClick={() => handleProfileUpdate({ photoURL: '' })}>Hapus foto</Button>
          )}
        </div>
        <label className="text-xs font-medium text-muted-light dark:text-muted-dark mt-3 mb-1 block">Atau pakai URL gambar</label>
        <Input
          value={user?.photoURL || ''}
          onChange={(e) => handleProfileUpdate({ photoURL: e.target.value })}
          placeholder="https://contoh.com/foto.jpg"
        />
        <p className="text-[11px] text-muted-light dark:text-muted-dark mt-1.5">
          Pastikan link-nya adalah link gambar langsung (berakhiran .jpg/.png/dll), bukan link halaman web. Kalau fotonya nggak muncul, biasanya itu sebabnya — coba klik kanan gambar aslinya lalu pilih "Copy image address".
        </p>
      </Card>

      <Card>
        <h3 className="font-display font-semibold mb-4">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-muted-light dark:text-muted-dark">Night console is the default. Light inverts it into a calm paper workspace.</p>
          </div>
          <div className="flex gap-1 p-1 rounded-lg bg-black/[0.04] dark:bg-white/[0.06]">
            {['dark', 'light', 'system'].map((t) => (
              <button
                key={t}
                onClick={() => { setTheme(t); setTimeout(applyTheme, 0) }}
                className={cn(
                  'px-3 h-8 rounded-md text-xs font-medium capitalize transition-colors',
                  theme === t
                    ? 'bg-surface-light dark:bg-panel2-dark text-ink-light dark:text-ink-dark shadow-soft'
                    : 'text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-[color:var(--line)]">
          <p className="text-sm font-medium mb-1">Accent</p>
          <p className="text-xs text-muted-light dark:text-muted-dark mb-3 max-w-[62ch]">
            Ember is the Space+ signature — the single warm glow reserved for your
            primary action, the active nav, and one hero number per screen. Swap it
            if you like; the canvas, panels, and text stay as they are.
          </p>
          <p className="text-xs text-muted-light dark:text-muted-dark mb-2.5">Gradients</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {GRADIENT_PRESETS.map((g) => (
              <button
                key={g.id}
                onClick={() => { setAccent(g.id); setTimeout(applyTheme, 0) }}
                title={g.label}
                className={cn(
                  'h-9 w-9 rounded-full flex items-center justify-center transition-transform hover:scale-105',
                  accent === g.id && 'ring-2 ring-ember-500/50 ring-offset-2 ring-offset-[color:var(--color-canvas-light)] dark:ring-offset-[color:var(--color-canvas-dark)]'
                )}
                style={{ backgroundImage: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
              >
                {accent === g.id && <CheckCircle2 size={16} className="text-white" />}
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-light dark:text-muted-dark mb-2.5">Solid colors</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {ACCENT_PRESETS.map((a) => (
              <button
                key={a.id}
                onClick={() => { setAccent(a.id); setTimeout(applyTheme, 0) }}
                title={a.label}
                className={cn(
                  'h-9 w-9 rounded-full flex items-center justify-center transition-transform hover:scale-105',
                  accent === a.id && 'ring-2 ring-ember-500/50 ring-offset-2 ring-offset-[color:var(--color-canvas-light)] dark:ring-offset-[color:var(--color-canvas-dark)]'
                )}
                style={{ backgroundColor: a.color }}
              >
                {accent === a.id && <CheckCircle2 size={16} className="text-white" />}
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-light dark:text-muted-dark mb-2.5">Custom — pick any color</p>
          <div className="flex items-center gap-3">
            <label className={cn(
              'relative h-9 w-9 rounded-full overflow-hidden border cursor-pointer flex items-center justify-center transition-transform hover:scale-105',
              accent === 'custom' ? 'border-ember-500' : 'border-transparent'
            )} style={{ backgroundColor: customHex }}>
              <input
                type="color"
                value={customHex}
                onChange={(e) => { setCustomHex(e.target.value); setTimeout(applyTheme, 0) }}
                className="absolute -inset-1 cursor-pointer opacity-0"
              />
              <Pipette size={14} className={accent === 'custom' ? 'text-white' : 'text-white/70'} />
            </label>
            <Input
              value={customHex}
              onChange={(e) => {
                const v = e.target.value
                setCustomHex(v)
                if (/^#[0-9a-fA-F]{6}$/.test(v)) setTimeout(applyTheme, 0)
              }}
              className="w-28 font-mono text-xs uppercase"
              maxLength={7}
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-primary-600 dark:text-primary-400" />
          <h3 className="font-display font-semibold">AI Assistant — {PROVIDER_LIST.length + customProviders.length} provider</h3>
        </div>
        <p className="text-xs text-muted-light dark:text-muted-dark mb-4">
          Aktifkan provider mana pun yang kamu punya API key-nya (semuanya ada free tier), lalu pilih yang mau dipakai di chat lewat dropdown di halaman AI Assistant. Semua key disimpan hanya di browser ini (localStorage) — tidak pernah ikut ter-bundle saat deploy, jadi aman meski di-hosting publik.
        </p>
        <div className="space-y-2.5">
          {PROVIDER_LIST.map((p) => (
            <ProviderRow
              key={p.id}
              provider={p}
              state={providers[p.id]}
              isActive={activeProvider === p.id}
              showKey={!!visibleKeys[p.id]}
              onToggleShowKey={() => setVisibleKeys((v) => ({ ...v, [p.id]: !v[p.id] }))}
              onKeyChange={(v) => setProviderKey(p.id, v)}
              onModelChange={(v) => setProviderModel(p.id, v)}
              onEnabledChange={(v) => setProviderEnabled(p.id, v)}
              onMakeActive={() => setActiveProvider(p.id)}
              customModels={customModels[p.id] || []}
              onAddCustomModel={(v) => addCustomModel(p.id, v)}
              onRemoveCustomModel={(v) => removeCustomModel(p.id, v)}
            />
          ))}
          {customProviders.map((c) => {
            const p = buildCustomProviderConfig(c)
            return (
              <ProviderRow
                key={p.id}
                provider={p}
                state={providers[p.id] || { apiKey: '', model: p.defaultModel, enabled: false }}
                isActive={activeProvider === p.id}
                showKey={!!visibleKeys[p.id]}
                onToggleShowKey={() => setVisibleKeys((v) => ({ ...v, [p.id]: !v[p.id] }))}
                onKeyChange={(v) => setProviderKey(p.id, v)}
                onModelChange={(v) => setProviderModel(p.id, v)}
                onEnabledChange={(v) => setProviderEnabled(p.id, v)}
                onMakeActive={() => setActiveProvider(p.id)}
                customModels={customModels[p.id] || []}
                onAddCustomModel={(v) => addCustomModel(p.id, v)}
                onRemoveCustomModel={(v) => removeCustomModel(p.id, v)}
                onRemoveProvider={() => {
                  removeCustomProvider(p.id)
                  toast.success(`Provider "${p.label}" dihapus.`)
                }}
              />
            )
          })}
          <AddCustomProviderForm onAdd={addCustomProvider} />
        </div>
      </Card>

      <AiCapabilitiesSettings />

      <VoiceLanguageSettings />
      <InterruptSettings />
      <WakeWordSettings />

      <Card>
        <h3 className="font-display font-semibold mb-3">Connection</h3>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.05]">
          {isSupabaseConfigured ? <CheckCircle2 size={18} className="text-teal-500" /> : <AlertCircle size={18} className="text-amber-500" />}
          <div>
            <p className="text-sm font-medium">{isSupabaseConfigured ? 'Connected to Supabase' : 'Running in local mode'}</p>
            <p className="text-xs text-muted-light dark:text-muted-dark">
              {isSupabaseConfigured ? 'Your data syncs to Supabase (Postgres + Auth).' : 'Data is stored in this browser only. Add Supabase keys to .env to sync across devices.'}
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
          {isSupabaseConfigured && <Button variant="secondary" size="sm" onClick={signOut}><LogOut size={14} /> Sign out</Button>}
        </div>
      </Card>
        </div>
      )}

      {tab === 'notifications' && <SettingsNotifications />}
      {tab === 'guide' && <SettingsGuide />}
        </div>
      </div>
    </div>
  )
}