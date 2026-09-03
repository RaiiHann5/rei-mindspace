import { Link } from 'react-router-dom'
import {
  Zap, FileText, QrCode, FileSignature, BarChart3, ShieldCheck, ArrowRight, Check,
} from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import LanguageToggle from '../../components/ui/LanguageToggle'
import Logo from '../../components/ui/Logo'

const FEATURE_ICONS = [FileText, QrCode, FileSignature, BarChart3, ShieldCheck, Zap]

export default function Landing() {
  const { language, setLanguage, t } = useLanguage()
  const features = t('landing.features')

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo className="h-6 w-auto" />
          <div className="flex items-center gap-3">
            <LanguageToggle value={language} onChange={setLanguage} />
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">{t('landing.login')}</Link>
            <Link to="/register" className="btn-primary text-sm">{t('landing.getStarted')}</Link>
          </div>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium mb-6">
          <Zap className="w-3.5 h-3.5" /> {t('landing.badge')}
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {t('landing.heroLine1')}<br className="hidden sm:block" /> <span className="text-brand-600">{t('landing.heroTrust')}</span>
        </h1>
        <p className="mt-5 text-lg text-slate-500 max-w-2xl mx-auto">
          {t('landing.heroDesc')}
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/register" className="btn-primary">
            {t('landing.startFree')} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="btn-secondary">{t('landing.haveAccount')}</Link>
        </div>
        <p className="mt-4 text-xs text-slate-400">{t('landing.noCard')}</p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-soft">
          <div className="rounded-xl bg-white border border-slate-200 aspect-[16/9] flex items-center justify-center">
            <div className="text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-7 h-7 text-brand-500" />
              </div>
              <p className="text-slate-400 text-sm">{t('landing.previewPlaceholder')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-100">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">{t('landing.featuresTitle')}</h2>
          <p className="text-slate-500 mt-2">{t('landing.featuresSubtitle')}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ title, desc }, i) => {
            const Icon = FEATURE_ICONS[i] || Zap
            return (
              <div key={title} className="p-6 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-card transition">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500 mt-1.5">{desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-100">
        <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-10 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold">{t('landing.ctaTitle')}</h2>
          <p className="text-brand-100 mt-2">{t('landing.ctaDesc')}</p>
          <Link to="/register" className="inline-flex mt-6 items-center gap-2 bg-white text-brand-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-50 transition">
            {t('landing.ctaButton')} <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-brand-100">
            <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> {t('landing.ctaFree')}</span>
            <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> {t('landing.ctaClients')}</span>
            <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> {t('landing.ctaQr')}</span>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-xs text-slate-400">
        {t('landing.footer', { year: new Date().getFullYear() })}
      </footer>
    </div>
  )
}
