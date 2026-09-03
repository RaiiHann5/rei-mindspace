import { useState } from 'react'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Select from '../ui/Select'
import Button from '../ui/Button'
import ContractTemplates from './ContractTemplates'
import { getLocalizedTemplate } from '../../utils/contractTemplates'
import { LANGUAGES } from '../../utils/i18n'
import { useLanguage } from '../../contexts/LanguageContext'
import { todayISO, addDaysISO } from '../../utils/dateUtils'

const DEFAULT_PAYMENT_TERMS = {
  en: '50% upfront, 50% upon completion.',
  id: '50% di muka, 50% setelah selesai.',
}

export default function ContractForm({ clients = [], business, onGeneratePreview }) {
  const { t } = useLanguage()
  const [templateId, setTemplateId] = useState('freelance')
  const [language, setLanguage] = useState('en')
  const [form, setForm] = useState(() => {
    const tpl = getLocalizedTemplate('freelance', 'en')
    return {
      title: tpl.name,
      businessName: business?.businessName || '',
      clientId: '',
      clientName: '',
      projectName: '',
      scopeOfWork: tpl.scopeOfWork,
      projectPrice: '',
      paymentTerms: DEFAULT_PAYMENT_TERMS.en,
      startDate: todayISO(),
      deadline: addDaysISO(30),
      revisionPolicy: tpl.revisionPolicy,
      cancellationTerms: tpl.cancellationTerms,
      additionalTerms: tpl.additionalTerms,
    }
  })

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleTemplateSelect(id) {
    setTemplateId(id)
    const tpl = getLocalizedTemplate(id, language)
    setForm((f) => ({
      ...f,
      title: tpl.name,
      scopeOfWork: tpl.scopeOfWork,
      revisionPolicy: tpl.revisionPolicy,
      cancellationTerms: tpl.cancellationTerms,
      additionalTerms: tpl.additionalTerms,
    }))
  }

  function handleLanguageChange(nextLanguage) {
    const tpl = getLocalizedTemplate(templateId, nextLanguage)
    setForm((f) => ({
      ...f,
      title: tpl.name,
      scopeOfWork: tpl.scopeOfWork,
      revisionPolicy: tpl.revisionPolicy,
      cancellationTerms: tpl.cancellationTerms,
      additionalTerms: tpl.additionalTerms,
      // Only swap the payment terms default if the user hasn't customized it,
      // so we don't clobber their edits when switching language.
      paymentTerms: (f.paymentTerms === DEFAULT_PAYMENT_TERMS.en || f.paymentTerms === DEFAULT_PAYMENT_TERMS.id)
        ? DEFAULT_PAYMENT_TERMS[nextLanguage]
        : f.paymentTerms,
    }))
    setLanguage(nextLanguage)
  }

  function handleClientSelect(clientId) {
    const client = clients.find((c) => c.id === clientId)
    setForm((f) => ({ ...f, clientId, clientName: client ? client.name : f.clientName }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onGeneratePreview({ ...form, template: templateId, language })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-semibold text-slate-900">{t('contractForm.chooseTemplate')}</h3>
          <Select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            options={LANGUAGES}
            className="!py-1.5 text-xs"
            containerClassName="w-44"
          />
        </div>
        <ContractTemplates selected={templateId} onSelect={handleTemplateSelect} language={language} />
      </div>

      <div className="card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">{t('contractForm.contractDetails')}</h3>
        <Input label={t('contractForm.contractTitle')} required value={form.title} onChange={(e) => update('title', e.target.value)} />
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label={t('contractForm.businessName')} value={form.businessName} onChange={(e) => update('businessName', e.target.value)} />
          {clients.length > 0 ? (
            <Select
              label={t('contractForm.client')}
              value={form.clientId}
              onChange={(e) => handleClientSelect(e.target.value)}
              options={[{ value: '', label: t('contractForm.enterManually') }, ...clients.map((c) => ({ value: c.id, label: c.name }))]}
            />
          ) : (
            <Input label={t('contractForm.clientName')} value={form.clientName} onChange={(e) => update('clientName', e.target.value)} />
          )}
        </div>
        {clients.length > 0 && (
          <Input label={t('contractForm.clientName')} value={form.clientName} onChange={(e) => update('clientName', e.target.value)} />
        )}
        <Input label={t('contractForm.projectName')} value={form.projectName} onChange={(e) => update('projectName', e.target.value)} />
        <Textarea label={t('contractForm.scopeOfWork')} rows={3} value={form.scopeOfWork} onChange={(e) => update('scopeOfWork', e.target.value)} />
        <div className="grid sm:grid-cols-3 gap-3">
          <Input label={t('contractForm.projectPrice')} value={form.projectPrice} onChange={(e) => update('projectPrice', e.target.value)} placeholder={t('contractForm.projectPricePlaceholder')} />
          <Input label={t('contractForm.startDate')} type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} />
          <Input label={t('contractForm.deadline')} type="date" value={form.deadline} onChange={(e) => update('deadline', e.target.value)} />
        </div>
        <Textarea label={t('contractForm.paymentTerms')} rows={2} value={form.paymentTerms} onChange={(e) => update('paymentTerms', e.target.value)} />
        <Textarea label={t('contractForm.revisionPolicy')} rows={2} value={form.revisionPolicy} onChange={(e) => update('revisionPolicy', e.target.value)} />
        <Textarea label={t('contractForm.cancellationTerms')} rows={2} value={form.cancellationTerms} onChange={(e) => update('cancellationTerms', e.target.value)} />
        <Textarea label={t('contractForm.additionalTerms')} rows={2} value={form.additionalTerms} onChange={(e) => update('additionalTerms', e.target.value)} />
      </div>

      <div className="flex justify-end">
        <Button type="submit">{t('contractForm.generatePreview')}</Button>
      </div>
    </form>
  )
}
