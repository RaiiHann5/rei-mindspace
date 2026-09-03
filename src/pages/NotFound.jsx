import { Link } from 'react-router-dom'
<<<<<<< HEAD
import Button from '../components/ui/Button'
import { useLanguage } from '../contexts/LanguageContext'

export default function NotFound() {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-slate-50">
      <h1 className="text-6xl font-extrabold text-slate-900">404</h1>
      <p className="text-slate-500 mt-2">{t('notFound.title')}</p>
      <Link to="/" className="mt-6"><Button>{t('notFound.backHome')}</Button></Link>
=======
import { Button } from '@/components/ui'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="font-display text-4xl font-bold mb-2">404</h1>
      <p className="text-muted-light dark:text-muted-dark mb-6">This page drifted off somewhere.</p>
      <Link to="/"><Button size="sm">Back to dashboard</Button></Link>
>>>>>>> b4b2ee123dad43c2655a52eab73876263db4f19f
    </div>
  )
}
