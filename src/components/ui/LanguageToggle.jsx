import clsx from 'clsx'
import { LANGUAGES } from '../../utils/i18n'

export default function LanguageToggle({ value = 'en', onChange, disabled }) {
  return (
    <div className="inline-flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-medium">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(lang.value)}
          className={clsx(
            'px-2.5 py-1.5 rounded-md transition disabled:opacity-50',
            value === lang.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
          )}
        >
          {lang.value.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
