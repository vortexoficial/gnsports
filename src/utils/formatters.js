export function formatCurrency(value) {
  const number = Number(value || 0)

  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatCurrencyNoCents(value) {
  const number = Number(value || 0)

  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })
}

export function formatNumber(value, digits = 0) {
  if (value === null || value === undefined || value === '') return '-'
  return Number(value).toLocaleString('pt-BR', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })
}

export function getProductTypeLabel(type) {
  const labels = {
    suplemento: 'Camisa de time',
    vestuario: 'Moda esportiva',
    acessorio: 'Acessório',
    outro: 'Outro',
  }

  return labels[type] || type || 'Produto'
}

export function splitByComma(value) {
  if (Array.isArray(value)) return value

  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}
