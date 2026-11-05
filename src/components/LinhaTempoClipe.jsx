import { segmentos, janelasNoFim } from '../lib/clipes.js'
import { estiloBaseline } from '../data/pipeline.js'
import { TONS } from './Selo.jsx'
import { duracao as formatarTempo } from '../lib/formato.js'

const NEUTRO = TONS.sensor

function Trilha({ rotulo, duracao, itens, classeDe, textoDe }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-44 shrink-0 text-[15px] font-bold leading-tight">{rotulo}</span>
      <div className="relative h-9 flex-1 overflow-hidden rounded bg-superficie-2">
        {itens.map((s) => (
          <div
            key={`${s.t_ini}-${s.t_fim}`}
            title={textoDe(s.item)}
            className={`absolute inset-y-0 flex items-center overflow-hidden px-1.5 text-[14px] font-bold ${classeDe(s.item)}`}
            style={{ left: `${(s.t_ini / duracao) * 100}%`, width: `${((s.t_fim - s.t_ini) / duracao) * 100}%` }}
          >
            <span className="truncate">{textoDe(s.item)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TrilhaPendente({ rotulo }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-44 shrink-0 text-[15px] font-bold leading-tight">{rotulo}</span>
      <div className={`flex h-9 flex-1 items-center rounded px-2 text-[14px] font-bold ${NEUTRO}`}>pendente</div>
    </div>
  )
}

export default function LinhaTempoClipe({ duracao, tempo, trilhas, onBuscar }) {
  const origem = segmentos(trilhas.origem, (r) => r.rotulo)
  const baseline = segmentos(janelasNoFim(trilhas.baseline), (j) => j.classe)
  const modelo = trilhas.modelo.pendente ? null : segmentos(janelasNoFim(trilhas.modelo), (j) => j.classe)
  return (
    <div>
      <div className="relative flex flex-col gap-2">
        <Trilha rotulo="Rótulo do dataset" duracao={duracao} itens={origem} classeDe={() => NEUTRO} textoDe={(r) => r.rotulo} />
        <Trilha
          rotulo="Baseline geométrico"
          duracao={duracao}
          itens={baseline}
          classeDe={(j) => TONS[estiloBaseline(j.classe).tom]}
          textoDe={(j) => estiloBaseline(j.classe).rotulo}
        />
        {modelo ? (
          <Trilha rotulo="Modelo" duracao={duracao} itens={modelo} classeDe={() => NEUTRO} textoDe={(j) => j.classe} />
        ) : (
          <TrilhaPendente rotulo="Modelo" />
        )}
        <div className="pointer-events-none absolute inset-y-0 left-[11.75rem] right-0" aria-hidden="true">
          <div className="absolute inset-y-0 w-0.5 bg-tinta" style={{ left: `${Math.min(100, (tempo / duracao) * 100)}%` }} />
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <span className="num w-44 shrink-0 text-[15px] text-secundario">
          {formatarTempo(tempo)} de {formatarTempo(duracao)}
        </span>
        <input
          type="range"
          min={0}
          max={duracao}
          step={0.01}
          value={tempo}
          onChange={(e) => onBuscar(Number(e.target.value))}
          aria-label="Posição no clipe"
          className="h-11 flex-1 accent-marca"
        />
      </div>
    </div>
  )
}
