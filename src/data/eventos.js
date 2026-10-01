// Eventos fictícios do plantão atual (desde 19:00) e do anterior. Somente metadados.
import { LEITOS } from './hospital.js'
import { avaliar, FASES } from './estados.js'

// Segundos desde as 19:00 do início do plantão, para ordenar horários que passam da meia-noite.
export function ordemNoPlantao(horario) {
  const [h, m, s] = horario.split(':').map(Number)
  const seg = h * 3600 + m * 60 + s
  const inicio = 19 * 3600
  return seg >= inicio ? seg - inicio : seg + 24 * 3600 - inicio
}

// Probabilidades ilustrativas das quatro classes de movimento, somando 1.
export function probabilidades(estado, confianca) {
  if (!FASES.includes(estado) || confianca == null) return null
  const resto = Math.round((1 - confianca) * 100) / 100
  const vizinhas = {
    repouso: { sentando: 0.75, levantando: 0.2, queda: 0.05 },
    sentando: { levantando: 0.7, repouso: 0.25, queda: 0.05 },
    levantando: { sentando: 0.7, repouso: 0.25, queda: 0.05 },
    queda: { levantando: 0.7, sentando: 0.2, repouso: 0.1 },
  }[estado]
  const p = { [estado]: confianca }
  let soma = confianca
  const chaves = Object.keys(vizinhas)
  chaves.forEach((k, i) => {
    const v = i === chaves.length - 1 ? Math.round((1 - soma) * 100) / 100 : Math.round(resto * vizinhas[k] * 100) / 100
    p[k] = v
    soma += v
  })
  return p
}

function ev(id, horario, plantao, torre, numero, estado, confianca, tempoResposta, desfecho, opcoes = {}) {
  const leito = LEITOS[`${torre}-${numero}`]
  const atenuado = !!opcoes.atenuado
  const efeito = avaliar(estado, atenuado)
  const movimento = FASES.includes(estado)
  return {
    id,
    horario,
    plantao,
    ordem: ordemNoPlantao(horario),
    torre,
    posto: leito.posto,
    leito: leito.id,
    numero,
    estado,
    atenuado,
    origem: movimento ? 'modelo' : 'sistema',
    confianca: movimento ? confianca : null,
    canais: efeito.canais,
    tempoResposta,
    desfecho,
    bastidores: {
      pessoas: atenuado ? 2 : estado === 'fora' ? 0 : 1,
      pausado: false,
      limiar: leito.sensibilidade === 'alta' ? 0.55 : 0.7,
      probabilidades: probabilidades(estado, confianca),
    },
  }
}

export const EVENTOS_INICIAIS = [
  // Plantão atual
  ev('e01', '03:22:41', 'atual', 3, 308, 'sentando', 0.71, null, 'Retornou ao repouso'),
  ev('e02', '03:05:12', 'atual', 1, 205, 'sentando', 0.66, null, 'Retornou ao repouso'),
  ev('e03', '02:47:30', 'atual', 3, 315, 'levantando', 0.82, 41, 'Atendido em pré-queda'),
  ev('e04', '02:31:08', 'atual', 3, 318, 'sentando', 0.74, null, 'Registrado (atenuado)', { atenuado: true }),
  ev('e05', '02:12:55', 'atual', 4, 207, 'sentando', 0.62, 95, 'Falso alarme'),
  ev('e06', '01:58:19', 'atual', 2, 309, 'fora', null, 132, 'Retornou ao leito'),
  ev('e07', '01:40:03', 'atual', 3, 301, 'sentando', 0.69, null, 'Retornou ao repouso'),
  ev('e08', '01:12:30', 'atual', 2, 214, 'queda', 0.93, 48, 'Queda com atendimento'),
  ev('e09', '01:11:58', 'atual', 2, 214, 'levantando', 0.64, null, 'Evoluiu para queda'),
  ev('e10', '00:54:47', 'atual', 5, 304, 'sentando', 0.77, null, 'Retornou ao repouso'),
  ev('e11', '00:33:12', 'atual', 3, 310, 'levantando', 0.79, 37, 'Atendido em pré-queda'),
  ev('e12', '00:10:40', 'atual', 1, 312, 'sentando', 0.58, 70, 'Falso alarme'),
  ev('e13', '23:48:26', 'atual', 3, 305, 'sentando', 0.72, null, 'Retornou ao repouso'),
  ev('e14', '23:21:09', 'atual', 4, 315, 'sentando', 0.68, null, 'Registrado (atenuado)', { atenuado: true }),
  ev('e15', '22:57:44', 'atual', 3, 321, 'sentando', 0.75, 52, 'Atendido em pré-queda'),
  ev('e16', '22:30:17', 'atual', 5, 211, 'fora', null, 210, 'Retornou ao leito'),
  ev('e17', '21:46:02', 'atual', 2, 403, 'levantando', 0.85, 33, 'Atendido em pré-queda'),
  ev('e18', '21:05:38', 'atual', 3, 312, 'sentando', 0.73, null, 'Retornou ao repouso'),
  ev('e19', '20:22:51', 'atual', 1, 409, 'sentando', 0.61, null, 'Retornou ao repouso'),
  ev('e20', '19:41:14', 'atual', 3, 303, 'sentando', 0.67, null, 'Registrado (atenuado)', { atenuado: true }),
  // Plantão anterior
  ev('e21', '05:52:20', 'anterior', 3, 312, 'sentando', 0.7, null, 'Retornou ao repouso'),
  ev('e22', '04:36:09', 'anterior', 4, 302, 'levantando', 0.88, 29, 'Atendido em pré-queda'),
  ev('e23', '03:15:47', 'anterior', 3, 308, 'sentando', 0.65, 81, 'Falso alarme'),
  ev('e24', '02:20:33', 'anterior', 1, 215, 'fora', null, 176, 'Retornou ao leito'),
  ev('e25', '01:44:12', 'anterior', 5, 307, 'sentando', 0.76, null, 'Retornou ao repouso'),
  ev('e26', '00:58:50', 'anterior', 2, 220, 'levantando', 0.81, 44, 'Atendido em pré-queda'),
  ev('e27', '23:39:05', 'anterior', 3, 405, 'sentando', 0.63, null, 'Registrado (atenuado)', { atenuado: true }),
  ev('e28', '22:14:28', 'anterior', 4, 410, 'sentando', 0.69, null, 'Retornou ao repouso'),
  ev('e29', '21:02:16', 'anterior', 3, 315, 'levantando', 0.6, 102, 'Falso alarme'),
  ev('e30', '19:55:40', 'anterior', 5, 402, 'sentando', 0.72, null, 'Retornou ao repouso'),
]

export const DESFECHOS = [
  'Atendido em pré-queda',
  'Retornou ao repouso',
  'Retornou ao leito',
  'Registrado (atenuado)',
  'Falso alarme',
  'Evoluiu para queda',
  'Queda com atendimento',
]

// Ordem de exibição: plantão atual primeiro, mais recente no topo.
export function ordenarEventos(lista) {
  return [...lista].sort((a, b) => {
    if (a.plantao !== b.plantao) return a.plantao === 'atual' ? -1 : 1
    return b.ordem - a.ordem
  })
}

export { ev as criarEvento }
