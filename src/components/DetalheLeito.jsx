import { ArrowLeft, Wifi, WifiOff, Footprints, Check, X, Pause, Bell, Smartphone } from 'lucide-react'
import EsqueletoAnimado from './Esqueleto.jsx'
import { SequenciaFases, LinhaTempo } from './Sequencia.jsx'
import Selo from './Selo.jsx'
import { LEITOS, descreverLocal } from '../data/hospital.js'
import { ESTADOS, FASES, avaliar } from '../data/estados.js'
import { situacao, tomEfetivo } from '../estado/seletores.js'
import { decimal, duracao, horario, minutosRestantes } from '../lib/formato.js'

const CANAL = { painel: { rotulo: 'Painel', icone: Bell }, celular: { rotulo: 'Celular do plantão', icone: Smartphone } }

function poseDoLeito(d, estado) {
  if (d.atendido && estado === 'repouso') return d.atendido.pose
  return FASES.includes(estado) ? estado : 'repouso'
}

function avisoDoLeito(d, estado, agora) {
  if (estado === 'pausado') return `Monitoramento pausado: ${d.pausa?.motivo ?? 'procedimento'}`
  if (estado === 'sem_sinal') return `Sem sinal do sensor há ${duracao(agora - d.desde)}`
  if (estado === 'fora') return 'Nenhum esqueleto na área do leito'
  return null
}

