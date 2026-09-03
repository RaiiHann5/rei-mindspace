import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import { getContractLabels } from './i18n'

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

export async function generateContractWord(contract, { download = true } = {}) {
  const t = getContractLabels(contract.language)
  const title = contract.title || t.defaultTitle
  const bodyLines = String(contract.content || '').split('\n')

  const children = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
      children: [new TextRun({ text: title, bold: true, size: 32 })],
    }),
  ]

  bodyLines.forEach((line) => {
    const trimmed = line.trim()
    const isHeading = /^\d+\.\s/.test(trimmed) || trimmed === '---'
    if (trimmed === '---') return
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: line || ' ', bold: isHeading, size: isHeading ? 22 : 21 })],
      }),
    )
  })

  children.push(
    new Paragraph({ spacing: { before: 400, after: 400 }, border: { top: { color: 'CCCCCC', space: 1, style: 'single', size: 6 } }, children: [] }),
    new Paragraph({
      spacing: { after: 600 },
      tabStops: [{ type: 'right', position: 9000 }],
      children: [
        new TextRun({ text: '_______________________\t_______________________', size: 20 }),
      ],
    }),
    new Paragraph({
      tabStops: [{ type: 'right', position: 9000 }],
      children: [
        new TextRun({ text: `${t.signatureProvider}\t${t.signatureClient}`, size: 18 }),
      ],
    }),
    new Paragraph({
      spacing: { before: 400 },
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text: t.disclaimer, italics: true, size: 16, color: '888888' })],
    }),
  )

  const doc = new Document({
    sections: [{ properties: {}, children }],
  })

  const blob = await Packer.toBlob(doc)
  const filename = `${(contract.title || 'contract').replace(/\s+/g, '-').toLowerCase()}.docx`

  if (download) {
    saveBlob(blob, filename)
    return null
  }
  return blob
}
