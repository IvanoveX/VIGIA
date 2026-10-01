// Leituras derivadas do estado global.
import { LEITOS, postoPorId } from '../data/hospital.js'
import { ESTADOS, FASES, avaliar } from '../data/estados.js'
import { criarEvento } from '../data/eventos.js'
import { horario } from '../lib/formato.js'

// Estado exibido, considerando pausas vencidas.
export function estadoVisivel(d, agora) {
  if (d.estado === 'pausado' && d.pausa && d.pausa.ate <= agora) return 'repouso'
  return d.estado
}

// Tom visual depois da atenuação: prioridade 3 é âmbar; só registro fica calmo.
export function tomEfetivo(estado, efeito) {
  if (!efeito.atenuado) return ESTADOS[estado].tom
  return efeito.prioridade === 3 ? 'ambar' : 'calmo'
}

export function situacao(state, id, agora) {
  const d = state.leitos[id]
  const estado = estadoVisivel(d, agora)
  const efeito = avaliar(estado, d.acompanhante)
  return { id, leito: LEITOS[id], d, estado, ...efeito, tom: tomEfetivo(estado, efeito) }
}

// Alertas de um conjunto de leitos, por prioridade e depois por tempo (mais antigo primeiro).
export function alertas(state, ids, agora) {
  const ativos = []
  const atenuados = []
  for (const id of ids) {
    if (!state.leitos[id]) continue
    const s = situacao(state, id, agora)
    if (s.prioridade != null) ativos.push(s)
    else if (s.registro) atenuados.push(s)
  }
  const inicio = (s) => s.d.primeiroSinal ?? s.d.desde
  ativos.sort((a, b) => a.prioridade - b.prioridade || inicio(a) - inicio(b))
  atenuados.sort((a, b) => inicio(a) - inicio(b))
  return { ativos, atenuados }
}

export function alertasDoPosto(state, postoId, agora) {
  return alertas(state, postoPorId(postoId).leitos, agora)
}

// Contador do seletor de torre: quantidade e tom do alerta mais grave.
export function alertasDaTorre(state, torre, agora) {
  const ids = Object.keys(state.leitos).filter((id) => LEITOS[id].torre === torre)
  const { ativos } = alertas(state, ids, agora)
  return { qtd: ativos.length, tom: ativos[0]?.tom }
}

// Evento mostrado nos Bastidores a partir do detalhe: o evento registrado ou o sinal em andamento.
export function eventoDoLeito(state, id, agora) {
  const d = state.leitos[id]
  const l = LEITOS[id]
  if (d.atendido) {
    const salvo = state.eventos.find((e) => e.id === d.atendido.eventoId)
    if (salvo) return salvo
  }
  const sinal = d.primeiroSinal != null && FASES.includes(d.estado) && d.estado !== 'repouso'
  const estado = sinal ? d.estado : 'repouso'
  const efeito = avaliar(estado, d.acompanhante)
  const desfecho = !sinal ? 'Sem alerta' : efeito.registro ? 'Registrado (atenuado)' : 'Aguardando atendimento'
  const ev = criarEvento('detalhe', horario(sinal ? d.primeiroSinal : agora), 'atual', l.torre, l.numero, estado, sinal ? d.confianca : 0.92, null, desfecho, {
    atenuado: efeito.atenuado,
  })
  return { ...ev, bastidores: { ...ev.bastidores, pausado: d.estado === 'pausado' } }
}
