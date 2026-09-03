export function calcItemTotal(item) {
  const qty = Number(item.quantity || 0)
  const price = Number(item.price || 0)
  return qty * price
}

export function calcSubtotal(items = []) {
  return items.reduce((sum, item) => sum + calcItemTotal(item), 0)
}

export function calcTotals({ items = [], discount = 0, discountType = 'fixed', tax = 0, taxType = 'percent' }) {
  const subtotal = calcSubtotal(items)

  const discountAmount = discountType === 'percent'
    ? (subtotal * Number(discount || 0)) / 100
    : Number(discount || 0)

  const afterDiscount = Math.max(subtotal - discountAmount, 0)

  const taxAmount = taxType === 'percent'
    ? (afterDiscount * Number(tax || 0)) / 100
    : Number(tax || 0)

  const grandTotal = afterDiscount + taxAmount

  return { subtotal, discountAmount, taxAmount, grandTotal }
}

// Derives the *effective* status: if unpaid and past due date -> overdue
export function effectiveStatus(invoice) {
  if (!invoice) return 'draft'
  if (invoice.status === 'paid' || invoice.status === 'draft') return invoice.status
  if (invoice.dueDate) {
    const due = new Date(invoice.dueDate)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    if (due < now) return 'overdue'
  }
  return invoice.status || 'unpaid'
}
