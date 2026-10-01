import Selo from './Selo.jsx'
import { GRUPOS, ESTADOS } from '../data/estados.js'

export default function Legenda() {
  return (
    <footer className="grid grid-cols-3 gap-4 rounded border border-linha bg-superficie p-3" aria-label="Legenda dos estados">
      {GRUPOS.map((g) => (
        <div key={g.chave}>
          <p className="font-bold leading-tight">{g.titulo}</p>
          <p className="mb-2 text-[14px] text-secundario">{g.subtitulo}</p>
          <ul className="flex flex-wrap gap-1.5">
            {Object.values(ESTADOS)
              .filter((e) => e.categoria === g.chave)
              .map((e) => (
                <li key={e.chave}>
                  <Selo chave={e.chave} pequeno rotulo={e.detalhe && e.chave !== 'acompanhante' ? `${e.rotulo} (${e.detalhe})` : e.rotulo} />
                </li>
              ))}
          </ul>
        </div>
      ))}
    </footer>
  )
}
