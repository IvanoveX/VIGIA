import { BellOff, ChevronDown } from 'lucide-react'
import { ESTADOS } from '../data/estados.js'
import { duracao } from '../lib/formato.js'

const ITEM = {
  vermelho: 'border border-vermelho bg-vermelho text-vermelho-texto pulso-vermelho',
  laranja: 'border-[3px] border-laranja bg-superficie',
  ambar: 'border border-linha bg-superficie pl-5',
  contexto: 'border-2 border-contexto bg-superficie',
  calmo: 'border border-linha bg-superficie',
}

function ItemFila({ s, agora, onAbrir, discreto = false }) {
  const e = ESTADOS[s.estado]
  const Icone = e.icone
  const inicio = s.d.primeiroSinal ?? s.d.desde
  return (
    <li>
      <button
        type="button"
        onClick={() => onAbrir(s.id)}
        className={`relative flex w-full items-center gap-3 overflow-hidden rounded p-3 text-left ${discreto ? ITEM.calmo : ITEM[s.tom]}`}
      >
        {!discreto && s.tom === 'ambar' && <span className="absolute inset-y-0 left-0 w-2 bg-ambar" aria-hidden="true" />}
        <span className="text-[26px] font-bold leading-none">{s.leito.numero}</span>
        <span className="min-w-0 flex-1">
          <span className={`flex items-center gap-1.5 font-bold leading-tight ${s.tom === 'contexto' ? 'text-contexto' : ''}`}>
            <Icone className="size-[18px] shrink-0" aria-hidden="true" />
            {e.rotuloCurto || e.rotulo}
          </span>
          <span className={`num text-[15px] ${s.tom === 'vermelho' ? '' : 'text-secundario'}`}>
            {discreto ? 'Registrado' : 'Primeiro sinal'} há {duracao(agora - inicio)}
          </span>
        </span>
        {!discreto && s.tom === 'laranja' && <span className="pulso-ponto size-3 shrink-0 rounded-full bg-laranja" aria-hidden="true" />}
      </button>
    </li>
  )
}

export default function FilaAlertas({ ativos, atenuados, agora, onAbrir }) {
  return (
    <section aria-labelledby="titulo-fila" className="flex flex-col gap-3">
      <h2 id="titulo-fila" className="flex items-baseline justify-between text-lg font-bold">
        Fila de alertas
        <span className="num text-[15px] font-normal text-secundario">
          {ativos.length === 0 ? '' : ativos.length === 1 ? '1 ativo' : `${ativos.length} ativos`}
        </span>
      </h2>
      {ativos.length === 0 ? (
        <p className="flex items-center gap-2 rounded border border-linha bg-superficie p-4 text-secundario">
          <BellOff className="size-5 shrink-0" aria-hidden="true" />
          Nenhum alerta ativo
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {ativos.map((s) => (
            <ItemFila key={s.id} s={s} agora={agora} onAbrir={onAbrir} />
          ))}
        </ul>
      )}

      <details open className="group rounded border border-linha bg-superficie-2">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-3 font-bold text-secundario">
          <span>
            Atenuados por contexto <span className="num font-normal">({atenuados.length})</span>
          </span>
          <ChevronDown className="size-5 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="px-3 pb-3">
          {atenuados.length === 0 ? (
            <p className="text-[15px] text-secundario">Nenhum registro atenuado agora.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {atenuados.map((s) => (
                <ItemFila key={s.id} s={s} agora={agora} onAbrir={onAbrir} discreto />
              ))}
            </ul>
          )}
          <p className="mt-2 text-[14px] text-secundario">Com acompanhante junto ao leito, o alerta desce um nível. Queda nunca é atenuada.</p>
        </div>
      </details>
    </section>
  )
}
