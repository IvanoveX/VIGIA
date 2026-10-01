import { Info, X } from 'lucide-react'
import CartaoLeito, { CartaoNaoMonitorado } from './CartaoLeito.jsx'
import FilaAlertas from './FilaAlertas.jsx'
import Legenda from './Legenda.jsx'
import { LEITOS, postoPorId, nomeAndar } from '../data/hospital.js'
import { situacao, alertasDoPosto } from '../estado/seletores.js'

export default function Painel({ state, agora, agir }) {
  const posto = postoPorId(state.posto)
  const monitorados = posto.leitos.filter((id) => LEITOS[id].monitorado)
  const visiveis = state.mostrarTodos ? posto.leitos : monitorados
  const { ativos, atenuados } = alertasDoPosto(state, state.posto, agora)
  const abrir = (id) => agir({ type: 'ABRIR_LEITO', leito: id })
  const dica = state.dica && agora - state.dica.t < 5 ? state.dica : null

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[minmax(0,7fr)_minmax(250px,3fr)] gap-4">
        <section aria-labelledby="titulo-posto" className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div>
              <h1 id="titulo-posto" className="text-xl font-bold leading-tight">
                Torre {posto.torre}, {nomeAndar(posto.andar)}, {posto.setor}
              </h1>
              <p className="text-secundario">
                <span className="num font-bold text-tinta">{monitorados.length}</span> de{' '}
                <span className="num font-bold text-tinta">{posto.leitos.length}</span> leitos monitorados
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={state.mostrarTodos}
              onClick={() => agir({ type: 'MOSTRAR_TODOS' })}
              className="inline-flex min-h-11 items-center gap-3 rounded px-2 text-[16px]"
            >
              <span
                className={`relative h-6 w-11 rounded-full border-2 transition-colors ${
                  state.mostrarTodos ? 'border-marca bg-marca' : 'border-sensor bg-superficie'
                }`}
                aria-hidden="true"
              >
                <span
                  className={`absolute top-0.5 size-4 rounded-full transition-[left] ${
                    state.mostrarTodos ? 'left-[22px] bg-superficie' : 'left-0.5 bg-sensor'
                  }`}
                />
              </span>
              Mostrar todos os leitos do posto
            </button>
          </div>

          {dica && (
            <p className="flex items-center gap-2 rounded border border-linha bg-superficie px-3 py-2" role="status">
              <Info className="size-5 shrink-0 text-marca" aria-hidden="true" />
              <span className="flex-1">
                <strong>Leito {LEITOS[dica.leito].numero}.</strong> Monitoramento ativado pela enfermagem para leitos de risco.
              </span>
              <button type="button" onClick={() => agir({ type: 'FECHAR_DICA' })} className="inline-flex size-11 items-center justify-center rounded" aria-label="Fechar dica">
                <X className="size-5" aria-hidden="true" />
              </button>
            </p>
          )}

          <ul className={`grid gap-3 ${state.mostrarTodos ? 'grid-cols-4' : 'grid-cols-3'}`}>
            {visiveis.map((id) => (
              <li key={id} className="grid">
                {LEITOS[id].monitorado ? (
                  <CartaoLeito s={situacao(state, id, agora)} agora={agora} onClick={() => abrir(id)} />
                ) : (
                  <CartaoNaoMonitorado numero={LEITOS[id].numero} onClick={() => abrir(id)} />
                )}
              </li>
            ))}
          </ul>
        </section>

        <aside className="min-w-0">
          <FilaAlertas ativos={ativos} atenuados={atenuados} agora={agora} onAbrir={abrir} />
        </aside>
      </div>
      <Legenda />
    </div>
  )
}
