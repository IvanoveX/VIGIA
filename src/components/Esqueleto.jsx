import { useEffect, useRef, useState } from 'react'
import { POSES, TECNICA, ARESTAS, LADO_DISTANTE, CENA } from '../data/poses.js'

const DURACAO_MS = 1900
const DESLOCAMENTO = [3, -3] // lado distante da câmera
const CONFIANCA_BAIXA = 0.65

const suavizar = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2)
const copiar = (pontos) => pontos.map((p) => [...p])

// Contorno do leito, chão e grade sutil. Fundo neutro, nenhuma imagem.
export function Cena({ children, id = 'cena', className = '', rotulo }) {
  const { largura, altura, topo, colchao, chao } = CENA
  return (
    <svg viewBox={`0 ${topo} ${largura} ${altura - topo}`} className={className} role="img" aria-label={rotulo}>
      <defs>
        <pattern id={`grade-${id}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--linha)" strokeWidth="0.6" opacity="0.55" />
        </pattern>
      </defs>
      <rect y={topo} width={largura} height={altura - topo} fill="var(--superficie-2)" />
      <rect y={topo} width={largura} height={altura - topo} fill={`url(#grade-${id})`} />
      <g fill="none" stroke="var(--sensor)" strokeWidth="2" strokeLinejoin="round">
        {/* cabeceira */}
        <rect x="48" y="148" width="10" height={chao - 148} rx="3" />
        {/* pés do leito */}
        <rect x="335" y="178" width="9" height={chao - 178} rx="3" />
        {/* colchão e estrado */}
        <rect x="58" y={colchao} width="277" height="16" rx="4" fill="var(--superficie)" />
        <line x1="58" y1={colchao + 24} x2="335" y2={colchao + 24} />
        <line x1="72" y1={colchao + 24} x2="72" y2={chao} />
        <line x1="322" y1={colchao + 24} x2="322" y2={chao} />
        {/* travesseiro */}
        <rect x="64" y={colchao - 9} width="44" height="10" rx="5" fill="var(--superficie)" strokeWidth="1.5" />
      </g>
      <line x1="10" y1={chao} x2={largura - 10} y2={chao} stroke="var(--secundario)" strokeWidth="2" />
      {children}
    </svg>
  )
}

// Desenha um esqueleto a partir de 17 pontos [x, y, confiança].
export function DesenhoEsqueleto({ pontos, cor = 'var(--marca)', indices = false, opacidade = 1 }) {
  const pos = pontos.map(([x, y, c], i) => (LADO_DISTANTE.has(i) ? [x + DESLOCAMENTO[0], y + DESLOCAMENTO[1], c] : [x, y, c]))
  const ordem = (a, b) => (LADO_DISTANTE.has(a) && LADO_DISTANTE.has(b) ? 0 : 1)
  const arestas = [...ARESTAS].sort((x, y) => ordem(...x) - ordem(...y))
  return (
    <g opacity={opacidade}>
      {arestas.map(([a, b]) => {
        const c = Math.min(pos[a][2], pos[b][2])
        const distante = LADO_DISTANTE.has(a) && LADO_DISTANTE.has(b)
        const baixa = c < CONFIANCA_BAIXA
        return (
          <line
            key={`${a}-${b}`}
            x1={pos[a][0]}
            y1={pos[a][1]}
            x2={pos[b][0]}
            y2={pos[b][1]}
            stroke={cor}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={baixa ? '5 5' : undefined}
            opacity={(distante ? 0.5 : 1) * (baixa ? 0.55 : 1)}
          />
        )
      })}
      {pos.map(([x, y, c], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i <= 4 ? 3 : 4.5}
          fill={c < CONFIANCA_BAIXA ? 'var(--superficie)' : cor}
          stroke={cor}
          strokeWidth="2"
          opacity={(LADO_DISTANTE.has(i) ? 0.5 : 1) * (c < CONFIANCA_BAIXA ? 0.6 : 1)}
        />
      ))}
      {indices &&
        pos.map(([x, y], i) => (
          <text
            key={`t${i}`}
            x={x + (LADO_DISTANTE.has(i) ? 6 : -6)}
            y={y - 6}
            fontSize="10"
            fontWeight="700"
            textAnchor={LADO_DISTANTE.has(i) ? 'start' : 'end'}
            fill={LADO_DISTANTE.has(i) ? 'var(--secundario)' : 'var(--tinta)'}
          >
            {i}
          </text>
        ))}
    </g>
  )
}

// Interpola ponto a ponto até a pose-alvo, com respiração (repouso) e balanço (tentando levantar).
function useEsqueletoAnimado(pose) {
  const baseRef = useRef(copiar(POSES[pose].pontos))
  const [quadro, setQuadro] = useState(baseRef.current)

  useEffect(() => {
    const de = copiar(baseRef.current)
    const para = POSES[pose].pontos
    const inicio = performance.now()
    let raf
    const passo = (agoraMs) => {
      const k = Math.min(1, (agoraMs - inicio) / DURACAO_MS)
      const e = suavizar(k)
      const base = de.map((p, i) => [p[0] + (para[i][0] - p[0]) * e, p[1] + (para[i][1] - p[1]) * e, p[2] + (para[i][2] - p[2]) * e])
      baseRef.current = base
      const s = agoraMs / 1000
      let pts = base
      if (pose === 'repouso') {
        // respiração de ±1 px nos ombros
        const r = Math.sin((s * 2 * Math.PI) / 4) * e
        pts = base.map((p, i) => (i === 5 || i === 6 ? [p[0], p[1] - r, p[2]] : p))
      } else if (pose === 'levantando') {
        // balanço lateral suave de ±3 px; pés firmes no chão
        const b = Math.sin((s * 2 * Math.PI) / 1.8) * 3 * e
        pts = base.map((p, i) => {
          const peso = i >= 15 ? 0 : i >= 13 ? 0.4 : 1
          return [p[0] + b * peso, p[1], p[2]]
        })
      }
      setQuadro(pts)
      raf = requestAnimationFrame(passo)
    }
    raf = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(raf)
  }, [pose])

  return quadro
}

export default function EsqueletoAnimado({ pose, tecnica = false, aviso = null, className = '' }) {
  const pontos = useEsqueletoAnimado(pose)
  return (
    <Cena id="leito" className={className} rotulo={`Esqueleto de 17 pontos, pose ${POSES[pose].rotulo}`}>
      {!aviso && <DesenhoEsqueleto pontos={pontos} />}
      {!aviso && tecnica && <DesenhoEsqueleto pontos={TECNICA.pontos} cor="var(--secundario)" />}
      {aviso && (
        <g>
          <rect x="90" y="96" width="300" height="56" rx="4" fill="var(--superficie)" stroke="var(--sensor)" strokeWidth="1.5" />
          <text x="240" y="129" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--secundario)">
            {aviso}
          </text>
        </g>
      )}
    </Cena>
  )
}
