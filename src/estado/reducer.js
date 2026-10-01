// Estado global da demonstração. Toda ação recebe `t`: o horário simulado em segundos.
import { LEITOS, POSTOS, INICIAL } from '../data/hospital.js'
import { ESTADOS, FASES, avaliar } from '../data/estados.js'
import { EVENTOS_INICIAIS, criarEvento } from '../data/eventos.js'
import { ETAPAS, TOTAL_ETAPAS } from '../data/cenario.js'
import { INICIO_RELOGIO, horario } from '../lib/formato.js'

const T0 = INICIO_RELOGIO

function leitoCalmo(desde) {
  return {
    estado: 'repouso',
    desde,
    acompanhante: false,
    confianca: null,
    primeiroSinal: null,
    pico: null,
    notificacoes: [],
    linha: [{ estado: 'repouso', t: desde - 120, atenuado: false }],
    marcadores: [],
    aCaminho: null,
    atendido: null,
    pausa: null,
    tecnicaAte: null,
  }
}

function leitosIniciais() {
  const leitos = {}
  Object.values(LEITOS).forEach((l, i) => {
    if (!l.monitorado) return
    // Tempos de repouso variados e determinísticos.
    leitos[l.id] = leitoCalmo(T0 - 600 - ((i * 397) % 3000))
  })
  leitos['3-318'].acompanhante = true
  leitos['3-321'] = { ...leitos['3-321'], estado: 'pausado', desde: T0 - 180, pausa: { motivo: 'banho', ate: T0 + 12 * 60 } }
  leitos['3-303'] = { ...leitos['3-303'], estado: 'sem_sinal', desde: T0 - 120 }
  // Um único alerta âmbar em outra torre, para o contador do seletor fazer sentido.
  const outro = POSTOS.find((p) => p.id === 't1-a2').leitos.find((id) => LEITOS[id].monitorado)
  leitos[outro] = mudarEstado(leitos[outro], 'sentando', T0 - 95, 0.71)
  return leitos
}

export function criarEstadoInicial() {
  return {
    aba: 'painel',
    torre: INICIAL.torre,
    posto: INICIAL.posto,
    leitoAberto: null,
    mostrarTodos: false,
    etapa: 0,
    fimCenario: false,
    leitos: leitosIniciais(),
    eventos: EVENTOS_INICIAIS,
    bastidores: null,
    dica: null,
    celular: null,
    contador: 0,
    filtros: { torre: 'todas', plantao: 'atual', origem: 'todas', desfecho: 'todos' },
  }
}

// Aplica uma mudança de estado a um leito, registrando linha do tempo e notificações.
export function mudarEstado(d, novo, t, confianca = null) {
  const efeito = avaliar(novo, d.acompanhante)
  const alerta = FASES.includes(novo) && novo !== 'repouso'
  const novoSinal = alerta && (!d.primeiroSinal || !!d.atendido)
  const r = {
    ...d,
    estado: novo,
    desde: t,
    confianca,
    linha: [...d.linha, { estado: novo, t, atenuado: efeito.atenuado }],
  }
  if (novoSinal) {
    r.primeiroSinal = t
    r.notificacoes = []
    r.marcadores = []
    r.aCaminho = null
    r.atendido = null
    r.pico = null
  }
  if (alerta) {
    if (!r.pico || FASES.indexOf(novo) > FASES.indexOf(r.pico)) r.pico = novo
    const avisos = []
    if (efeito.canais.includes('painel')) avisos.push({ canal: 'painel', t })
    if (efeito.canais.includes('celular')) avisos.push({ canal: 'celular', t: t + 4 })
    r.notificacoes = [...r.notificacoes, ...avisos]
    r.marcadores = [...r.marcadores, ...avisos.map((a) => ({ tipo: 'notificacao', canal: a.canal, t: a.t }))]
  }
  return r
}

function registrarEvento(state, leitoId, estadoEvento, d, t, desfecho, tempoResposta) {
  const l = LEITOS[leitoId]
  state.contador += 1
  const e = criarEvento(`c${state.contador}`, horario(t), 'atual', l.torre, l.numero, estadoEvento, d.confianca, tempoResposta, desfecho, {
    atenuado: d.acompanhante && !!ESTADOS[estadoEvento].atenuacao,
  })
  return { ...e, criadoNaDemo: true }
}

