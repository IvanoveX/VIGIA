import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import FaixaDemo from './components/FaixaDemo.jsx'
import Cabecalho from './components/Cabecalho.jsx'
import { reducer, criarEstadoInicial } from './estado/reducer.js'
import Painel from './components/Painel.jsx'
import { ArrowLeft } from 'lucide-react'
import { alertasDaTorre } from './estado/seletores.js'
import { indicadorEtapa } from './data/cenario.js'
import { TORRES, LEITOS } from './data/hospital.js'
import { INICIO_RELOGIO } from './lib/formato.js'

function alternarTelaCheia() {
  try {
    if (document.fullscreenElement) document.exitFullscreen?.()
    else document.documentElement.requestFullscreen?.()?.catch?.(() => {})
  } catch {
    // Navegador sem Fullscreen API: ignora.
  }
}

function campoDeTexto(el) {
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, criarEstadoInicial)

  // Relógio simulado: 03:40:00 a cada reinício, andando em tempo real.
  const inicioRef = useRef(performance.now())
  const lerRelogio = useCallback(() => INICIO_RELOGIO + Math.floor((performance.now() - inicioRef.current) / 1000), [])
  const [agora, setAgora] = useState(INICIO_RELOGIO)
  useEffect(() => {
    const id = setInterval(() => setAgora(lerRelogio()), 200)
    return () => clearInterval(id)
  }, [lerRelogio])

  // Toda ação leva o horário simulado do momento.
  const agir = useCallback((acao) => dispatch({ ...acao, t: lerRelogio() }), [lerRelogio])

  const reiniciar = useCallback(() => {
    inicioRef.current = performance.now()
    setAgora(INICIO_RELOGIO)
    dispatch({ type: 'REINICIAR' })
  }, [])
  const proxima = useCallback(() => agir({ type: 'PROXIMA_ETAPA' }), [agir])

  // Atalhos: seta para a direita, R e F. Ignorados em campos de texto.
  useEffect(() => {
    function aoTeclar(e) {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || campoDeTexto(e.target)) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        proxima()
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        reiniciar()
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        alternarTelaCheia()
      }
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [proxima, reiniciar])

  const alertasPorTorre = Object.fromEntries(TORRES.map((t) => [t.numero, alertasDaTorre(state, t.numero, agora)]))

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <FaixaDemo indicador={indicadorEtapa(state)} onProxima={proxima} onReiniciar={reiniciar} onTelaCheia={alternarTelaCheia} />
      <Cabecalho
        aba={state.aba}
        torre={state.torre}
        posto={state.posto}
        agora={agora}
        alertasPorTorre={alertasPorTorre}
        onAba={(aba) => agir({ type: 'ABA', aba })}
        onTorre={(torre) => agir({ type: 'TORRE', torre })}
        onPosto={(posto) => agir({ type: 'POSTO', posto })}
      />
      <main className="flex-1 p-4">
        {state.aba === 'painel' && !state.leitoAberto && <Painel state={state} agora={agora} agir={agir} />}
        {state.aba === 'painel' && state.leitoAberto && <DetalheProvisorio state={state} agir={agir} />}
        {state.aba === 'historico' && <p className="text-secundario">Histórico de eventos: chega na Fase 4.</p>}
        {state.aba === 'projeto' && <p className="text-secundario">Página do projeto: chega na Fase 5.</p>}
      </main>
    </div>
  )
}

// Provisório da Fase 2: a Fase 3 troca pelo detalhe completo do leito.
function DetalheProvisorio({ state, agir }) {
  const l = LEITOS[state.leitoAberto]
  return (
    <div className="flex flex-col items-start gap-3">
      <button type="button" onClick={() => agir({ type: 'FECHAR_LEITO' })} className="inline-flex min-h-11 items-center gap-2 rounded border border-linha bg-superficie px-3 font-bold">
        <ArrowLeft className="size-5" aria-hidden="true" /> Painel
      </button>
      <h1 className="text-[28px] font-bold">Leito {l.numero}</h1>
      <p className="text-secundario">O detalhe do leito (esqueleto, sequência e linha do tempo) chega na Fase 3.</p>
    </div>
  )
}
