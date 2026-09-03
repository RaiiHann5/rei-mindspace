import { AlertTriangle } from 'lucide-react'
import Button from './Button'
import { useLanguage } from '../../contexts/LanguageContext'

export default function ErrorState({ message, onRetry }) {
  const { t } = useLanguage()
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-500" />
      </div>
      <h3 className="font-semibold text-slate-900">{t('common.weHitASnag')}</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">{message || t('common.somethingWrong')}</p>
      {onRetry && (
        <div className="mt-5">
          <Button variant="secondary" onClick={onRetry}>{t('common.tryAgain')}</Button>
        </div>
      )}
    </div>
  )
}