// Encerra o sinal em andamento (Atendido ou Falso alarme).
function encerrar(state, leitoId, t, desfecho) {
  const d = state.leitos[leitoId]
  if (!d || !d.primeiroSinal || d.atendido) return state
  const s = { ...state }
  const pico = d.pico || d.estado
  const tempo = t - d.primeiroSinal
  const desfechoFinal = desfecho === 'Atendido' ? (pico === 'queda' ? 'Queda com atendimento' : 'Atendido em pré-queda') : desfecho
  const evento = registrarEvento(s, leitoId, pico, { ...d, confianca: d.confianca }, d.primeiroSinal, desfechoFinal, tempo)
  const atendido = desfecho === 'Atendido'
  s.eventos = [evento, ...s.eventos]
  s.leitos = {
    ...s.leitos,
    [leitoId]: {
      ...d,
      estado: 'repouso',
      desde: t,
      confianca: null,
      linha: [...d.linha, { estado: 'repouso', t, atenuado: false }],
      marcadores: [...d.marcadores, { tipo: 'acao', rotulo: atendido ? 'Atendido' : 'Falso alarme', t }],
      atendido: { t, tempo, desfecho: desfechoFinal, eventoId: evento.id, pose: atendido ? 'sentando' : 'repouso' },
      tecnicaAte: atendido ? t + 5 : null,
      primeiroSinal: d.primeiroSinal,
    },
  }
  return s
}

export function reducer(state, a) {
  switch (a.type) {
    case 'REINICIAR':
      return criarEstadoInicial()

    case 'ABA': {
      const fimCenario = state.fimCenario || (a.aba === 'historico' && state.etapa === TOTAL_ETAPAS)
      return { ...state, aba: a.aba, leitoAberto: a.aba === 'painel' ? state.leitoAberto : null, bastidores: null, dica: null, fimCenario }
    }

    case 'TORRE': {
      const posto = POSTOS.find((p) => p.torre === a.torre)
      return { ...state, torre: a.torre, posto: posto.id, leitoAberto: null, dica: null }
    }

    case 'POSTO':
      return { ...state, posto: a.posto, leitoAberto: null, dica: null }

    case 'MOSTRAR_TODOS':
      return { ...state, mostrarTodos: !state.mostrarTodos }

    case 'ABRIR_LEITO': {
      const l = LEITOS[a.leito]
      if (!l.monitorado) return { ...state, dica: { leito: a.leito, t: a.t } }
      return { ...state, aba: 'painel', torre: l.torre, posto: l.posto, leitoAberto: a.leito, dica: null }
    }

    case 'FECHAR_LEITO':
      return { ...state, leitoAberto: null }

    case 'PROXIMA_ETAPA': {
      if (state.fimCenario) return state
      if (state.etapa >= TOTAL_ETAPAS) return { ...state, fimCenario: true }
      const etapa = state.etapa + 1
      const def = ETAPAS[etapa]
      let s = { ...state, etapa, leitos: { ...state.leitos } }
      for (const m of def.mudancas) {
        const d = s.leitos[m.leito]
        const novo = mudarEstado(d, m.estado, a.t, m.confianca)
        s.leitos[m.leito] = novo
        // Estado atenuado vira só registro: já entra no histórico.
        if (avaliar(m.estado, d.acompanhante).registro) {
          const evento = registrarEvento(s, m.leito, m.estado, novo, a.t, 'Registrado (atenuado)', null)
          s.eventos = [evento, ...s.eventos]
        }
      }
      if (def.celular) s.celular = { leito: def.celular, t: a.t }
      return s
    }

    case 'ESTOU_INDO': {
      const d = state.leitos[a.leito]
      if (!d.primeiroSinal || d.atendido || d.aCaminho) return state
      return {
        ...state,
        leitos: { ...state.leitos, [a.leito]: { ...d, aCaminho: a.t, marcadores: [...d.marcadores, { tipo: 'acao', rotulo: 'Estou indo', t: a.t }] } },
      }
    }

    case 'ATENDIDO':
      return encerrar(state, a.leito, a.t, 'Atendido')

    case 'FALSO_ALARME':
      return encerrar(state, a.leito, a.t, 'Falso alarme')

    case 'PAUSAR': {
      const d = state.leitos[a.leito]
      return {
        ...state,
        leitos: {
          ...state.leitos,
          [a.leito]: {
            ...d,
            estado: 'pausado',
            desde: a.t,
            pausa: { motivo: 'procedimento', ate: a.t + 15 * 60 },
            linha: [...d.linha, { estado: 'pausado', t: a.t, atenuado: false }],
          },
        },
      }
    }

    case 'FILTRO':
      return { ...state, filtros: { ...state.filtros, [a.campo]: a.valor } }

    case 'BASTIDORES':
      return { ...state, bastidores: a.evento }

    case 'FECHAR_DICA':
      return { ...state, dica: null }

    default:
      return state
  }
}
