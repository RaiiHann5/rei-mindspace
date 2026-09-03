import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import LanguageToggle from '../../components/ui/LanguageToggle'
import Logo from '../../components/ui/Logo'
import { friendlyAuthError } from './Login'

export default function Register() {
  const { register } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/app', { replace: true })
    } catch (err) {
      setError(friendlyAuthError(err, t))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-4">
          <Logo className="h-7 w-auto" />
        </div>

        <div className="flex justify-center mb-4">
          <LanguageToggle value={language} onChange={setLanguage} />
        </div>

        <div className="card p-6">
          <h1 className="text-lg font-semibold text-slate-900 mb-1">{t('register.createAccount')}</h1>
          <p className="text-sm text-slate-500 mb-6">{t('register.subtitle')}</p>

          {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label={t('register.fullName')} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
            <Input label={t('register.email')} type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" />
            <Input label={t('register.password')} type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={t('register.passwordPlaceholder')} />
            <Button type="submit" className="w-full" loading={loading}>{t('register.createAccountButton')}</Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          {t('register.haveAccount')} <Link to="/login" className="text-brand-600 font-medium hover:underline">{t('register.logIn')}</Link>
        </p>
      </div>
    </div>
  )
}
