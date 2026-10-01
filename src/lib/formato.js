// Formatação em pt-BR: "0,87", "03:41:07", "00:21".

export const INICIO_RELOGIO = 3 * 3600 + 40 * 60 // 03:40:00

const dois = (n) => String(n).padStart(2, '0')

export function horario(segundos) {
  const s = ((Math.floor(segundos) % 86400) + 86400) % 86400
  return `${dois(Math.floor(s / 3600))}:${dois(Math.floor((s % 3600) / 60))}:${dois(s % 60)}`
}

export function duracao(segundos) {
  const s = Math.max(0, Math.floor(segundos))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}:${dois(m)}:${dois(s % 60)}` : `${dois(m)}:${dois(s % 60)}`
}

export function decimal(valor, casas = 2) {
  return valor.toFixed(casas).replace('.', ',')
}

export function minutosRestantes(segundos) {
  const m = Math.ceil(Math.max(0, segundos) / 60)
  return m === 1 ? '1 min' : `${m} min`
}
