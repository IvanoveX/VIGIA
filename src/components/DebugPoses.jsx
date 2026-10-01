import { Cena, DesenhoEsqueleto } from './Esqueleto.jsx'
import { POSES, TECNICA, NOMES_PONTOS } from '../data/poses.js'

// Página de conferência: ?debug=poses
export default function DebugPoses() {
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold">Conferência das poses</h1>
      <p className="mb-3 text-secundario">
        Índices COCO em cada ponto. Lado distante da câmera (direito, índices pares) em cinza e deslocado. Pontos vazados e arestas tracejadas: confiança abaixo de 0,65.
      </p>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Object.entries(POSES).map(([chave, pose]) => (
          <figure key={chave} className="rounded border border-linha bg-superficie p-2">
            <Cena id={chave} className="w-full" rotulo={pose.rotulo}>
              <DesenhoEsqueleto pontos={pose.pontos} indices />
              {chave === 'sentando' && <DesenhoEsqueleto pontos={TECNICA.pontos} cor="var(--secundario)" />}
            </Cena>
            <figcaption className="mt-1 font-bold">
              {pose.rotulo}
              {chave === 'sentando' && <span className="font-normal text-secundario"> (com a técnica, em cinza)</span>}
            </figcaption>
          </figure>
        ))}
      </div>
      <ol start="0" className="mt-4 grid grid-cols-3 gap-x-6 text-[15px] text-secundario lg:grid-cols-6">
        {NOMES_PONTOS.map((n, i) => (
          <li key={i} className="num">
            {i}: {n}
          </li>
        ))}
      </ol>
    </main>
  )
}
