// Shared constants + small pure helpers for the Journal page.

export const MOODS = [
  { value: 1, emoji: '😞', label: 'Berat' },
  { value: 2, emoji: '😕', label: 'Kurang Baik' },
  { value: 3, emoji: '😐', label: 'Biasa Saja' },
  { value: 4, emoji: '🙂', label: 'Baik' },
  { value: 5, emoji: '😄', label: 'Luar Biasa' },
]

export function moodInfo(value) {
  return MOODS.find((m) => m.value === value) || null
}

export const TAG_SUGGESTIONS = ['Kerja', 'Keluarga', 'Kesehatan', 'Produktif', 'Istirahat', 'Growth', 'Belajar', 'Hubungan']

export const JOURNAL_PROMPTS = [
  'Momen apa hari ini yang paling membuatmu tersenyum?',
  'Apa satu hal kecil yang berjalan lebih baik dari dugaanmu?',
  'Tantangan apa yang kamu hadapi hari ini, dan bagaimana kamu meresponnya?',
  'Kalau bisa mengulang satu momen hari ini, momen mana yang kamu pilih?',
  'Apa yang membuatmu merasa lelah atau terkuras hari ini?',
  'Siapa yang membuat harimu terasa lebih ringan?',
  'Apa satu keputusan kecil hari ini yang kamu banggakan?',
  'Hal apa yang ingin kamu lakukan berbeda besok?',
  'Apa yang sedang kamu khawatirkan, dan apakah itu sepenuhnya dalam kendalimu?',
  'Kapan hari ini kamu merasa paling fokus atau paling "hidup"?',
  'Apa satu hal sederhana yang kamu syukuri tapi jarang kamu sadari?',
  'Bagaimana kondisi energimu hari ini — fisik maupun emosional?',
  'Apa satu pelajaran yang kamu dapat dari kesalahan atau kejadian tak terduga hari ini?',
  'Apa yang paling kamu nantikan besok?',
  'Bagaimana caramu merawat dirimu sendiri hari ini?',
  'Apa satu percakapan hari ini yang membekas di pikiranmu?',
  'Jika hari ini punya judul seperti judul film, apa judulnya?',
  'Apa yang membuatmu merasa cukup hari ini, walau sekecil apapun?',
  'Adakah sesuatu yang kamu tunda hari ini? Apa alasannya?',
  'Apa satu hal yang ingin kamu ingat dari hari ini setahun dari sekarang?',
]

export function randomPrompt(excluding) {
  const pool = excluding ? JOURNAL_PROMPTS.filter((p) => p !== excluding) : JOURNAL_PROMPTS
  if (!pool.length) return JOURNAL_PROMPTS[0]
  return pool[Math.floor(Math.random() * pool.length)]
}

export function countWords(text) {
  const t = (text || '').trim()
  if (!t) return 0
  return t.split(/\s+/).filter(Boolean).length
}

export function estimateMinutes(words) {
  if (!words) return 0
  return Math.max(1, Math.round(words / 200))
}

// Completion parts used for the progress ring/bar + "Ringkasan" checklist.
export function entryCompletion(entry) {
  if (!entry) return { parts: [], done: 0, total: 4, pct: 0 }
  const parts = [
    { key: 'mood', label: 'Mood', done: entry.mood != null },
    { key: 'gratitude', label: 'Gratitude', done: (entry.gratitude || []).length > 0 },
    { key: 'highlights', label: 'Highlights', done: !!(entry.highlights || '').trim() },
    { key: 'learning', label: 'Learning', done: !!(entry.learning || '').trim() },
  ]
  const done = parts.filter((p) => p.done).length
  return { parts, done, total: parts.length, pct: Math.round((done / parts.length) * 100) }
}

export function isEntryBlank(entry) {
  if (!entry) return true
  return entry.mood == null && (entry.gratitude || []).length === 0 && !(entry.highlights || '').trim() && !(entry.learning || '').trim()
}
