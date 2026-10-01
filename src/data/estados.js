// Definição única de cada estado. Toda a interface lê daqui.
// tom: chave visual usada pelos componentes (calmo | ambar | laranja | vermelho | contexto | sensor).
// canais: quem é avisado sem atenuação. atenuacao: o que acontece com "Acompanhante presente".
import {
  BedSingle,
  Armchair,
  PersonStanding,
  TriangleAlert,
  DoorOpen,
  Users,
  CirclePause,
  WifiOff,
  CircleOff,
} from 'lucide-react'

export const GRUPOS = [
  { chave: 'movimento', titulo: 'Movimento', subtitulo: 'reconhecido pelo modelo' },
  { chave: 'contexto', titulo: 'Contexto', subtitulo: 'regras do sistema' },
  { chave: 'sensor', titulo: 'Sensor', subtitulo: 'estado do equipamento' },
]

export const CANAIS = {
  painel: 'Painel',
  som: 'Som',
  som_continuo: 'Som contínuo',
  celular: 'Celular do plantão',
  faixa: 'Faixa no topo',
}

export const ESTADOS = {
  repouso: {
    chave: 'repouso',
    rotulo: 'Repouso',
    detalhe: null,
    categoria: 'movimento',
    prioridade: null,
    tom: 'calmo',
    icone: BedSingle,
    canais: [],
    atenuacao: null,
  },
  sentando: {
    chave: 'sentando',
    rotulo: 'Sentando na borda',
    detalhe: 'pré-queda',
    categoria: 'movimento',
    prioridade: 3,
    tom: 'ambar',
    icone: Armchair,
    canais: ['painel'],
    // Com acompanhante vira só registro: não entra na fila principal.
    atenuacao: { prioridade: null, canais: [], registro: true },
  },
  levantando: {
    chave: 'levantando',
    rotulo: 'Tentando levantar',
    detalhe: 'risco iminente',
    categoria: 'movimento',
    prioridade: 2,
    tom: 'laranja',
    icone: PersonStanding,
    canais: ['painel', 'som', 'celular'],
    // Com acompanhante vira alerta visual sem som.
    atenuacao: { prioridade: 3, canais: ['painel'], registro: false },
  },
  queda: {
    chave: 'queda',
    rotulo: 'Queda',
    detalhe: null,
    categoria: 'movimento',
    prioridade: 1,
    tom: 'vermelho',
    icone: TriangleAlert,
    canais: ['painel', 'som_continuo', 'celular', 'faixa'],
    atenuacao: null, // Queda nunca é atenuada.
  },
  fora: {
    chave: 'fora',
    rotulo: 'Fora do leito há mais de 10 min',
    rotuloCurto: 'Fora do leito',
    detalhe: null,
    categoria: 'contexto',
    prioridade: 2,
    tom: 'contexto',
    icone: DoorOpen,
    canais: ['painel', 'celular'],
    atenuacao: null,
  },
  acompanhante: {
    chave: 'acompanhante',
    rotulo: 'Acompanhante presente',
    detalhe: 'qualquer pessoa junto ao leito, inclusive a equipe',
    categoria: 'contexto',
    prioridade: null,
    tom: 'contexto',
    icone: Users,
    canais: [],
    atenuacao: null,
  },
  pausado: {
    chave: 'pausado',
    rotulo: 'Pausado',
    detalhe: 'procedimento',
    categoria: 'sensor',
    prioridade: null,
    tom: 'sensor',
    icone: CirclePause,
    canais: [],
    atenuacao: null,
  },
  sem_sinal: {
    chave: 'sem_sinal',
    rotulo: 'Sem sinal',
    detalhe: null,
    categoria: 'sensor',
    prioridade: null,
    tom: 'sensor',
    icone: WifiOff,
    canais: [],
    atenuacao: null,
  },
  nao_monitorado: {
    chave: 'nao_monitorado',
    rotulo: 'Não monitorado',
    detalhe: null,
    categoria: 'sensor',
    prioridade: null,
    tom: 'sensor',
    icone: CircleOff,
    canais: [],
    atenuacao: null,
  },
}

// Ordem das fases na sequência do movimento.
export const FASES = ['repouso', 'sentando', 'levantando', 'queda']

// Limiares ilustrativos por sensibilidade do leito.
export const LIMIARES = { alta: 0.55, 'padrão': 0.7 }

// Resultado efetivo de um estado, considerando o acompanhante.
export function avaliar(chave, acompanhante) {
  const e = ESTADOS[chave]
  if (acompanhante && e.atenuacao) {
    return { prioridade: e.atenuacao.prioridade, canais: e.atenuacao.canais, atenuado: true, registro: e.atenuacao.registro }
  }
  return { prioridade: e.prioridade, canais: e.canais, atenuado: false, registro: false }
}