function Botao({ onClick, disabled, icone: Icone, children, forte = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded px-3 font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        forte ? 'bg-marca text-white hover:bg-marca/90' : 'border border-linha bg-superficie text-tinta hover:border-secundario'
      }`}
    >
      <Icone className="size-5 shrink-0" aria-hidden="true" />
      {children}
    </button>
  )
}

export default function DetalheLeito({ state, agora, agir }) {
  const id = state.leitoAberto
  const leito = LEITOS[id]
  const s = situacao(state, id, agora)
  const { d, estado } = s
  const e = ESTADOS[estado]
  const sinalAtivo = d.primeiroSinal != null && !d.atendido
  const pose = poseDoLeito(d, estado)
  const tecnica = d.tecnicaAte != null && agora < d.tecnicaAte + 5
  // Última notificação de cada canal já enviada.
  const notificacoes = ['painel', 'celular']
    .map((canal) => d.notificacoes.filter((n) => n.canal === canal && n.t <= agora).at(-1))
    .filter(Boolean)
  const faseAtual = FASES.includes(estado) ? estado : 'repouso'
  const tomDe = (seg) => tomEfetivo(seg.estado, avaliar(seg.estado, seg.atenuado))
  const semSinal = leito.sensor === 'sem_sinal' || estado === 'sem_sinal'

  return (
    <div className="flex flex-col gap-2.5">
      {/* Cabeçalho do leito */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5">
        <button
          type="button"
          onClick={() => agir({ type: 'FECHAR_LEITO' })}
          className="inline-flex min-h-11 items-center gap-2 rounded border border-linha bg-superficie px-3 font-bold hover:border-secundario"
        >
          <ArrowLeft className="size-5" aria-hidden="true" /> Painel
        </button>
        <h1 className="text-[28px] font-bold leading-none">Leito {leito.numero}</h1>
        <span className="text-secundario">{descreverLocal(leito)}</span>
        <div className="flex flex-wrap gap-x-4 text-[15px] text-secundario">
          <span>
            Sensibilidade: <strong className="text-tinta">{leito.sensibilidade === 'alta' ? 'Alta' : 'Padrão'}</strong> (definida pela enfermagem pela Escala de Morse)
          </span>
          <span className="inline-flex items-center gap-1">
            {semSinal ? <WifiOff className="size-4" aria-hidden="true" /> : <Wifi className="size-4" aria-hidden="true" />}
            Sensor: <strong className="text-tinta">{semSinal ? 'sem sinal' : 'online'}</strong>
          </span>
          <span>
            Monitorado desde <strong className="num text-tinta">{leito.monitoradoDesde}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(340px,1fr)] gap-3">
        {/* Esqueleto */}
        <figure className="flex flex-col rounded border border-linha bg-superficie p-2">
          <EsqueletoAnimado pose={pose} tecnica={tecnica} aviso={avisoDoLeito(d, estado, agora)} className="h-full max-h-[196px] w-full" />
          <figcaption className="mt-1 px-1 text-[14px] leading-tight text-secundario">
            17 pontos (x, y, confiança) por quadro. Nenhuma imagem é exibida, gravada ou transmitida.
          </figcaption>
        </figure>

        {/* Painel de estado */}
        <section className="flex flex-col gap-2 rounded border border-linha bg-superficie p-3" aria-label="Estado do leito">
          <div className="flex flex-wrap items-center gap-2">
            {d.atendido && estado === 'repouso' ? (
              <span className="inline-flex items-center gap-1.5 rounded border-2 border-marca px-2 py-1 font-bold text-marca">
                {d.atendido.desfecho === 'Falso alarme' ? <X className="size-5" aria-hidden="true" /> : <Check className="size-5" aria-hidden="true" />}{' '}
                {d.atendido.desfecho}
              </span>
            ) : (
              <Selo chave={estado} tom={s.tom === 'calmo' && e.tom !== 'calmo' ? undefined : s.tom} className="text-[18px]" />
            )}
            {s.atenuado && <span className="rounded bg-ambar px-1.5 py-0.5 text-[14px] font-bold text-ambar-texto">atenuado: acompanhante presente</span>}
            {tecnica && d.tecnicaAte > agora && (
              <span className="rounded border border-contexto px-1.5 py-0.5 text-[14px] font-bold text-contexto">Acompanhante presente</span>
            )}
          </div>

          <div>
            <p className="leading-tight">
              Confiança do modelo: <strong className="num">{d.confianca != null ? decimal(d.confianca) : '—'}</strong>
            </p>
            <div className="mt-1 h-1.5 rounded-full bg-superficie-2 ring-1 ring-linha">
              <div className="h-full rounded-full bg-tinta transition-[width] duration-700" style={{ width: `${(d.confianca ?? 0) * 100}%` }} />
            </div>
          </div>

          {sinalAtivo && (
            <p>
              Primeiro sinal há <strong className="num">{duracao(agora - d.primeiroSinal)}</strong>
            </p>
          )}
          {d.atendido && (
            <p>
              Tempo total até o atendimento: <strong className="num">{duracao(d.atendido.tempo)}</strong>
            </p>
          )}
          {estado === 'pausado' && d.pausa && <p>Retorna em {minutosRestantes(d.pausa.ate - agora)}</p>}
          {sinalAtivo && d.aCaminho != null && (
            <p className="inline-flex items-center gap-1.5 font-bold text-marca">
              <Footprints className="size-5" aria-hidden="true" /> Técnica a caminho há <span className="num">{duracao(agora - d.aCaminho)}</span>
            </p>
          )}

          {notificacoes.length > 0 && (
            <div className="flex flex-wrap items-baseline gap-x-3 text-[15px]">
              <p className="text-secundario">Notificações:</p>
              <ul className="contents">
                {notificacoes.map((n, i) => {
                  const c = CANAL[n.canal]
                  return (
                    <li key={i} className="inline-flex items-center gap-1.5">
                      <c.icone className="size-4 text-secundario" aria-hidden="true" />
                      {c.rotulo} <span className="num font-bold">{horario(n.t)}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          <div className="mt-auto grid grid-cols-2 gap-2">
            <Botao forte icone={Footprints} disabled={!sinalAtivo || d.aCaminho != null} onClick={() => agir({ type: 'ESTOU_INDO', leito: id })}>
              Estou indo
            </Botao>
            <Botao forte icone={Check} disabled={!sinalAtivo} onClick={() => agir({ type: 'ATENDIDO', leito: id })}>
              Atendido
            </Botao>
            <Botao icone={X} disabled={!sinalAtivo} onClick={() => agir({ type: 'FALSO_ALARME', leito: id })}>
              Falso alarme
            </Botao>
            <Botao icone={Pause} disabled={estado === 'pausado' || estado === 'sem_sinal'} onClick={() => agir({ type: 'PAUSAR', leito: id })}>
              Pausar 15 min
            </Botao>
          </div>
        </section>
      </div>

      {/* Sequência do movimento e linha do tempo */}
      <section className="rounded border border-linha bg-superficie px-3 py-2.5" aria-label="Sequência do movimento">
        <h2 className="sr-only">Sequência do movimento</h2>
        <SequenciaFases fase={faseAtual} alcancada={d.atendido || sinalAtivo ? d.pico : null} atendido={!!d.atendido && estado === 'repouso' && d.atendido.desfecho !== 'Falso alarme'} />
        <div className="mt-1">
          <LinhaTempo d={d} agora={agora} tomDe={tomDe} />
        </div>
      </section>
    </div>
  )
}
