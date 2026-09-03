import { getContractLabels } from './i18n'

export const CONTRACT_TEMPLATES = [
  {
    id: 'web-development',
    name: 'Web Development Agreement',
    description: 'For building websites, web apps, or ongoing web dev work.',
    scopeOfWork: 'Design, development, testing, and deployment of a website/web application as described by the Client, including up to the agreed number of pages/features and basic responsive design.',
    revisionPolicy: 'Up to 2 rounds of revisions are included. Additional revisions will be billed at the agreed hourly rate.',
    cancellationTerms: 'Either party may terminate this agreement with 14 days written notice. Work completed up to the termination date will be billed pro-rata.',
    additionalTerms: 'Client will provide necessary content, assets, and access (hosting/domain) in a timely manner. Delays in providing materials may extend the project timeline accordingly.',
    id_name: 'Perjanjian Pengembangan Web',
    id_description: 'Untuk pembuatan situs web, aplikasi web, atau pekerjaan web berkelanjutan.',
    id_scopeOfWork: 'Desain, pengembangan, pengujian, dan implementasi (deployment) sebuah situs web/aplikasi web sesuai kebutuhan Klien, termasuk hingga jumlah halaman/fitur yang disepakati dan desain responsif dasar.',
    id_revisionPolicy: 'Termasuk hingga 2 kali revisi. Revisi tambahan akan dikenakan biaya sesuai tarif per jam yang disepakati.',
    id_cancellationTerms: 'Salah satu pihak dapat mengakhiri perjanjian ini dengan pemberitahuan tertulis 14 hari sebelumnya. Pekerjaan yang telah diselesaikan hingga tanggal pengakhiran akan ditagih secara proporsional.',
    id_additionalTerms: 'Klien wajib menyediakan konten, aset, dan akses (hosting/domain) yang diperlukan secara tepat waktu. Keterlambatan penyediaan materi dapat memperpanjang jadwal proyek.',
  },
  {
    id: 'freelance',
    name: 'Freelance Agreement',
    description: 'General-purpose freelance services agreement.',
    scopeOfWork: 'Freelancer will provide the services described by the Client under the agreed scope, timeline, and deliverables outlined in this contract.',
    revisionPolicy: 'Up to 2 rounds of reasonable revisions are included within the original scope of work.',
    cancellationTerms: 'This agreement may be cancelled by either party with 7 days written notice. Any completed work will be compensated accordingly.',
    additionalTerms: 'Freelancer retains the right to showcase completed work in their portfolio unless otherwise agreed in writing.',
    id_name: 'Perjanjian Freelance',
    id_description: 'Perjanjian jasa freelance untuk keperluan umum.',
    id_scopeOfWork: 'Freelancer akan menyediakan jasa sesuai deskripsi Klien dalam ruang lingkup, jadwal, dan hasil kerja (deliverables) yang disepakati dalam kontrak ini.',
    id_revisionPolicy: 'Termasuk hingga 2 kali revisi yang wajar dalam ruang lingkup pekerjaan awal.',
    id_cancellationTerms: 'Perjanjian ini dapat dibatalkan oleh salah satu pihak dengan pemberitahuan tertulis 7 hari sebelumnya. Pekerjaan yang telah diselesaikan akan tetap dibayarkan.',
    id_additionalTerms: 'Freelancer berhak menampilkan hasil pekerjaan yang telah selesai dalam portofolionya, kecuali disepakati lain secara tertulis.',
  },
  {
    id: 'design',
    name: 'Design Service Agreement',
    description: 'For graphic design, branding, or UI/UX projects.',
    scopeOfWork: 'Design services including concept development, drafts, and final deliverables in the agreed file formats (e.g. brand identity, UI mockups, marketing assets).',
    revisionPolicy: 'Up to 3 rounds of revisions are included. Major scope changes may be treated as a new project.',
    cancellationTerms: 'Either party may cancel with 7 days written notice. A kill fee of 25% of the project price applies if cancelled after design work has begun.',
    additionalTerms: 'Final source files will be delivered upon full payment. Until payment is received, all deliverables remain the property of the Freelancer/Business.',
    id_name: 'Perjanjian Jasa Desain',
    id_description: 'Untuk proyek desain grafis, branding, atau UI/UX.',
    id_scopeOfWork: 'Jasa desain meliputi pengembangan konsep, draf, dan hasil akhir dalam format file yang disepakati (misalnya identitas merek, mockup UI, aset pemasaran).',
    id_revisionPolicy: 'Termasuk hingga 3 kali revisi. Perubahan ruang lingkup yang besar dapat dianggap sebagai proyek baru.',
    id_cancellationTerms: 'Salah satu pihak dapat membatalkan dengan pemberitahuan tertulis 7 hari sebelumnya. Biaya pembatalan (kill fee) sebesar 25% dari harga proyek berlaku jika dibatalkan setelah pekerjaan desain dimulai.',
    id_additionalTerms: 'File sumber akhir akan diberikan setelah pembayaran lunas. Sebelum pembayaran diterima, seluruh hasil kerja tetap menjadi milik Freelancer/Usaha.',
  },
  {
    id: 'general-service',
    name: 'General Service Agreement',
    description: 'Flexible template for any other type of service engagement.',
    scopeOfWork: 'Services to be provided as described by the Client, including agreed deliverables, milestones, and timeline.',
    revisionPolicy: 'Revisions beyond the agreed scope will be billed separately at the agreed rate.',
    cancellationTerms: 'This agreement may be terminated by either party with written notice as agreed by both parties.',
    additionalTerms: 'Any additional terms specific to this engagement should be listed here.',
    id_name: 'Perjanjian Jasa Umum',
    id_description: 'Templat fleksibel untuk jenis kerja sama jasa lainnya.',
    id_scopeOfWork: 'Jasa akan diberikan sesuai deskripsi Klien, termasuk hasil kerja, milestone, dan jadwal yang disepakati.',
    id_revisionPolicy: 'Revisi di luar ruang lingkup yang disepakati akan ditagih terpisah sesuai tarif yang disepakati.',
    id_cancellationTerms: 'Perjanjian ini dapat diakhiri oleh salah satu pihak dengan pemberitahuan tertulis sesuai kesepakatan kedua belah pihak.',
    id_additionalTerms: 'Ketentuan tambahan khusus untuk kerja sama ini dapat dicantumkan di sini.',
  },
]

