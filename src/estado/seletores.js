// Leituras derivadas do estado global.
import { LEITOS, postoPorId } from '../data/hospital.js'
import { avaliar } from '../data/estados.js'

// Estado exibido, considerando pausas vencidas.
export function estadoVisivel(d, agora) {
  if (d.estado === 'pausado' && d.pausa && d.pausa.ate <= agora) return 'repouso'
  return d.estado
}

// Alertas de um conjunto de leitos, ordenados por prioridade e depois por tempo (mais antigo primeiro).
export function alertas(state, ids, agora) {
  const ativos = []
  const atenuados = []
  for (const id of ids) {
    const d = state.leitos[id]
    if (!d) continue
    const estado = estadoVisivel(d, agora)
    const efeito = avaliar(estado, d.acompanhante)
    const item = { id, leito: LEITOS[id], d, estado, ...efeito }
    if (efeito.prioridade != null) ativos.push(item)
    else if (efeito.registro) atenuados.push(item)
  }
  const ordem = (a, b) => a.prioridade - b.prioridade || a.d.desde - b.d.desde
  ativos.sort(ordem)
  atenuados.sort((a, b) => a.d.desde - b.d.desde)
  return { ativos, atenuados }
}

export function alertasDoPosto(state, postoId, agora) {
  return alertas(state, postoPorId(postoId).leitos, agora)
}

export function alertasDaTorre(state, torre, agora) {
  const ids = Object.keys(state.leitos).filter((id) => LEITOS[id].torre === torre)
  return alertas(state, ids, agora).ativos.length
}
