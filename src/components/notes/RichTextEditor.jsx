import { useEffect, useRef } from 'react'
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Eraser, Palette,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { sanitizeRichText } from '@/lib/safeMarkdown'

const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Sans (UI)', value: "'Inter', ui-sans-serif, system-ui, sans-serif" },
  { label: 'Serif', value: "'Georgia', 'Times New Roman', serif" },
  { label: 'Mono', value: "'JetBrains Mono', ui-monospace, monospace" },
  { label: 'Rounded', value: "'Quicksand', ui-rounded, sans-serif" },
  { label: 'Comic', value: "'Comic Sans MS', 'Comic Sans', cursive" },
]

// execCommand's fontSize only accepts 1-7 "legacy" sizes; map those onto
// real pixel values via a tiny CSS override so the toolbar can offer normal
// point-ish sizes instead of the cramped 1-7 scale.
const FONT_SIZES = [
  { label: '10', legacy: '1', px: '10px' },
  { label: '12', legacy: '2', px: '12px' },
  { label: '14', legacy: '3', px: '14px' },
  { label: '16', legacy: '4', px: '16px' },
  { label: '18', legacy: '5', px: '18px' },
  { label: '24', legacy: '6', px: '24px' },
  { label: '32', legacy: '7', px: '32px' },
]

// The value handed to execCommand('foreColor') has to be a literal colour —
// the browser does not resolve CSS variables in a command argument — so these
// are the Space+ token values written out by hand rather than var(--…).
const TEXT_COLORS = ['#17141C', '#FF7A29', '#C1400D', '#A8535F', '#C0A876', '#6E8C88', '#8D89A6']

export default function RichTextEditor({ value, onChange, onBlur, placeholder = 'Write something...', className }) {
  const ref = useRef(null)
  // Sentinel (not a string) so the very first mount always writes `value`
  // into the DOM. Initializing this to `value` itself was the bug: the
  // effect below skipped the initial write because "value !== lastValue"
  // was already false, leaving the editor blank even though the note had
  // saved content.
  const lastValue = useRef(Symbol('uninitialized'))

  // Only push external value changes into the DOM (e.g. switching notes) —
  // never on every keystroke, or the cursor would jump to the start.
  useEffect(() => {
    if (ref.current && value !== lastValue.current && document.activeElement !== ref.current) {
      ref.current.innerHTML = value || ''
      lastValue.current = value
    }
  }, [value])

  const emitChange = () => {
    if (!ref.current) return
    const html = sanitizeRichText(ref.current.innerHTML)
    lastValue.current = html
    onChange(html)
  }

  const exec = (command, arg) => {
    ref.current?.focus()
    document.execCommand(command, false, arg)
    emitChange()
  }

  const applyFontSize = (size) => {
    ref.current?.focus()
    // execCommand fontSize writes a <font size="N"> tag; we immediately
    // swap that attribute for a real pixel style so sizes are consistent
    // and survive our style-only sanitizer.
    document.execCommand('fontSize', false, size.legacy)
    ref.current?.querySelectorAll('font[size]').forEach((el) => {
      el.style.fontSize = size.px
      el.removeAttribute('size')
    })
    emitChange()
  }

  const applyFontFamily = (family) => {
    ref.current?.focus()
    if (!family) {
      document.execCommand('removeFormat', false, null)
    } else {
      document.execCommand('fontName', false, family)
    }
    emitChange()
  }

  // Toolbar: one hairline row of ghost icon buttons. No slab, no hard border —
  // the writing surface below stays the calmest thing on the page.
  const btn = 'h-8 w-8 rounded-lg flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors shrink-0 neo-press'
  const divider = 'w-px h-5 bg-[color:var(--line)] mx-0.5 shrink-0'
  const select = 'h-8 rounded-md px-2 text-xs font-medium bg-transparent border border-[color:var(--line)] outline-none cursor-pointer text-ink-light dark:text-ink-dark'

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex flex-wrap items-center gap-1 px-1 py-1.5 mb-3 border-b border-[color:var(--line)]">
        <select
          onChange={(e) => applyFontFamily(e.target.value)}
          defaultValue=""
          className={select}
          aria-label="Font family"
        >
          {FONT_FAMILIES.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
        </select>

        <select
          onChange={(e) => applyFontSize(FONT_SIZES[Number(e.target.value)])}
          defaultValue="3"
          className={cn(select, 'w-14 font-mono tabular-nums')}
          aria-label="Font size"
        >
          {FONT_SIZES.map((s, i) => <option key={s.label} value={i}>{s.label}px</option>)}
        </select>

        <div className={divider} />

        <button type="button" className={btn} onClick={() => exec('bold')} aria-label="Bold"><Bold size={14} /></button>
        <button type="button" className={btn} onClick={() => exec('italic')} aria-label="Italic"><Italic size={14} /></button>
        <button type="button" className={btn} onClick={() => exec('underline')} aria-label="Underline"><Underline size={14} /></button>
        <button type="button" className={btn} onClick={() => exec('strikeThrough')} aria-label="Strikethrough"><Strikethrough size={14} /></button>

        <div className={divider} />

        <button type="button" className={btn} onClick={() => exec('insertUnorderedList')} aria-label="Bulleted list"><List size={14} /></button>
        <button type="button" className={btn} onClick={() => exec('insertOrderedList')} aria-label="Numbered list"><ListOrdered size={14} /></button>

        <div className={divider} />

        <button type="button" className={btn} onClick={() => exec('justifyLeft')} aria-label="Align left"><AlignLeft size={14} /></button>
        <button type="button" className={btn} onClick={() => exec('justifyCenter')} aria-label="Align center"><AlignCenter size={14} /></button>
        <button type="button" className={btn} onClick={() => exec('justifyRight')} aria-label="Align right"><AlignRight size={14} /></button>

        <div className={divider} />

        <div className="relative group/color">
          <button type="button" className={btn} aria-label="Text color"><Palette size={14} /></button>
          <div className="absolute left-0 top-full mt-1 hidden group-hover/color:flex focus-within:flex hover:flex z-20 gap-1 p-1.5 rounded-2xl glass-solid" style={{ boxShadow: 'var(--shadow-pop)' }}>
            {TEXT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => exec('foreColor', c)}
                className="h-5 w-5 rounded-full border border-[color:var(--line)]"
                style={{ backgroundColor: c }}
                aria-label={`Text color ${c}`}
              />
            ))}
          </div>
        </div>

        <button type="button" className={btn} onClick={() => exec('removeFormat')} aria-label="Clear formatting"><Eraser size={14} /></button>
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={() => { emitChange(); onBlur?.(ref.current ? sanitizeRichText(ref.current.innerHTML) : '') }}
        data-placeholder={placeholder}
        className="rich-note-editor min-h-[40vh] outline-none text-[15.5px] leading-[1.75] text-ink-light dark:text-ink-dark [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
      />
    </div>
  )
}
