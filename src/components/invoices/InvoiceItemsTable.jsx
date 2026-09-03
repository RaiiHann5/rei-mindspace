import { Plus, Trash2 } from 'lucide-react'
import { calcItemTotal } from '../../utils/invoiceCalculations'
import { formatCurrency } from '../../utils/formatCurrency'
import { useLanguage } from '../../contexts/LanguageContext'

export default function InvoiceItemsTable({ items, onChange, currency }) {
  const { t } = useLanguage()

  function updateItem(id, field, value) {
    onChange(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)))
  }

  function addItem() {
    onChange([...items, { id: crypto.randomUUID(), name: '', description: '', quantity: 1, price: 0 }])
  }

  function removeItem(id) {
    onChange(items.filter((it) => it.id !== id))
  }

  return (
    <div>
      <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-medium text-slate-500 px-1 pb-2">
        <div className="col-span-3">{t('invoiceItemsTable.itemService')}</div>
        <div className="col-span-4">{t('invoiceItemsTable.description')}</div>
        <div className="col-span-1 text-right">{t('invoiceItemsTable.qty')}</div>
        <div className="col-span-2 text-right">{t('invoiceItemsTable.price')}</div>
        <div className="col-span-2 text-right">{t('invoiceItemsTable.total')}</div>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 rounded-lg p-2">
            <input
              className="col-span-12 sm:col-span-3 input-field !py-2 text-sm"
              placeholder={t('invoiceItemsTable.serviceNamePlaceholder')}
              value={item.name}
              onChange={(e) => updateItem(item.id, 'name', e.target.value)}
            />
            <input
              className="col-span-9 sm:col-span-4 input-field !py-2 text-sm"
              placeholder={t('invoiceItemsTable.descriptionPlaceholder')}
              value={item.description}
              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
            />
            <input
              type="number" min="0"
              className="col-span-3 sm:col-span-1 input-field !py-2 text-sm text-right"
              value={item.quantity}
              onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
            />
            <input
              type="number" min="0" step="0.01"
              className="col-span-5 sm:col-span-2 input-field !py-2 text-sm text-right"
              value={item.price}
              onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
            />
            <div className="col-span-6 sm:col-span-2 flex items-center justify-end gap-2">
              <span className="text-sm font-medium text-slate-700">{formatCurrency(calcItemTotal(item), currency)}</span>
              <button type="button" onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500 shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-3 flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        <Plus className="w-4 h-4" /> {t('invoiceItemsTable.addItem')}
      </button>
    </div>
  )
}
