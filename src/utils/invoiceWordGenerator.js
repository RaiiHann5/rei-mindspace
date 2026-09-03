import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, ImageRun, BorderStyle } from 'docx'
import { formatCurrency } from './formatCurrency'
import { formatDate } from './dateUtils'
import { calcTotals, effectiveStatus } from './invoiceCalculations'
import { getInvoiceLabels } from './i18n'

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

async function dataUrlToImage(dataUrl) {
  try {
    const res = await fetch(dataUrl)
    const buf = await res.arrayBuffer()
    const mimeMatch = /data:image\/(\w+);/.exec(dataUrl)
    const ext = (mimeMatch?.[1] || 'png').toLowerCase()
    const type = ext === 'jpeg' ? 'jpg' : ext
    return { data: new Uint8Array(buf), type: ['png', 'jpg', 'gif', 'bmp'].includes(type) ? type : 'png' }
  } catch (e) {
    return null
  }
}

const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
const cellBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }

function cell(text, { bold = false, align = AlignmentType.LEFT, size = 18, color, width } = {}) {
  return new TableCell({
    borders: cellBorders,
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    children: [new Paragraph({ alignment: align, children: [new TextRun({ text: String(text ?? ''), bold, size, color })] })],
  })
}

export async function generateInvoiceWord(invoice, { download = true } = {}) {
  const language = invoice.language || 'en'
  const t = getInvoiceLabels(language)
  const { businessInfo = {}, clientInfo = {}, items = [], currency = 'USD' } = invoice
  const totals = calcTotals(invoice)
  const status = effectiveStatus(invoice)

  const children = []

  // Header row: business info | invoice title
  const logo = businessInfo.logoUrl ? await dataUrlToImage(businessInfo.logoUrl) : null
  const businessNameRuns = [new TextRun({ text: businessInfo.businessName || t.yourBusiness, bold: true, size: 26 })]

  const headerLeftChildren = []
  if (logo) {
    headerLeftChildren.push(new Paragraph({ spacing: { after: 100 }, children: [new ImageRun({ data: logo.data, type: logo.type, transformation: { width: 56, height: 56 } })] }))
  }
  headerLeftChildren.push(new Paragraph({ children: businessNameRuns }))
  ;[businessInfo.email, businessInfo.phone, businessInfo.address].filter(Boolean).forEach((line) => {
    headerLeftChildren.push(new Paragraph({ children: [new TextRun({ text: String(line), size: 18, color: '666666' })] }))
  })

  const headerRightChildren = [
    new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: t.documentTitle, bold: true, size: 36 })] }),
    new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `#${invoice.invoiceNumber || ''}`, size: 18, color: '666666' })] }),
    new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${t.status[status] || status}`, size: 18, color: '666666' })] }),
  ]

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder },
      rows: [
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, width: { size: 55, type: WidthType.PERCENTAGE }, children: headerLeftChildren }),
            new TableCell({ borders: cellBorders, width: { size: 45, type: WidthType.PERCENTAGE }, children: headerRightChildren }),
          ],
        }),
      ],
    }),
    new Paragraph({ spacing: { before: 300, after: 300 }, border: { bottom: { color: 'E5E7EB', space: 4, style: 'single', size: 6 } }, children: [] }),
  )

  // Bill to / dates
  const billToChildren = [
    new Paragraph({ children: [new TextRun({ text: t.billTo, bold: true, size: 16, color: '999999' })] }),
    new Paragraph({ children: [new TextRun({ text: clientInfo.name || '-', size: 20 })] }),
  ]
  if (clientInfo.company) billToChildren.push(new Paragraph({ children: [new TextRun({ text: clientInfo.company, size: 18, color: '666666' })] }))
  if (clientInfo.email) billToChildren.push(new Paragraph({ children: [new TextRun({ text: clientInfo.email, size: 18, color: '666666' })] }))
  if (clientInfo.address) billToChildren.push(new Paragraph({ children: [new TextRun({ text: clientInfo.address, size: 18, color: '666666' })] }))

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder },
      rows: [
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, width: { size: 40, type: WidthType.PERCENTAGE }, children: billToChildren }),
            new TableCell({
              borders: cellBorders,
              width: { size: 30, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({ children: [new TextRun({ text: t.issueDate, bold: true, size: 16, color: '999999' })] }),
                new Paragraph({ children: [new TextRun({ text: formatDate(invoice.issueDate, language), size: 20 })] }),
              ],
            }),
            new TableCell({
              borders: cellBorders,
              width: { size: 30, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({ children: [new TextRun({ text: t.dueDate, bold: true, size: 16, color: '999999' })] }),
                new Paragraph({ children: [new TextRun({ text: formatDate(invoice.dueDate, language), size: 20 })] }),
              ],
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ spacing: { before: 300, after: 200 }, children: [] }),
  )

  // Items table
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      cell(t.item, { bold: true, size: 18, width: 25 }),
      cell(t.description, { bold: true, size: 18, width: 30 }),
      cell(t.qty, { bold: true, size: 18, align: AlignmentType.RIGHT, width: 10 }),
      cell(t.price, { bold: true, size: 18, align: AlignmentType.RIGHT, width: 15 }),
      cell(t.total, { bold: true, size: 18, align: AlignmentType.RIGHT, width: 20 }),
    ],
  })
  const itemRows = items.map((it) => new TableRow({
    children: [
      cell(it.name || '-', { width: 25 }),
      cell(it.description || '', { width: 30, color: '666666' }),
      cell(String(it.quantity || 0), { align: AlignmentType.RIGHT, width: 10 }),
      cell(formatCurrency(it.price, currency), { align: AlignmentType.RIGHT, width: 15 }),
      cell(formatCurrency(Number(it.quantity || 0) * Number(it.price || 0), currency), { align: AlignmentType.RIGHT, width: 20, bold: true }),
    ],
  }))

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: 'E5E7EB' },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E5E7EB' },
        left: noBorder,
        right: noBorder,
        insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'F1F5F9' },
        insideVertical: noBorder,
      },
      rows: [headerRow, ...itemRows],
    }),
    new Paragraph({ spacing: { before: 300 }, children: [] }),
  )

  // Totals
  function totalRow(label, value, { bold = false } = {}) {
    return new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 80 },
      tabStops: [{ type: 'right', position: 9000 }],
      children: [new TextRun({ text: `${label}:  `, size: bold ? 22 : 18, bold, color: bold ? undefined : '666666' }), new TextRun({ text: value, size: bold ? 22 : 18, bold })],
    })
  }

  children.push(totalRow(t.subtotal, formatCurrency(totals.subtotal, currency)))
  if (totals.discountAmount > 0) children.push(totalRow(t.discount, `-${formatCurrency(totals.discountAmount, currency)}`))
  if (totals.taxAmount > 0) children.push(totalRow(t.tax, formatCurrency(totals.taxAmount, currency)))
  children.push(totalRow(t.grandTotal, formatCurrency(totals.grandTotal, currency), { bold: true }))

  children.push(new Paragraph({ spacing: { before: 300, after: 200 }, border: { top: { color: 'E5E7EB', space: 4, style: 'single', size: 6 } }, children: [] }))

  if (invoice.paymentInfo) {
    children.push(
      new Paragraph({ children: [new TextRun({ text: t.paymentInformation, bold: true, size: 18 })] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: String(invoice.paymentInfo), size: 18, color: '666666' })] }),
    )
  }
  if (invoice.qrisUrl) {
    const qris = await dataUrlToImage(invoice.qrisUrl)
    if (qris) {
      children.push(
        new Paragraph({ children: [new TextRun({ text: t.qrisPayment, bold: true, size: 18 })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new ImageRun({ data: qris.data, type: qris.type, transformation: { width: 90, height: 90 } })] }),
      )
    }
  }
  if (invoice.notes) {
    children.push(
      new Paragraph({ children: [new TextRun({ text: t.notes, bold: true, size: 18 })] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: String(invoice.notes), size: 18, color: '666666' })] }),
    )
  }
  if (invoice.terms) {
    children.push(
      new Paragraph({ children: [new TextRun({ text: t.terms, bold: true, size: 18 })] }),
      new Paragraph({ children: [new TextRun({ text: String(invoice.terms), size: 18, color: '666666' })] }),
    )
  }

  const doc = new Document({ sections: [{ properties: {}, children }] })
  const blob = await Packer.toBlob(doc)
  const filename = `${invoice.invoiceNumber || 'invoice'}.docx`

  if (download) {
    saveBlob(blob, filename)
    return null
  }
  return blob
}
