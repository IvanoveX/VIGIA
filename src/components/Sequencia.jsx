import { Fragment } from 'react'
import { ChevronRight, Check, Bell, Smartphone } from 'lucide-react'
import { ESTADOS, FASES } from '../data/estados.js'
import { TONS } from './Selo.jsx'

// Contorno das fases futuras, na cor de cada fase.
const CONTORNO = {
  calmo: 'border-2 border-sensor text-secundario',
  ambar: 'border-2 border-ambar text-secundario',
  laranja: 'border-2 border-laranja text-secundario',
  vermelho: 'border-2 border-vermelho text-secundario',
}

// Quanto da janela de prevenção já foi percorrido, por fase.
const PERCORRIDO = { repouso: 0, sentando: 0.4, levantando: 0.78, queda: 1 }

const COR_SEGMENTO = {
  calmo: 'bg-linha',
  ambar: 'bg-ambar',
  laranja: 'bg-laranja',
  vermelho: 'bg-vermelho',
  contexto: 'bg-contexto',
  sensor: 'bg-sensor',
}

export function SequenciaFases({ fase, alcancada, atendido }) {
  const iAtual = FASES.indexOf(fase)
  const iAlcancada = Math.max(iAtual, FASES.indexOf(alcancada ?? fase))
  const percorrido = PERCORRIDO[FASES[iAlcancada]] ?? 0
  const naJanela = iAlcancada >= 1

  return (
    <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-stretch gap-x-1.5">
      {/* Colchete da janela de prevenção: do início de Sentando até Queda */}
      <span className="col-start-1 col-end-3 mb-1.5 self-center pr-2 text-right text-[15px] font-bold leading-tight">Janela de prevenção</span>
      <div className={`relative col-start-3 col-end-7 mb-1.5 h-3.5 self-center rounded-sm border-x-2 ${atendido ? 'border-marca' : 'border-tinta'}`}>
        <div className={`absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 ${atendido ? 'bg-marca/40' : 'bg-linha'}`} />
        <div
          className={`absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-sm transition-[width] duration-[1600ms] ease-in-out ${atendido ? 'bg-marca' : 'bg-tinta'}`}
          style={{ width: `${percorrido * 100}%` }}
        />
      </div>
      <span className="col-start-7 mb-1.5 self-center pl-1 text-[15px] leading-tight">
        {atendido ? (
          <span className="inline-flex items-center gap-1 font-bold text-marca">
            <Check className="size-4 shrink-0" aria-hidden="true" /> Atendido dentro da janela
          </span>
        ) : (
          <span className="text-secundario">{naJanela ? 'aberta desde o primeiro sinal' : 'ainda não aberta'}</span>
        )}
      </span>

      {FASES.map((chave, i) => {
        const e = ESTADOS[chave]
        const Icone = e.icone
        const atual = !atendido && i === iAtual
        const passada = atendido ? i <= iAlcancada : i < iAtual
        const futura = !atual && !passada
        let estilo
        if (atual) estilo = `${TONS[e.tom]} ring-[3px] ring-tinta ring-offset-2 ring-offset-superficie`
        else if (passada) estilo = e.tom === 'calmo' ? 'bg-sensor-fundo text-tinta border border-linha' : TONS[e.tom]
        else estilo = `${CONTORNO[e.tom]} bg-superficie`
        return (
          <Fragment key={chave}>
            {i > 0 && <ChevronRight className="row-start-2 size-5 self-center text-secundario" aria-hidden="true" />}
            <div className={`row-start-2 flex min-h-[52px] items-center gap-2 rounded px-3 py-1.5 ${estilo}`} aria-current={atual ? 'step' : undefined}>
              <Icone className="size-5 shrink-0" aria-hidden="true" />
              <span className="min-w-0 leading-tight">
                <span className="block font-bold">{e.rotulo}</span>
                <span className={`block text-[14px] ${futura ? 'text-secundario' : ''}`}>
                  {atual ? 'fase atual' : futura ? (atendido && chave === 'queda' ? 'não atingida' : 'ainda não') : 'percorrida'}
                </span>
              </span>
              {passada && <Check className="ml-auto size-4 shrink-0" aria-hidden="true" />}
            </div>
          </Fragment>
        )
      })}
      <p className="col-start-7 row-start-3 mt-0.5 text-[14px] leading-tight text-secundario">Aqui começam os detectores de queda comuns</p>
    </div>
  )
}

// Linha do tempo dos últimos 60 s: segmentos por estado e marcadores de notificações e ações.
export function LinhaTempo({ d, agora, tomDe }) {
  const inicio = agora - 60
  const pos = (t) => `${((t - inicio) / 60) * 100}%`
  const segs = []
  d.linha.forEach((s, i) => {
    const fim = i + 1 < d.linha.length ? d.linha[i + 1].t : agora
    const a = Math.max(s.t, inicio)
    const b = Math.min(fim, agora)
    if (b > a) segs.push({ ...s, a, b })
  })
  // Perto das bordas, o rótulo se alinha para dentro (sem rolagem horizontal).
  const ancora = (t) => {
    const f = (t - inicio) / 60
    return f > 0.88 ? '-translate-x-full' : f < 0.12 ? '' : '-translate-x-1/2'
  }
  const marcadores = d.marcadores.filter((m) => m.t >= inicio && m.t <= agora)
  return (
    <div>
      <div className="relative h-6">
        {marcadores.map((m, i) =>
          m.tipo === 'acao' ? (
            <span
              key={i}
              className={`absolute bottom-0 whitespace-nowrap rounded border border-tinta bg-superficie px-1.5 text-[13px] font-bold leading-5 transition-[left] duration-1000 ease-linear ${ancora(m.t)}`}
              style={{ left: pos(m.t) }}
            >
              {m.rotulo}
            </span>
          ) : (
            <span
              key={i}
              className="absolute bottom-0.5 -translate-x-1/2 text-secundario transition-[left] duration-1000 ease-linear"
              style={{ left: pos(m.t) }}
              title={m.canal === 'celular' ? 'Celular do plantão' : 'Painel'}
            >
              {m.canal === 'celular' ? <Smartphone className="size-4" aria-hidden="true" /> : <Bell className="size-4" aria-hidden="true" />}
            </span>
          ),
        )}
      </div>
      <div className="relative h-5 overflow-hidden rounded-sm bg-superficie-2 ring-1 ring-linha">
        {segs.map((s, i) => (
          <div
            key={`${s.t}-${i}`}
            className={`absolute inset-y-0 border-r border-superficie transition-[left,width] duration-1000 ease-linear ${COR_SEGMENTO[tomDe(s)]}`}
            style={{ left: pos(s.a), width: `${((s.b - s.a) / 60) * 100}%` }}
          />
        ))}
        {marcadores.map((m, i) => (
          <div key={`l${i}`} className="absolute inset-y-0 w-0.5 bg-tinta/70 transition-[left] duration-1000 ease-linear" style={{ left: pos(m.t) }} />
        ))}
      </div>
      <div className="mt-0.5 flex justify-between text-[14px] leading-tight text-secundario">
        <span className="num">-60 s</span>
        <span className="num">-30 s</span>
        <span>agora</span>
      </div>
    </div>
  )
}
