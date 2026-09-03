import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useLanguage } from '../contexts/LanguageContext'

export default function NotFound() {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-slate-50">
      <h1 className="text-6xl font-extrabold text-slate-900">404</h1>
      <p className="text-slate-500 mt-2">{t('notFound.title')}</p>
      <Link to="/" className="mt-6"><Button>{t('notFound.backHome')}</Button></Link>
    </div>
  )
}
