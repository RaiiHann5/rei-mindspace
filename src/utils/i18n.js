// Lightweight i18n for document content (invoices & contracts).
// This deliberately only covers the *document* text (what ends up on the
// printed/exported invoice or contract) - not the whole dashboard UI.

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Bahasa Indonesia' },
]

export const invoiceLabels = {
  en: {
    documentTitle: 'INVOICE',
    status: { draft: 'Draft', unpaid: 'Unpaid', paid: 'Paid', overdue: 'Overdue' },
    billTo: 'Bill To',
    issueDate: 'Issue Date',
    dueDate: 'Due Date',
    item: 'Item',
    description: 'Description',
    qty: 'Qty',
    price: 'Price',
    total: 'Total',
    subtotal: 'Subtotal',
    discount: 'Discount',
    tax: 'Tax',
    grandTotal: 'Grand Total',
    paymentInformation: 'Payment Information',
    qrisPayment: 'Scan to Pay (QRIS)',
    notes: 'Notes',
    terms: 'Terms & Conditions',
    scanToVerify: 'Scan to verify this invoice online',
    yourBusiness: 'Your Business',
    verifiedInvoice: 'Verified Invoice',
    business: 'Business',
    invoiceNumber: 'Invoice Number',
    client: 'Client',
    items: 'Items',
    totalAmount: 'Total Amount',
    verifiesText: (name) => `This page confirms the invoice details as issued by ${name} via TeraSync.`,
  },
  id: {
    documentTitle: 'FAKTUR',
    status: { draft: 'Draf', unpaid: 'Belum Dibayar', paid: 'Lunas', overdue: 'Terlambat' },
    billTo: 'Ditagihkan Kepada',
    issueDate: 'Tanggal Terbit',
    dueDate: 'Jatuh Tempo',
    item: 'Item',
    description: 'Deskripsi',
    qty: 'Jml',
    price: 'Harga',
    total: 'Total',
    subtotal: 'Subtotal',
    discount: 'Diskon',
    tax: 'Pajak',
    grandTotal: 'Total Keseluruhan',
    paymentInformation: 'Informasi Pembayaran',
    qrisPayment: 'Pindai untuk Bayar (QRIS)',
    notes: 'Catatan',
    terms: 'Syarat & Ketentuan',
    scanToVerify: 'Pindai untuk memverifikasi faktur ini secara online',
    yourBusiness: 'Nama Usaha Anda',
    verifiedInvoice: 'Faktur Terverifikasi',
    business: 'Usaha',
    invoiceNumber: 'Nomor Faktur',
    client: 'Klien',
    items: 'Item',
    totalAmount: 'Jumlah Total',
    verifiesText: (name) => `Halaman ini mengonfirmasi detail faktur yang diterbitkan oleh ${name} melalui TeraSync.`,
  },
}

export function getInvoiceLabels(language) {
  return invoiceLabels[language] || invoiceLabels.en
}

export const contractLabels = {
  en: {
    defaultTitle: 'Service Agreement',
    signatureProvider: 'Service Provider Signature',
    signatureClient: 'Client Signature',
    disclaimer: 'This contract template is provided for general informational purposes and does not constitute legal advice.',
    contract: 'CONTRACT',
    between: 'Between',
    and: 'And',
    serviceProvider: 'Service Provider',
    client: 'Client',
    project: 'Project',
    sections: {
      scopeOfWork: '1. SCOPE OF WORK',
      projectPrice: '2. PROJECT PRICE',
      paymentTerms: '3. PAYMENT TERMS',
      timeline: '4. TIMELINE',
      revisionPolicy: '5. REVISION POLICY',
      cancellationTerms: '6. CANCELLATION TERMS',
      additionalTerms: '7. ADDITIONAL TERMS',
    },
    startDate: 'Start Date',
    deadline: 'Deadline',
  },
  id: {
    defaultTitle: 'Perjanjian Jasa',
    signatureProvider: 'Tanda Tangan Penyedia Jasa',
    signatureClient: 'Tanda Tangan Klien',
    disclaimer: 'Templat kontrak ini disediakan untuk tujuan informasi umum dan bukan merupakan nasihat hukum.',
    contract: 'KONTRAK',
    between: 'Antara',
    and: 'Dan',
    serviceProvider: 'Penyedia Jasa',
    client: 'Klien',
    project: 'Proyek',
    sections: {
      scopeOfWork: '1. RUANG LINGKUP PEKERJAAN',
      projectPrice: '2. HARGA PROYEK',
      paymentTerms: '3. SYARAT PEMBAYARAN',
      timeline: '4. JADWAL',
      revisionPolicy: '5. KEBIJAKAN REVISI',
      cancellationTerms: '6. SYARAT PEMBATALAN',
      additionalTerms: '7. KETENTUAN TAMBAHAN',
    },
    startDate: 'Tanggal Mulai',
    deadline: 'Tenggat Waktu',
  },
}

export function getContractLabels(language) {
  return contractLabels[language] || contractLabels.en
}
