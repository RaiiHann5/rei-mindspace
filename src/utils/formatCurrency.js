const SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  IDR: 'Rp',
  SGD: 'S$',
  MYR: 'RM',
  AUD: 'A$',
  JPY: '¥',
}

export function formatCurrency(amount, currency = 'USD') {
  const value = Number(amount || 0)
  if (currency === 'IDR' || currency === 'JPY') {
    return `${SYMBOLS[currency] || currency + ' '}${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }
  return `${SYMBOLS[currency] || currency + ' '}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'IDR', 'SGD', 'MYR', 'AUD', 'JPY']
