import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import QRCode from 'qrcode'
import { formatCurrency } from './formatCurrency'
import { formatDate } from './dateUtils'
import { calcTotals, effectiveStatus } from './invoiceCalculations'
import { getInvoiceLabels } from './i18n'

export async function generateInvoicePdf(invoice, { download = true } = {}) {
  const language = invoice.language || 'en'
  const t = getInvoiceLabels(language)
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 40
  let y = 50

  const { businessInfo = {}, clientInfo = {}, items = [], currency = 'USD' } = invoice
  const totals = calcTotals(invoice)
  const status = effectiveStatus(invoice)

  // Header: logo + business info (left), invoice title (right)
  if (businessInfo.logoUrl) {
    try {
      const imgData = await toDataURL(businessInfo.logoUrl)
      doc.addImage(imgData, 'PNG', margin, y - 10, 50, 50)
    } catch (e) {
      // logo failed to load (CORS etc.) - continue without it
    }
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(businessInfo.businessName || t.yourBusiness, margin + (businessInfo.logoUrl ? 65 : 0), y + 5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(90)
  let by = y + 20
  ;[businessInfo.email, businessInfo.phone, businessInfo.address].filter(Boolean).forEach((line) => {
    doc.text(String(line), margin + (businessInfo.logoUrl ? 65 : 0), by)
    by += 12
  })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(30)
  doc.text(t.documentTitle, pageWidth - margin, y + 5, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(90)
  doc.text(`#${invoice.invoiceNumber || ''}`, pageWidth - margin, y + 20, { align: 'right' })
  doc.text(`${t.status[status] || status}`, pageWidth - margin, y + 34, { align: 'right' })

  y += 90
  doc.setDrawColor(230)
  doc.line(margin, y, pageWidth - margin, y)
  y += 25

  // Bill to / dates
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(30)
  doc.text(t.billTo.toUpperCase(), margin, y)
  doc.text(t.issueDate.toUpperCase(), pageWidth - margin - 150, y)
  doc.text(t.dueDate.toUpperCase(), pageWidth - margin - 60, y)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60)
  let cy = y + 16
  doc.text(clientInfo.name || '-', margin, cy)
  doc.text(formatDate(invoice.issueDate, language), pageWidth - margin - 150, cy)
  doc.text(formatDate(invoice.dueDate, language), pageWidth - margin - 60, cy)
  cy += 14
  if (clientInfo.company) { doc.text(clientInfo.company, margin, cy); cy += 14 }
  if (clientInfo.email) { doc.text(clientInfo.email, margin, cy); cy += 14 }
  if (clientInfo.address) { doc.text(clientInfo.address, margin, cy, { maxWidth: 220 }); cy += 14 }

  y = cy + 20

  // Items table
  autoTable(doc, {
    startY: y,
    head: [[t.item, t.description, t.qty, t.price, t.total]],
    body: items.map((it) => [
      it.name || '-',
      it.description || '',
      String(it.quantity || 0),
      formatCurrency(it.price, currency),
      formatCurrency((Number(it.quantity || 0) * Number(it.price || 0)), currency),
    ]),
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 6, textColor: [50, 50, 50] },
    headStyles: { fillColor: [244, 245, 250], textColor: [40, 40, 40], fontStyle: 'bold' },
    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
    margin: { left: margin, right: margin },
  })

  let finalY = doc.lastAutoTable.finalY + 15

  // Totals block (right aligned)
  const totalsX = pageWidth - margin - 200
  doc.setFontSize(9)
  doc.setTextColor(90)
  doc.text(t.subtotal, totalsX, finalY)
  doc.text(formatCurrency(totals.subtotal, currency), pageWidth - margin, finalY, { align: 'right' })
  finalY += 16

  if (totals.discountAmount > 0) {
    doc.text(t.discount, totalsX, finalY)
    doc.text(`-${formatCurrency(totals.discountAmount, currency)}`, pageWidth - margin, finalY, { align: 'right' })
    finalY += 16
  }
  if (totals.taxAmount > 0) {
    doc.text(t.tax, totalsX, finalY)
    doc.text(formatCurrency(totals.taxAmount, currency), pageWidth - margin, finalY, { align: 'right' })
    finalY += 16
  }

  doc.setDrawColor(230)
  doc.line(totalsX, finalY, pageWidth - margin, finalY)
  finalY += 16

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(20)
  doc.text(t.grandTotal, totalsX, finalY)
  doc.text(formatCurrency(totals.grandTotal, currency), pageWidth - margin, finalY, { align: 'right' })

  finalY += 40

  // QR Code (public verification link) + notes/terms/payment info
  const publicUrl = `${window.location.origin}/invoice/${invoice.publicId}`
  const verifyColumnWidth = 100
  try {
    const qrDataUrl = await QRCode.toDataURL(publicUrl, { margin: 1, width: 200 })
    doc.addImage(qrDataUrl, 'PNG', margin, finalY, 80, 80)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(120)
    doc.text(t.scanToVerify, margin, finalY + 92, { maxWidth: verifyColumnWidth })
  } catch (e) {
    // ignore QR failure
  }

  const textX = margin + verifyColumnWidth + 30
  let ty = finalY
  doc.setFontSize(9)
  doc.setTextColor(60)

  const pageHeight = doc.internal.pageSize.getHeight()
  function ensureSpace(neededHeight) {
    if (ty + neededHeight > pageHeight - margin) {
      doc.addPage()
      ty = margin
    }
  }

  if (invoice.paymentInfo) {
    ensureSpace(44)
    doc.setFont('helvetica', 'bold')
    doc.text(t.paymentInformation, textX, ty)
    doc.setFont('helvetica', 'normal')
    ty += 14
    doc.text(String(invoice.paymentInfo), textX, ty, { maxWidth: pageWidth - textX - margin })
    ty += 30
  }
  if (invoice.qrisUrl) {
    try {
      const qrisData = await toDataURL(invoice.qrisUrl)
      ensureSpace(90)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(60)
      doc.text(t.qrisPayment, textX, ty)
      doc.addImage(qrisData, 'PNG', textX, ty + 8, 70, 70)
      ty += 90
    } catch (e) {
      // ignore QRIS image failure (e.g. unreadable data URL)
    }
  }
  if (invoice.notes) {
    ensureSpace(44)
    doc.setFont('helvetica', 'bold')
    doc.text(t.notes, textX, ty)
    doc.setFont('helvetica', 'normal')
    ty += 14
    doc.text(String(invoice.notes), textX, ty, { maxWidth: pageWidth - textX - margin })
    ty += 30
  }
  if (invoice.terms) {
    ensureSpace(44)
    doc.setFont('helvetica', 'bold')
    doc.text(t.terms, textX, ty)
    doc.setFont('helvetica', 'normal')
    ty += 14
    doc.text(String(invoice.terms), textX, ty, { maxWidth: pageWidth - textX - margin })
  }

  if (download) {
    doc.save(`${invoice.invoiceNumber || 'invoice'}.pdf`)
    return null
  }
  return doc.output('bloburl')
}

async function toDataURL(url) {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
