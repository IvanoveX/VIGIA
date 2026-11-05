import { ARESTAS } from '../data/poses.js'

const CONFIANCA_BAIXA = 0.65

// Pontos e polígono chegam em frações (0 a 1) da largura e da altura do vídeo.
// Traços proporcionais à largura mantêm o mesmo aspecto em qualquer resolução.
export default function EsqueletoReal({ pontos, largura, altura, poligono }) {
  const u = largura / 480
  const pos = pontos?.map(([x, y, c]) => [x * largura, y * altura, c])
  return (
    <svg viewBox={`0 0 ${largura} ${altura}`} className="w-full rounded" role="img" aria-label="Esqueleto de 17 pontos extraído do vídeo" overflow="hidden">
      <rect width={largura} height={altura} fill="var(--superficie-2)" />
      {poligono && (
        <polygon
          points={poligono.map(([x, y]) => `${x * largura},${y * altura}`).join(' ')}
          fill="none"
          stroke="var(--sensor)"
          strokeWidth={2 * u}
          strokeLinejoin="round"
        />
      )}
      {pos ? <Pose pos={pos} u={u} /> : <SemPose largura={largura} altura={altura} u={u} />}
    </svg>
  )
}

function Pose({ pos, u }) {
  return (
    <g>
      {ARESTAS.map(([a, b]) => {
        const baixa = Math.min(pos[a][2], pos[b][2]) < CONFIANCA_BAIXA
        return (
          <line
            key={`${a}-${b}`}
            x1={pos[a][0]}
            y1={pos[a][1]}
            x2={pos[b][0]}
            y2={pos[b][1]}
            stroke="var(--marca)"
            strokeWidth={3.5 * u}
            strokeLinecap="round"
            strokeDasharray={baixa ? `${5 * u} ${5 * u}` : undefined}
            opacity={baixa ? 0.55 : 1}
          />
        )
      })}
      {pos.map(([x, y, c], i) => {
        const baixa = c < CONFIANCA_BAIXA
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={(i <= 4 ? 3 : 4.5) * u}
            fill={baixa ? 'var(--superficie)' : 'var(--marca)'}
            stroke="var(--marca)"
            strokeWidth={2 * u}
            opacity={baixa ? 0.6 : 1}
          />
        )
      })}
    </g>
  )
}

function SemPose({ largura, altura, u }) {
  return (
    <text x={largura / 2} y={altura / 2} textAnchor="middle" fontSize={16 * u} fontWeight="700" fill="var(--secundario)">
      Sem pose neste quadro
    </text>
  )
}
