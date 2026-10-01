import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import FaixaDemo from './components/FaixaDemo.jsx'
import Cabecalho from './components/Cabecalho.jsx'
import { reducer, criarEstadoInicial } from './estado/reducer.js'
import { alertasDaTorre, alertasDoPosto, estadoVisivel } from './estado/seletores.js'
import { indicadorEtapa } from './data/cenario.js'
import { TORRES, LEITOS, postoPorId } from './data/hospital.js'
import { ESTADOS } from './data/estados.js'
import { INICIO_RELOGIO, duracao } from './lib/formato.js'

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
        {state.aba === 'painel' && <PainelProvisorio state={state} agora={agora} agir={agir} />}
        {state.aba === 'historico' && <p className="text-secundario">Histórico de eventos: chega na Fase 4.</p>}
        {state.aba === 'projeto' && <p className="text-secundario">Página do projeto: chega na Fase 5.</p>}
      </main>
    </div>
  )
}

// Provisório da Fase 1: lista simples para conferir o estado global. A Fase 2 troca pelo painel real.
function PainelProvisorio({ state, agora, agir }) {
  const posto = postoPorId(state.posto)
  const monitorados = posto.leitos.filter((id) => LEITOS[id].monitorado)
  const { ativos, atenuados } = alertasDoPosto(state, state.posto, agora)
  return (
    <div className="max-w-3xl rounded border border-linha bg-superficie p-4">
      <p className="text-secundario">
        Fundação pronta. {monitorados.length} de {posto.leitos.length} leitos monitorados. Fila: {ativos.length} ativo(s),{' '}
        {atenuados.length} atenuado(s). O painel completo chega na Fase 2.
      </p>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {monitorados.map((id) => {
          const d = state.leitos[id]
          const e = ESTADOS[estadoVisivel(d, agora)]
          return (
            <li key={id}>
              <button type="button" onClick={() => agir({ type: 'ABRIR_LEITO', leito: id })} className="w-full min-h-11 rounded border border-linha px-3 py-2 text-left">
                <span className="text-xl font-bold">{LEITOS[id].numero}</span>{' '}
                <span>{e.rotulo}</span> <span className="num text-secundario">{duracao(agora - d.desde)}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
