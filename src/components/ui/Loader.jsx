import { Loader2 } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'

export default function Loader({ label, full = false }) {
  const { t } = useLanguage()
  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-slate-400 ${full ? 'h-[60vh]' : 'py-16'}`}>
      <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
      <p className="text-sm">{label || t('common.loading')}</p>
    </div>
  )
}
