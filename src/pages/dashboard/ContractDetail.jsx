import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Download, FileText, Printer, Trash2 } from 'lucide-react'
import { getContract, deleteContract, updateContract } from '../../services/contractService'
import { generateContractPdf } from '../../utils/contractPdfGenerator'
import { generateContractWord } from '../../utils/contractWordGenerator'
import { relocalizeContractContent } from '../../utils/contractTemplates'
import { getContractLabels } from '../../utils/i18n'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Loader from '../../components/ui/Loader'
import ErrorState from '../../components/ui/ErrorState'
import Select from '../../components/ui/Select'
import LanguageToggle from '../../components/ui/LanguageToggle'
import ContractPreview from '../../components/contracts/ContractPreview'

export default function ContractDetail() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [content, setContent] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)
  const [languageSaving, setLanguageSaving] = useState(false)
  const [downloadingWord, setDownloadingWord] = useState(false)

  const STATUS_OPTIONS = [
    { value: 'draft', label: t('contracts.statusOptions.draft') },
    { value: 'sent', label: t('contracts.statusOptions.sent') },
    { value: 'signed', label: t('contracts.statusOptions.signed') },
  ]

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getContract(id)
      if (!data || data.userId !== currentUser.uid) {
        setError('Contract not found.')
      } else {
        setContract(data)
        setContent(data.content)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function handleSaveContent() {
    try {
      await updateContract(id, { content })
    } catch (e) {
      alert(e.message)
    }
  }

  async function handleStatusChange(status) {
    setSavingStatus(true)
    try {
      await updateContract(id, { status })
      setContract((prev) => ({ ...prev, status }))
    } catch (e) {
      alert(e.message)
    } finally {
      setSavingStatus(false)
    }
  }

  async function handleDeleteConfirm() {
    try {
      await deleteContract(id)
      navigate('/app/contracts')
    } catch (e) {
      alert(e.message)
    }
  }

  // Re-localizes the saved contract text (section headers, "Between:"/
  // "And:" lines, disclaimer, etc.) to the new language, instead of
  // just flipping the `language` field - otherwise the toggle looked
  // like it "didn't work" because the visible text never changed.
  async function handleLanguageChange(nextLanguage) {
    const previousLanguage = contract.language || 'en'
    if (previousLanguage === nextLanguage) return
    setLanguageSaving(true)
    try {
      const nextContent = relocalizeContractContent(content, previousLanguage, nextLanguage)
      await updateContract(id, { language: nextLanguage, content: nextContent })
      setContract((prev) => ({ ...prev, language: nextLanguage, content: nextContent }))
      setContent(nextContent)
    } catch (e) {
      alert(e.message)
    } finally {
      setLanguageSaving(false)
    }
  }

  function handleDownload() {
    generateContractPdf({ title: contract.title, content, language: contract.language })
  }

  async function handleDownloadWord() {
    setDownloadingWord(true)
    try {
      await generateContractWord({ title: contract.title, content, language: contract.language })
    } catch (e) {
      alert('Could not generate Word document: ' + e.message)
    } finally {
      setDownloadingWord(false)
    }
  }

  const contractLabels = getContractLabels(contract?.language)

  if (loading) return <Loader full />
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!contract) return null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/app/contracts" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4" /> {t('contractDetail.backToContracts')}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <LanguageToggle value={contract.language || 'en'} onChange={handleLanguageChange} disabled={languageSaving} />
          <Select value={contract.status} onChange={(e) => handleStatusChange(e.target.value)} options={STATUS_OPTIONS} className="!py-2 text-xs" disabled={savingStatus} />
          <Button variant="secondary" icon={Printer} onClick={() => window.print()}>{t('contractDetail.print')}</Button>
          <Button variant="secondary" icon={FileText} onClick={handleDownloadWord} loading={downloadingWord}>{t('contractDetail.word')}</Button>
          <Button variant="secondary" icon={Download} onClick={handleDownload}>{t('contractDetail.pdf')}</Button>
          <Button variant="danger" icon={Trash2} onClick={() => setDeleting(true)}>{t('contractDetail.delete')}</Button>
        </div>
      </div>

      <ContractPreview content={content} onChange={setContent} />

      <div className="flex justify-center">
        <Button variant="secondary" onClick={handleSaveContent}>{t('contractDetail.saveChanges')}</Button>
      </div>

      <p className="text-center text-[11px] text-slate-400 max-w-md mx-auto">
        {contractLabels.disclaimer}
      </p>

      <Modal
        open={deleting}
        onClose={() => setDeleting(false)}
        title={t('contractDetail.deleteTitle')}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setDeleting(false)}>{t('contractDetail.cancel')}</Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>{t('contractDetail.delete')}</Button>
          </>
        )}
      >
        <p className="text-sm text-slate-600">{t('contractDetail.deleteBody')}</p>
      </Modal>
    </div>
  )
}
