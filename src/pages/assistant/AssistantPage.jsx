import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Send, Loader2, Trash2, Settings as SettingsIcon, AlertCircle, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageHeader, Card, Button, Textarea, Switch } from '@/components/ui'
import { useAssistantStore } from '@/store/useAssistantStore'
import { askGemini, GeminiError } from '@/lib/gemini'
import { buildContextSummary } from '@/lib/assistantContext'
import { filesToAttachments, humanFileSize, MAX_ATTACHMENTS, ACCEPTED_TYPES } from '@/lib/attachments'
import { cn, uid } from '@/lib/utils'

const SYSTEM_PROMPT = `Kamu adalah asisten produktivitas pribadi di dalam aplikasi bernama Meridian.
Jawab singkat, praktis, dan actionable dalam Bahasa Indonesia (kecuali diminta bahasa lain).
Kamu boleh menjawab pertanyaan apa saja, tidak harus soal produktivitas.
Jika diberi ringkasan data pengguna, gunakan itu untuk memberi saran yang relevan dan spesifik saat relevan — jangan mengarang data yang tidak ada di ringkasan.
Kamu bisa menerima lampiran gambar, PDF, atau file teks dari pengguna — analisis isinya kalau relevan dengan pertanyaan.`

const QUICK_ACTIONS = [
  'Ringkas apa yang paling penting buat gue kerjain hari ini.',
  'Bantu breakdown project yang paling belum jalan jadi langkah-langkah kecil.',
  'Kasih saran biar streak habit gue nggak putus.',
  'Lihat goal gue, mana yang butuh perhatian minggu ini?',
]

