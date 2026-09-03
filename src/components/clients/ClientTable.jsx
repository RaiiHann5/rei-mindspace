import { Pencil, Trash2, Mail, Phone } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'

export default function ClientTable({ clients, onEdit, onDelete }) {
  const { t } = useLanguage()
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
            <th className="py-3 font-medium">{t('clients.table.client')}</th>
            <th className="py-3 font-medium">{t('clients.table.company')}</th>
            <th className="py-3 font-medium">{t('clients.table.contact')}</th>
            <th className="py-3 font-medium text-right">{t('clients.table.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {clients.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50">
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold">
                    {(c.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-slate-900">{c.name}</span>
                </div>
              </td>
              <td className="py-3 text-slate-600">{c.company || '-'}</td>
              <td className="py-3 text-slate-600">
                <div className="flex flex-col gap-0.5 text-xs">
                  {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
                  {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                </div>
              </td>
              <td className="py-3">
                <div className="flex justify-end gap-1">
                  <button onClick={() => onEdit(c)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(c)} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
