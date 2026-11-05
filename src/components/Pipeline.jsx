import { useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import EsqueletoReal from './EsqueletoReal.jsx'
import LinhaTempoClipe from './LinhaTempoClipe.jsx'
import { carregarIndice, carregarClipe, quadroNoTempo, trilhas } from '../lib/clipes.js'
import { STATUS_MODELO, TEXTO_DADOS, TEXTO_BASELINE, TEXTO_REGRAS } from '../data/pipeline.js'

const CARTAO = 'rounded border border-linha bg-superficie p-3'

// Depois de um clique com o mouse, tira o foco: espaço em botão focado dispararia de novo.
function soltarFoco(e) {
  if (e.detail > 0) e.currentTarget.blur()
}

function Botao({ onClick, icone: Icone, children, forte = false }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        soltarFoco(e)
        onClick()
      }}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded px-3 font-bold transition-colors ${
        forte ? 'bg-marca text-white hover:bg-marca/90' : 'border border-linha bg-superficie text-tinta hover:border-secundario'
      }`}
    >
      <Icone className="size-5 shrink-0" aria-hidden="true" />
      {children}
    </button>
  )
}

// Carrega o índice e todos os clipes ao abrir a aba.
function useClipes() {
  const [estado, setEstado] = useState({ carregando: true, erro: null, clipes: [] })
  useEffect(() => {
    let ativo = true
    carregarIndice()
      .then((indice) => Promise.all(indice.map((c) => carregarClipe(c.id))))
      .then((clipes) => ativo && setEstado({ carregando: false, erro: null, clipes }))
      .catch((e) => ativo && setEstado({ carregando: false, erro: e.message, clipes: [] }))
    return () => {
      ativo = false
    }
  }, [])
  return estado
}

// Avança o tempo do clipe em tempo real; pausa sozinho ao chegar ao fim.
function useReproducao(duracao) {
  const [tempo, setTempo] = useState(0)
  const [tocando, setTocando] = useState(false)
  const tempoRef = useRef(0)
  tempoRef.current = tempo
  // Em ref para o Recomeçar poder mudar o início com o laço já rodando.
  const inicioRef = useRef(0)

  useEffect(() => {
    if (!tocando) return undefined
    inicioRef.current = performance.now() - tempoRef.current * 1000
    let raf
    const passo = (agoraMs) => {
      const t = Math.max(0, Math.min(duracao, (agoraMs - inicioRef.current) / 1000))
      setTempo(t)
      if (t >= duracao) setTocando(false)
      else raf = requestAnimationFrame(passo)
    }
    raf = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(raf)
  }, [tocando, duracao])

  const alternar = () => {
    if (!tocando && tempo >= duracao) setTempo(0)
    setTocando(!tocando)
  }
  const recomecar = () => {
    inicioRef.current = performance.now()
    setTempo(0)
    setTocando(true)
  }
  const buscar = (t) => {
    setTempo(t)
    setTocando(false)
  }
  return { tempo, tocando, alternar, recomecar, buscar }
}

function ListaClipes({ clipes, atual, onEscolher }) {
  return (
    <div className={`${CARTAO} flex flex-col gap-2`}>
      <h2 className="text-lg font-bold">Clipes</h2>
      {clipes.map((c, i) => (
        <button
          key={c.id_clipe}
          type="button"
          onClick={(e) => {
            soltarFoco(e)
            onEscolher(i)
          }}
          aria-pressed={i === atual}
          className={`min-h-11 rounded border px-3 py-1.5 text-left font-bold leading-tight transition-colors ${
            i === atual ? 'border-marca bg-marca text-white' : 'border-linha bg-superficie text-tinta hover:border-secundario'
          }`}
        >
          {c.id_clipe}
        </button>
      ))}
    </div>
  )
}

function Credito({ origem }) {
  return (
    <div className={CARTAO}>
      <h2 className="text-lg font-bold">Origem dos dados</h2>
      <p className="mt-1 font-bold">{origem.dataset}</p>
      <p className="text-[14px] leading-tight text-secundario">Licença: {origem.licenca}</p>
      <p className="mt-1 break-words text-[14px] leading-tight text-secundario">{origem.citacao}</p>
      <a href={origem.url} target="_blank" rel="noreferrer" className="mt-1 block break-all text-[14px] leading-tight text-marca underline">
        {origem.url}
      </a>
    </div>
  )
}

function NotasDaAba() {
  return (
    <div className={`${CARTAO} flex flex-col gap-1.5 text-[14px] leading-tight text-secundario`}>
      <p>{TEXTO_DADOS}</p>
      <p>{TEXTO_BASELINE}</p>
      <p>{STATUS_MODELO}</p>
      <p>{TEXTO_REGRAS}</p>
    </div>
  )
}

function Aviso({ titulo, texto }) {
  return (
    <div className={CARTAO} role="status">
      <h2 className="text-lg font-bold">{titulo}</h2>
      <p className="mt-1 text-secundario">{texto}</p>
    </div>
  )
}

function Reprodutor({ clipe }) {
  const duracao = clipe.video.duracao_s
  const { tempo, tocando, alternar, recomecar, buscar } = useReproducao(duracao)
  const quadro = clipe.quadros[quadroNoTempo(clipe.quadros, tempo)]
  const { largura, altura } = clipe.video
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[minmax(0,1fr)_17rem] items-start gap-3">
        <div className={CARTAO}>
          <EsqueletoReal pontos={quadro.pontos} largura={largura} altura={altura} poligono={clipe.leito?.poligono} />
          <div className="mt-3 flex gap-2">
            <Botao onClick={alternar} icone={tocando ? Pause : Play} forte>
              {tocando ? 'Pausar' : 'Tocar'}
            </Botao>
            <Botao onClick={recomecar} icone={RotateCcw}>
              Recomeçar
            </Botao>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Credito origem={clipe.origem} />
          <NotasDaAba />
        </div>
      </div>
      <div className={CARTAO}>
        <LinhaTempoClipe duracao={duracao} tempo={tempo} trilhas={trilhas(clipe)} onBuscar={buscar} />
      </div>
    </div>
  )
}

export default function Pipeline() {
  const { carregando, erro, clipes } = useClipes()
  const [atual, setAtual] = useState(0)

  let corpo
  if (carregando) corpo = <Aviso titulo="Carregando clipes" texto="Lendo os arquivos de esqueletos." />
  else if (erro) corpo = <Aviso titulo="Não foi possível mostrar os clipes" texto={erro} />
  else if (clipes.length === 0) corpo = <Aviso titulo="Nenhum clipe disponível" texto="O índice de clipes está vazio." />
  else {
    // key reinicia o tempo e a reprodução ao trocar de clipe.
    corpo = (
      <div className="grid grid-cols-[13rem_minmax(0,1fr)] items-start gap-3">
        <ListaClipes clipes={clipes} atual={atual} onEscolher={setAtual} />
        <Reprodutor key={clipes[atual].id_clipe} clipe={clipes[atual]} />
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-3 text-lg font-bold">Pipeline de pose</h1>
      {corpo}
    </div>
  )
}
