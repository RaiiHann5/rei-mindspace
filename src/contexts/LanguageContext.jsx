import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { UI_TRANSLATIONS } from '../utils/uiTranslations'

const LanguageContext = createContext(null)
const STORAGE_KEY = 'invoiceflow_ui_language'

function getInitialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'id') return saved
  } catch (e) {
    // localStorage unavailable - fall back to default
  }
  return 'en'
}

// Looks up a dot-separated key (e.g. "sidebar.invoices") in the
// translations dictionary for the given language, falling back to
// English, and finally to the key itself so missing strings never
// crash the UI.
function lookup(language, key) {
  const walk = (obj) => key.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), obj)
  const value = walk(UI_TRANSLATIONS[language])
  if (value !== undefined) return value
  const fallback = walk(UI_TRANSLATIONS.en)
  if (fallback !== undefined) return fallback
  return key
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch (e) {
      // ignore write failures (e.g. private browsing)
    }
  }, [language])

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang === 'id' ? 'id' : 'en')
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'en' ? 'id' : 'en'))
  }, [])

  const t = useCallback((key, vars) => {
    let str = lookup(language, key)
    if (typeof str === 'function') return str(vars)
    if (typeof str === 'string' && vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(new RegExp(`{${k}}`, 'g'), v)
      })
    }
    return str
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
