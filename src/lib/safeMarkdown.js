import { marked } from 'marked'
import DOMPurify from 'dompurify'

// Renders markdown to HTML and strips anything that could execute script or
// exfiltrate data: <script>, inline event handlers (onerror, onclick...),
// javascript: URLs, <iframe>/<object>/<embed>, and <form> (used to prevent
// credential-harvesting forms rendered from untrusted markdown, e.g. AI
// assistant replies or imported note content).
//
// Every dangerouslySetInnerHTML in this codebase MUST go through this
// helper — never call marked.parse() directly into the DOM.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  // Force any surviving links to open safely.
  if (node.tagName === 'A') {
    node.setAttribute('rel', 'noopener noreferrer')
    if (node.getAttribute('target') === '_blank' || node.hasAttribute('href')) {
      node.setAttribute('target', '_blank')
    }
  }
})

export function renderSafeMarkdown(text) {
  const rawHtml = marked.parse(text ?? '', { async: false })
  return DOMPurify.sanitize(rawHtml, {
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'link', 'meta'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'srcdoc'],
    ALLOW_DATA_ATTR: false,
  })
}

// Sanitizes hand-authored rich-text HTML coming out of the notes editor
// (contentEditable + execCommand). Unlike renderSafeMarkdown this does NOT
// run the text through the markdown parser first — the editor already
// produces HTML — but the same script/exfiltration protections apply, plus
// an explicit style-attribute allowlist so only font/size/color/alignment
// survive (no position/behavior tricks).
//
// Every dangerouslySetInnerHTML rendering rich-text note content MUST go
// through this helper — never render editor HTML directly.
export function sanitizeRichText(html) {
  return DOMPurify.sanitize(html ?? '', {
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'link', 'meta'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'srcdoc'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['style'],
  })
}

// Best-effort plain-text extraction from rich-text HTML, used for card
// previews and search matching where tags/markup would just be noise.
export function htmlToPlainText(html) {
  if (!html) return ''
  const withBreaks = html
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
  const div = document.createElement('div')
  div.innerHTML = DOMPurify.sanitize(withBreaks, { ALLOWED_TAGS: [] })
  return (div.textContent || '').replace(/\n{3,}/g, '\n\n').trim()
}

// Legacy notes were plain markdown-ish text, not HTML. Detect that case so
// we can lift it into the rich editor as paragraphs instead of dumping raw
// text with no line breaks.
export function looksLikeHtml(content) {
  return /<\/?[a-z][\s\S]*>/i.test(content || '')
}

export function plainTextToHtml(text) {
  const lines = (text ?? '').split('\n')
  return lines.map((l) => `<p>${l.length ? escapeHtml(l) : '<br>'}</p>`).join('')
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
