import jsPDF from 'jspdf'
import { getContractLabels } from './i18n'

export function generateContractPdf(contract, { download = true } = {}) {
  const t = getContractLabels(contract.language)
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 50
  const maxWidth = pageWidth - margin * 2
  let y = 60

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(contract.title || t.defaultTitle, margin, y)
  y += 30

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(80)

  const lines = doc.splitTextToSize(contract.content || '', maxWidth)
  lines.forEach((line) => {
    if (y > pageHeight - 80) {
      doc.addPage()
      y = 60
    }
    doc.text(line, margin, y)
    y += 14
  })

  y += 20
  if (y > pageHeight - 120) {
    doc.addPage()
    y = 60
  }

  doc.setDrawColor(220)
  doc.line(margin, y, pageWidth - margin, y)
  y += 40

  doc.setFontSize(10)
  doc.text('_______________________', margin, y)
  doc.text('_______________________', pageWidth - margin - 180, y)
  y += 14
  doc.text(t.signatureProvider, margin, y)
  doc.text(t.signatureClient, pageWidth - margin - 180, y)

  y += 30
  doc.setFontSize(8)
  doc.setTextColor(140)
  doc.text(t.disclaimer, margin, y, { maxWidth })

  if (download) {
    doc.save(`${(contract.title || 'contract').replace(/\s+/g, '-').toLowerCase()}.pdf`)
    return null
  }
  return doc.output('bloburl')
}