export function getTemplateById(id) {
  return CONTRACT_TEMPLATES.find((t) => t.id === id) || CONTRACT_TEMPLATES[3]
}

// Returns the template's fields (name/scope/revision/cancellation/additional)
// localized for the given language ('en' | 'id').
export function getLocalizedTemplate(id, language = 'en') {
  const tpl = getTemplateById(id)
  if (language === 'id') {
    return {
      id: tpl.id,
      name: tpl.id_name || tpl.name,
      description: tpl.id_description || tpl.description,
      scopeOfWork: tpl.id_scopeOfWork || tpl.scopeOfWork,
      revisionPolicy: tpl.id_revisionPolicy || tpl.revisionPolicy,
      cancellationTerms: tpl.id_cancellationTerms || tpl.cancellationTerms,
      additionalTerms: tpl.id_additionalTerms || tpl.additionalTerms,
    }
  }
  return {
    id: tpl.id,
    name: tpl.name,
    description: tpl.description,
    scopeOfWork: tpl.scopeOfWork,
    revisionPolicy: tpl.revisionPolicy,
    cancellationTerms: tpl.cancellationTerms,
    additionalTerms: tpl.additionalTerms,
  }
}

// Swaps the fixed skeleton labels of an already-generated contract
// (section headers, "Between:"/"And:" lines, disclaimer, etc.) from
// one language to the other, while leaving everything the user typed
// or edited untouched. This is what makes the language toggle on an
// existing (saved) contract actually change the visible text - before
// this, switching the toggle only changed the `language` field used
// for the disclaimer, not the body, which is why it looked broken.
export function relocalizeContractContent(content, fromLanguage, toLanguage) {
  if (!content || fromLanguage === toLanguage) return content
  const from = getContractLabels(fromLanguage)
  const to = getContractLabels(toLanguage)
  let result = content

  function replaceLineLabel(fromLabel, toLabel) {
    if (!fromLabel || fromLabel === toLabel) return
    const escaped = fromLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(new RegExp(`^${escaped}:`, 'm'), `${toLabel}:`)
  }

  function replaceExactLine(fromLabel, toLabel) {
    if (!fromLabel || fromLabel === toLabel) return
    const escaped = fromLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(new RegExp(`^${escaped}$`, 'm'), toLabel)
  }

  // "CONTRACT: <title>" / "Between: ..." / "And: ..." / "Project: ..."
  replaceLineLabel(from.contract, to.contract)
  replaceLineLabel(from.between, to.between)
  replaceLineLabel(from.and, to.and)
  replaceLineLabel(from.project, to.project)
  replaceLineLabel(from.startDate, to.startDate)
  replaceLineLabel(from.deadline, to.deadline)

  // Section headers, e.g. "1. SCOPE OF WORK" -> "1. RUANG LINGKUP PEKERJAAN"
  Object.keys(from.sections).forEach((key) => {
    replaceExactLine(from.sections[key], to.sections[key])
  })

  // Parenthetical role labels: ("Service Provider") / ("Client")
  if (from.serviceProvider !== to.serviceProvider) {
    result = result.split(`("${from.serviceProvider}")`).join(`("${to.serviceProvider}")`)
  }
  if (from.client !== to.client) {
    result = result.split(`("${from.client}")`).join(`("${to.client}")`)
  }

  // Placeholder text shown when a field was left empty
  const fromBusinessPlaceholder = fromLanguage === 'id' ? '[Nama Usaha/Freelancer]' : '[Business/Freelancer Name]'
  const toBusinessPlaceholder = toLanguage === 'id' ? '[Nama Usaha/Freelancer]' : '[Business/Freelancer Name]'
  const fromClientPlaceholder = fromLanguage === 'id' ? '[Nama Klien]' : '[Client Name]'
  const toClientPlaceholder = toLanguage === 'id' ? '[Nama Klien]' : '[Client Name]'
  result = result.split(fromBusinessPlaceholder).join(toBusinessPlaceholder)
  result = result.split(fromClientPlaceholder).join(toClientPlaceholder)

  // Default title, if the user never customized it
  if (from.defaultTitle !== to.defaultTitle) {
    result = result.split(from.defaultTitle).join(to.defaultTitle)
  }

  // Trailing disclaimer line
  if (from.disclaimer !== to.disclaimer) {
    result = result.split(from.disclaimer).join(to.disclaimer)
  }

  return result
}

export function buildContractContent(form, language = 'en') {
  const t = getContractLabels(language)
  const businessPlaceholder = language === 'id' ? '[Nama Usaha/Freelancer]' : '[Business/Freelancer Name]'
  const clientPlaceholder = language === 'id' ? '[Nama Klien]' : '[Client Name]'

  return `${t.contract}: ${form.title || t.defaultTitle}

${t.between}: ${form.businessName || businessPlaceholder} ("${t.serviceProvider}")
${t.and}: ${form.clientName || clientPlaceholder} ("${t.client}")

${t.project}: ${form.projectName || '-'}

${t.sections.scopeOfWork}
${form.scopeOfWork || '-'}

${t.sections.projectPrice}
${form.projectPrice || '-'}

${t.sections.paymentTerms}
${form.paymentTerms || '-'}

${t.sections.timeline}
${t.startDate}: ${form.startDate || '-'}
${t.deadline}: ${form.deadline || '-'}

${t.sections.revisionPolicy}
${form.revisionPolicy || '-'}

${t.sections.cancellationTerms}
${form.cancellationTerms || '-'}

${t.sections.additionalTerms}
${form.additionalTerms || '-'}

---
${t.disclaimer}`
}