function AttachmentThumb({ a, onRemove }) {
  const isImage = a.mimeType?.startsWith('image/')
  return (
    <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center shrink-0 group">
      {isImage && a.data ? (
        <img src={`data:${a.mimeType};base64,${a.data}`} alt={a.name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-1 px-1">
          <FileText size={16} className="text-muted-light dark:text-muted-dark" />
          <span className="text-[9px] text-center leading-tight line-clamp-2 text-muted-light dark:text-muted-dark">{a.name}</span>
        </div>
      )}
      {onRemove && (
        <button onClick={onRemove} className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-black/60 text-white flex items-center justify-center">
          <X size={9} />
        </button>
      )}
    </div>
  )
}

export default function AssistantPage() {
  const { apiKey, model, messages, includeContext, addMessage, clearMessages, setIncludeContext } = useAssistantStore()
  const [input, setInput] = useState('')
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef()
  const fileRef = useRef()

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const onPickFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (pending.length + files.length > MAX_ATTACHMENTS) {
      toast.error(`Maksimal ${MAX_ATTACHMENTS} lampiran per pesan`)
      return
    }
    const { accepted, rejected } = await filesToAttachments(files)
    rejected.forEach((r) => toast.error(`${r.file.name}: ${r.reason}`))
    setPending((p) => [...p, ...accepted])
  }

  const removePending = (idx) => setPending((p) => p.filter((_, i) => i !== idx))

  const send = async (text) => {
    const content = (text ?? input).trim()
    if ((!content && pending.length === 0) || loading) return
    if (!apiKey) {
      toast.error('Tambahkan Gemini API key dulu di Settings')
      return
    }
    const userMsg = { id: uid(), role: 'user', text: content, attachments: pending, createdAt: new Date().toISOString() }
    addMessage(userMsg)
    setInput('')
    setPending([])
    setLoading(true)
    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, text: m.text, attachments: m.attachments }))
      const contextSummary = includeContext ? await buildContextSummary() : null
      const reply = await askGemini({
        apiKey,
        model,
        systemInstruction: contextSummary ? `${SYSTEM_PROMPT}\n\nRingkasan data pengguna saat ini:\n${contextSummary}` : SYSTEM_PROMPT,
        history,
      })
      addMessage({ id: uid(), role: 'assistant', text: reply, createdAt: new Date().toISOString() })
    } catch (err) {
      const msg = err instanceof GeminiError ? err.message : 'Terjadi kesalahan saat menghubungi Gemini.'
      addMessage({ id: uid(), role: 'assistant', text: `⚠️ ${msg}`, createdAt: new Date().toISOString(), isError: true })
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageHeader
        title="AI Assistant"
        description="Ditenagai Gemini — bisa dilampiri gambar/file, dan tahu konteks task, project, habit, goal kamu."
        actions={<>
          {messages.length > 0 && <Button variant="secondary" size="sm" onClick={clearMessages}><Trash2 size={14} /> Bersihkan chat</Button>}
          <Link to="/settings"><Button variant="secondary" size="sm"><SettingsIcon size={14} /> Atur API key</Button></Link>
        </>}
      />

      {!apiKey && (
        <Card className="mb-4 flex items-center gap-3 border-amber-500/30">
          <AlertCircle size={18} className="text-amber-500 shrink-0" />
          <p className="text-sm">
            Belum ada Gemini API key. Buka <Link to="/settings" className="text-primary-500 font-medium">Settings → AI Assistant</Link> untuk menambahkannya (gratis, ambil dari Google AI Studio).
          </p>
        </Card>
      )}

      <div className="flex items-center justify-end gap-2 mb-2">
        <span className="text-xs text-muted-light dark:text-muted-dark">Sertakan konteks produktivitas</span>
        <Switch checked={includeContext} onChange={setIncludeContext} />
      </div>

      <Card className="flex-1 flex flex-col min-h-0 !p-0">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <div className="h-12 w-12 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center mb-3">
                <Sparkles size={22} />
              </div>
              <h3 className="font-display font-semibold mb-1">Tanya apa saja, atau lampirkan gambar/file</h3>
              <p className="text-sm text-muted-light dark:text-muted-dark max-w-sm mb-5">Nggak harus soal produktivitas — bisa juga minta bantu baca screenshot, ringkas PDF, atau apapun. Coba salah satu di bawah ini.</p>
              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                {QUICK_ACTIONS.map((q) => (
                  <button key={q} onClick={() => send(q)} className="text-xs px-3 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-300 transition-colors text-left">{q}</button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                  m.role === 'user' ? 'bg-primary-500 text-white rounded-br-md' : m.isError ? 'bg-rose-500/10 text-rose-500 rounded-bl-md' : 'bg-black/[0.05] dark:bg-white/[0.07] rounded-bl-md'
                )}>
                  {m.attachments?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {m.attachments.map((a, i) => a.data ? (
                        <AttachmentThumb key={i} a={a} />
                      ) : (
                        <span key={i} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-black/10 dark:bg-white/15">
                          {a.mimeType?.startsWith('image/') ? <ImageIcon size={11} /> : <FileText size={11} />} {a.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md px-4 py-2.5 bg-black/[0.05] dark:bg-white/[0.07] flex items-center gap-2 text-sm text-muted-light dark:text-muted-dark">
                <Loader2 size={14} className="animate-spin" /> Berpikir...
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border-light dark:border-border-dark p-3 shrink-0">
          {pending.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {pending.map((a, i) => (
                <div key={i}>
                  <AttachmentThumb a={a} onRemove={() => removePending(i)} />
                  <p className="text-[9px] text-muted-light dark:text-muted-dark mt-0.5 w-16 truncate">{humanFileSize(a.size)}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
            <input ref={fileRef} type="file" multiple accept={ACCEPTED_TYPES.join(',')} className="hidden" onChange={onPickFiles} />
            <Button variant="secondary" size="icon" type="button" onClick={() => fileRef.current?.click()} title="Lampirkan gambar/file">
              <Paperclip size={16} />
            </Button>
            <Textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Tulis pesan... (Enter untuk kirim, Shift+Enter baris baru)"
              className="flex-1 max-h-32"
            />
            <Button size="icon" onClick={() => send()} disabled={loading || (!input.trim() && pending.length === 0)}><Send size={16} /></Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
