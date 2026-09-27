import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Space+ ships dark-first: "night console" is the primary mode, light is the
// secondary one. Anyone who already has a saved preference keeps it.
export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark', // 'light' | 'dark' | 'system'
      accent: 'ember', // gradient id, solid preset id, or 'custom'
      customHex: '#FF7A29', // used when accent === 'custom'
      setTheme: (theme) => set({ theme }),
      setAccent: (accent) => set({ accent }),
      setCustomHex: (hex) => set({ accent: 'custom', customHex: hex }),
      toggle: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
    }),
    { name: 'meridian_theme' }
  )
)

// Solid presets: id -> representative colour used for --color-primary-500.
export const ACCENT_PRESETS = [
  { id: 'primary', label: 'Lime', color: '#A3E635' },
  { id: 'purple', label: 'Purple', color: '#8B5CF6' },
  { id: 'pink', label: 'Pink', color: '#EC4899' },
  { id: 'rose', label: 'Rose', color: '#F4506A' },
  { id: 'amber', label: 'Amber', color: '#F7A331' },
  { id: 'teal', label: 'Teal', color: '#1EC4B0' },
  { id: 'sky', label: 'Sky', color: '#3B82F6' },
  { id: 'emerald', label: 'Emerald', color: '#10B981' },
]

// Gradient presets: two stops used to build --accent-gradient, with the
// first stop doubling as the flat --color-primary-500 fallback.
//
// The system identity is a single warm ember gradient, so it leads the list
// and is the default. The rest stay available because the accent is a user
// choice — but none of them touch the canvas, panel, or text tokens, so the
// night-console structure of the app holds whichever one is picked.
export const GRADIENT_PRESETS = [
  { id: 'ember', label: 'Ember', from: '#FFB343', to: '#C1400D' },
  { id: 'sunset', label: 'Sunset', from: '#F472B6', to: '#F7A331' },
  { id: 'candy', label: 'Candy', from: '#EC4899', to: '#8B5CF6' },
  { id: 'aurora', label: 'Aurora', from: '#8B5CF6', to: '#1EC4B0' },
  { id: 'ocean', label: 'Ocean', from: '#3B82F6', to: '#1EC4B0' },
  { id: 'berry', label: 'Berry', from: '#8B5CF6', to: '#F4506A' },
]

function hexToRgb(hex) {
  const m = hex.replace('#', '')
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m
  const num = parseInt(full, 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}
function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
}
export function shade(hex, amount) {
  // amount negative = darker, positive = lighter
  const { r, g, b } = hexToRgb(hex)
  const t = amount < 0 ? 0 : 255
  const p = Math.abs(amount)
  return rgbToHex({ r: r + (t - r) * p, g: g + (t - g) * p, b: b + (t - b) * p })
}

// Perceived luminance (sRGB -> linear -> Rec.709), 0..1.
function luminance(hex) {
  const { r, g, b } = hexToRgb(hex)
  const lin = (c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

export function applyTheme() {
  const { theme, accent, customHex } = useThemeStore.getState()
  const root = document.documentElement
  const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  const resolved = theme === 'system' ? system : theme
  root.classList.toggle('dark', resolved === 'dark')

  let base500
  let gradientCss

  const gradientPreset = GRADIENT_PRESETS.find((g) => g.id === accent)
  const solidPreset = ACCENT_PRESETS.find((p) => p.id === accent)

  if (gradientPreset) {
    base500 = gradientPreset.from
    gradientCss = `linear-gradient(135deg, ${gradientPreset.from}, ${gradientPreset.to})`
  } else if (accent === 'custom') {
    base500 = customHex
    gradientCss = `linear-gradient(135deg, ${shade(customHex, 0.18)}, ${shade(customHex, -0.18)})`
  } else {
    base500 = solidPreset?.color || GRADIENT_PRESETS[0].from
    gradientCss = `linear-gradient(135deg, ${shade(base500, 0.14)}, ${shade(base500, -0.16)})`
  }

  // -600 is used as small/body text on light surfaces, so it needs to stay
  // dark regardless of how light the chosen accent itself is (lime, amber…).
  root.style.setProperty('--color-primary-500', base500)
  root.style.setProperty('--color-primary-400', base500)
  root.style.setProperty('--color-primary-600', shade(base500, -0.45))
  root.style.setProperty('--color-primary-700', shade(base500, -0.6))
  root.style.setProperty('--color-primary-300', shade(base500, 0.28))
  root.style.setProperty('--color-primary-100', shade(base500, 0.62))
  root.style.setProperty('--color-primary-50', shade(base500, 0.78))
  root.style.setProperty('--accent-gradient', gradientCss)

  // Text/icon colour for anything sitting on top of the accent. The ember
  // gradient is bright enough to need near-black; a dark accent like purple
  // needs light. Deciding this from luminance keeps CTA labels readable no
  // matter which accent is active, instead of hardcoding a dark ink.
  root.style.setProperty('--accent-ink', luminance(base500) > 0.42 ? '#1A0D00' : '#FDFBF7')

  // The corner ambient glow in index.css is tinted from the active accent so
  // it never fights the chosen palette.
  const { r, g, b } = hexToRgb(base500)
  root.style.setProperty('--ember-rgb', `${r}, ${g}, ${b}`)
}
