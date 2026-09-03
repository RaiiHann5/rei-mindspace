import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import LanguageToggle from '../../components/ui/LanguageToggle'
import Logo from '../../components/ui/Logo'

export default function Login() {
  const { login } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      const redirectTo = location.state?.from || '/app'
      navigate(redirectTo, { replace: true })
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
          <h1 className="text-lg font-semibold text-slate-900 mb-1">{t('login.welcomeBack')}</h1>
          <p className="text-sm text-slate-500 mb-6">{t('login.subtitle')}</p>

          {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label={t('login.email')} type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" />
            <Input label={t('login.password')} type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
            <Button type="submit" className="w-full" loading={loading}>{t('login.logIn')}</Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          {t('login.noAccount')} <Link to="/register" className="text-brand-600 font-medium hover:underline">{t('login.signUp')}</Link>
        </p>
      </div>
    </div>
  )
}

export function friendlyAuthError(err, t) {
  const code = err?.code || ''
  if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) {
    return t ? t('login.errorIncorrect') : 'Incorrect email or password.'
  }
  if (code.includes('email-already-in-use')) return t ? t('login.errorInUse') : 'An account with this email already exists.'
  if (code.includes('weak-password')) return t ? t('login.errorWeak') : 'Password should be at least 6 characters.'
  if (code.includes('invalid-email')) return t ? t('login.errorInvalidEmail') : 'Please enter a valid email address.'
  return t ? t('login.errorGeneric') : 'Something went wrong. Please try again.'
}
