import { ESTADOS } from '../data/estados.js'

// Classes por tom. Contexto é só contorno e ícone; vermelho é o único com texto branco.
export const TONS = {
  calmo: 'border border-linha bg-superficie text-tinta',
  ambar: 'bg-ambar text-ambar-texto',
  laranja: 'bg-laranja text-laranja-texto',
  vermelho: 'bg-vermelho text-vermelho-texto',
  contexto: 'border-2 border-contexto bg-superficie text-contexto',
  sensor: 'border border-sensor bg-sensor-fundo text-secundario',
}

// Selo de estado: sempre ícone e rótulo escrito.
export default function Selo({ chave, tom, rotulo, pequeno = false, className = '' }) {
  const e = ESTADOS[chave]
  const Icone = e.icone
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-bold ${
        pequeno ? 'px-1.5 py-0.5 text-[14px]' : 'px-2 py-1 text-[16px]'
      } ${TONS[tom || e.tom]} ${className}`}
    >
      <Icone className={pequeno ? 'size-4 shrink-0' : 'size-[18px] shrink-0'} aria-hidden="true" />
      <span className="leading-tight">{rotulo || e.rotulo}</span>
    </span>
  )
}
