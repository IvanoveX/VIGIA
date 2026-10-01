// Nomes fictícios — ajustar se tivermos a estrutura real do HBU.
// 5 torres, 60 leitos por torre, 300 leitos no total. Tudo determinístico (sem Math.random).

export const TORRES = [
  {
    numero: 1,
    postos: [
      { andar: 2, setor: 'Clínica Cirúrgica', leitos: 24 },
      { andar: 3, setor: 'Ortopedia', leitos: 18 },
      { andar: 4, setor: 'Clínica Cirúrgica', leitos: 18 },
    ],
  },
  {
    numero: 2,
    postos: [
      { andar: 2, setor: 'Clínica Médica', leitos: 24 },
      { andar: 3, setor: 'Cardiologia', leitos: 18 },
      { andar: 4, setor: 'Nefrologia', leitos: 18 },
    ],
  },
  {
    numero: 3,
    postos: [
      { andar: 3, setor: 'Clínica Médica', leitos: 24 },
      { andar: 4, setor: 'Neurologia', leitos: 18 },
      { andar: 5, setor: 'Geriatria', leitos: 18 },
    ],
  },
  {
    numero: 4,
    postos: [
      { andar: 2, setor: 'Oncologia', leitos: 24 },
      { andar: 3, setor: 'Clínica Médica', leitos: 18 },
      { andar: 4, setor: 'Pneumologia', leitos: 18 },
    ],
  },
  {
    numero: 5,
    postos: [
      { andar: 2, setor: 'Clínica Cirúrgica', leitos: 24 },
      { andar: 3, setor: 'Geriatria', leitos: 18 },
      { andar: 4, setor: 'Clínica Médica', leitos: 18 },
    ],
  },
]

// Posto aberto ao carregar a página.
export const INICIAL = { torre: 3, posto: 't3-a3' }

// Leitos monitorados fixos do posto da demonstração.
const MONITORADOS_DEMO = { 't3-a3': [301, 303, 305, 308, 310, 312, 315, 318, 321] }

// PRNG com semente fixa (mulberry32).
function prng(semente) {
  let a = semente
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hhmm(minutos) {
  const h = Math.floor(minutos / 60) % 24
  const m = minutos % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function nomeAndar(andar) {
  return `${andar}º andar`
}

function gerar() {
  const postos = []
  const leitos = {}
  const sorteio = prng(20260401)

  for (const torre of TORRES) {
    for (const p of torre.postos) {
      const id = `t${torre.numero}-a${p.andar}`
      const ids = []
      const fixos = MONITORADOS_DEMO[id]
      for (let n = 1; n <= p.leitos; n++) {
        const numero = p.andar * 100 + n
        const leitoId = `${torre.numero}-${numero}`
        const r = sorteio()
        const monitorado = fixos ? fixos.includes(numero) : r < 0.36
        leitos[leitoId] = {
          id: leitoId,
          numero,
          torre: torre.numero,
          andar: p.andar,
          posto: id,
          setor: p.setor,
          monitorado,
          sensibilidade: numero === 312 || sorteio() < 0.4 ? 'alta' : 'padrão',
          sensor: 'online',
          // Entre 19:00 e 22:50 (ou desde o plantão anterior).
          monitoradoDesde: numero === 312 && torre.numero === 3 ? '19:12' : hhmm(19 * 60 + Math.floor(sorteio() * 24) * 10),
        }
        ids.push(leitoId)
      }
      postos.push({ id, torre: torre.numero, andar: p.andar, setor: p.setor, nome: `Posto do ${nomeAndar(p.andar)}`, leitos: ids })
    }
  }
  leitos['3-303'].sensor = 'sem_sinal'
  return { postos, leitos }
}

const gerado = gerar()

export const POSTOS = gerado.postos
export const LEITOS = gerado.leitos

export function postosDaTorre(torre) {
  return POSTOS.filter((p) => p.torre === torre)
}

export function postoPorId(id) {
  return POSTOS.find((p) => p.id === id)
}

export function descreverLocal(leito) {
  return `Torre ${leito.torre}, ${nomeAndar(leito.andar)}, ${leito.setor}`
}
