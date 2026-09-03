import { FileSignature, Check } from 'lucide-react'
import clsx from 'clsx'
import { CONTRACT_TEMPLATES } from '../../utils/contractTemplates'

export default function ContractTemplates({ selected, onSelect, language = 'en' }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {CONTRACT_TEMPLATES.map((tpl) => (
        <button
          key={tpl.id}
          type="button"
          onClick={() => onSelect(tpl.id)}
          className={clsx(
            'text-left p-4 rounded-xl border transition',
            selected === tpl.id ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-200' : 'border-slate-200 hover:border-slate-300',
          )}
        >
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center mb-2">
              <FileSignature className="w-4 h-4 text-brand-600" />
            </div>
            {selected === tpl.id && <Check className="w-4 h-4 text-brand-600" />}
          </div>
          <p className="text-sm font-semibold text-slate-900">{language === 'id' ? (tpl.id_name || tpl.name) : tpl.name}</p>
          <p className="text-xs text-slate-500 mt-1">{language === 'id' ? (tpl.id_description || tpl.description) : tpl.description}</p>
        </button>
      ))}
    </div>
  )
}
