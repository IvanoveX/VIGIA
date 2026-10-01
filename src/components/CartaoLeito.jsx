import { Check, Users } from 'lucide-react'
import Selo from './Selo.jsx'
import { ESTADOS } from '../data/estados.js'
import { duracao, minutosRestantes } from '../lib/formato.js'

// Moldura do cartão por tom: hierarquia por borda e preenchimento, sem sombra.
const MOLDURA = {
  calmo: 'border border-linha bg-superficie text-tinta',
  ambar: 'border border-linha bg-superficie text-tinta pl-5',
  laranja: 'border-[3px] border-laranja bg-superficie text-tinta',
  vermelho: 'border border-vermelho bg-vermelho text-vermelho-texto pulso-vermelho',
  contexto: 'border-2 border-contexto bg-superficie text-tinta',
  sensor: 'border border-linha bg-sensor-fundo text-secundario',
  sem_sinal: 'border-2 border-dashed border-sensor bg-superficie text-secundario',
}

function SeloPequeno({ icone: Icone, children, className }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[14px] font-bold leading-tight ${className}`}>
      <Icone className="size-4 shrink-0" aria-hidden="true" />
      {children}
    </span>
  )
}

export function CartaoNaoMonitorado({ numero, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[72px] items-start rounded border border-linha bg-superficie p-3 text-left opacity-40 hover:opacity-60"
      aria-label={`Leito ${numero}, não monitorado`}
    >
      <span className="text-[26px] font-bold leading-none">{numero}</span>
    </button>
  )
}

export default function CartaoLeito({ s, agora, onClick }) {
  const { leito, d, estado, tom, atenuado } = s
  const e = ESTADOS[estado]
  const Icone = e.icone
  const moldura = estado === 'sem_sinal' ? MOLDURA.sem_sinal : MOLDURA[tom]
  const alerta = tom === 'ambar' || tom === 'laranja' || tom === 'vermelho'
  const seloAtendido = d.atendido && agora - d.atendido.t < 10
  const tecnicaPresente = d.tecnicaAte != null && agora < d.tecnicaAte
  const acompanhante = (d.acompanhante || tecnicaPresente) && !atenuado

  let linhaTempo
  if (estado === 'pausado' && d.pausa) linhaTempo = `Retorna em ${minutosRestantes(d.pausa.ate - agora)}`
  else linhaTempo = `há ${duracao(agora - d.desde)}`

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex min-h-[116px] flex-col items-start gap-1.5 overflow-hidden rounded p-3 text-left ${moldura}`}
      aria-label={`Leito ${leito.numero}: ${e.rotulo}${atenuado ? ', atenuado: acompanhante presente' : ''}`}
    >
      {tom === 'ambar' && <span className="absolute inset-y-0 left-0 w-2 bg-ambar" aria-hidden="true" />}
      <span className="flex w-full items-start justify-between">
        <span className="text-[28px] font-bold leading-none">{leito.numero}</span>
        {tom === 'laranja' && <span className="pulso-ponto mt-1 size-3.5 rounded-full bg-laranja" aria-hidden="true" />}
      </span>

      {alerta && tom !== 'vermelho' ? (
        <Selo chave={estado} tom={tom} />
      ) : (
        <span className={`inline-flex items-center gap-1.5 text-[17px] font-bold ${tom === 'contexto' ? 'text-contexto' : ''}`}>
          <Icone className="size-5 shrink-0" aria-hidden="true" />
          <span className="leading-tight">
            {estado === 'pausado' && d.pausa ? `Pausado: ${d.pausa.motivo}` : e.rotuloCurto || e.rotulo}
          </span>
        </span>
      )}

      <span className={`num text-[15px] ${tom === 'vermelho' ? '' : 'text-secundario'}`}>{linhaTempo}</span>

      {(atenuado || acompanhante || seloAtendido) && (
        <span className="flex flex-wrap gap-1.5">
          {atenuado && (
            <SeloPequeno icone={Users} className="bg-ambar text-ambar-texto">
              atenuado: acompanhante presente
            </SeloPequeno>
          )}
          {acompanhante && (
            <SeloPequeno icone={Users} className="border border-contexto text-contexto">
              Acompanhante presente
            </SeloPequeno>
          )}
          {seloAtendido && (
            <SeloPequeno icone={Check} className="border border-marca text-marca">
              Atendido
            </SeloPequeno>
          )}
        </span>
      )}
    </button>
  )
}
