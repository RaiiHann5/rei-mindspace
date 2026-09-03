import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Download, FileText, Printer } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { listClients } from '../../services/clientService'
import { getUserData } from '../../services/businessService'
import { createContract } from '../../services/contractService'
import { buildContractContent } from '../../utils/contractTemplates'
import { getContractLabels } from '../../utils/i18n'
import { generateContractPdf } from '../../utils/contractPdfGenerator'
import { generateContractWord } from '../../utils/contractWordGenerator'
import ContractForm from '../../components/contracts/ContractForm'
import ContractPreview from '../../components/contracts/ContractPreview'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'

export default function CreateContract() {
  const { currentUser } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState(null)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [downloadingWord, setDownloadingWord] = useState(false)

  useEffect(() => {
    async function load() {
      const [cli, userData] = await Promise.all([listClients(currentUser.uid), getUserData(currentUser.uid)])
      setClients(cli)
      setBusiness(userData?.business || null)
      setLoading(false)
    }
    load()
  }, [currentUser.uid])

  function handleGeneratePreview(form) {
    setMeta(form)
    setContent(buildContractContent(form, form.language))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const id = await createContract(currentUser.uid, {
        title: meta.title,
        clientId: meta.clientId || null,
        clientName: meta.clientName,
        template: meta.template,
        language: meta.language,
        content,
        status: 'draft',
      })
      navigate(`/app/contracts/${id}`)
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  function handleDownload() {
    generateContractPdf({ title: meta.title, content, language: meta.language })
  }

  async function handleDownloadWord() {
    setDownloadingWord(true)
    try {
      await generateContractWord({ title: meta.title, content, language: meta.language })
    } catch (e) {
      alert('Could not generate Word document: ' + e.message)
    } finally {
      setDownloadingWord(false)
    }
  }

  if (loading) return <Loader full label={t('common.loading')} />

  if (meta) {
    const contractLabels = getContractLabels(meta.language)
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => setMeta(null)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" /> {t('createContract.backToForm')}
          </button>
          <div className="flex gap-2">
            <Button variant="secondary" icon={Printer} onClick={() => window.print()}>{t('createContract.print')}</Button>
            <Button variant="secondary" icon={FileText} onClick={handleDownloadWord} loading={downloadingWord}>{t('createContract.word')}</Button>
            <Button variant="secondary" icon={Download} onClick={handleDownload}>{t('createContract.pdf')}</Button>
            <Button icon={Save} onClick={handleSave} loading={saving}>{t('createContract.saveContract')}</Button>
          </div>
        </div>
        <p className="text-xs text-slate-400 text-center">{t('createContract.editHint')}</p>
        <ContractPreview content={content} onChange={setContent} />
        <p className="text-center text-[11px] text-slate-400 max-w-md mx-auto">
          {contractLabels.disclaimer}
        </p>
      </div>
    )
  }

  return <ContractForm clients={clients} business={business} onGeneratePreview={handleGeneratePreview} />
}
