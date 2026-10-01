import { Check, Ban, Users } from 'lucide-react'
import Selo from './Selo.jsx'
import { TORRES, nomeAndar, LEITOS } from '../data/hospital.js'
import { ESTADOS } from '../data/estados.js'
import { DESFECHOS, ordenarEventos } from '../data/eventos.js'
import { decimal, duracao } from '../lib/formato.js'

const GUARDA = ['Leito', 'Horário', 'Tipo de evento', 'Origem', 'Confiança', 'Desfecho']
const NUNCA = ['Imagem', 'Vídeo', 'Áudio', 'Rosto', 'Nome do paciente']

// Eventos criados na demonstração ficam no topo: primeiro o alerta atendido, depois os registros.
function ordenar(lista) {
  const demo = lista.filter((e) => e.criadoNaDemo)
  const resto = lista.filter((e) => !e.criadoNaDemo)
  const peso = (e) => (e.desfecho === 'Registrado (atenuado)' ? 1 : 0)
  demo.sort((a, b) => peso(a) - peso(b) || b.ordem - a.ordem)
  return [...demo, ...ordenarEventos(resto)]
}

function Filtro({ rotulo, valor, onChange, opcoes }) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[15px] text-secundario">{rotulo}</span>
      <select value={valor} onChange={(e) => onChange(e.target.value)} className="min-h-11 rounded border border-linha bg-superficie px-2 font-bold text-tinta">
        {opcoes.map(([v, r]) => (
          <option key={v} value={v}>
            {r}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function Historico({ state, agir }) {
  const f = state.filtros
  const filtrar = (campo) => (valor) => agir({ type: 'FILTRO', campo, valor })
  const eventos = ordenar(
    state.eventos.filter(
      (e) =>
        (f.torre === 'todas' || e.torre === Number(f.torre)) &&
        e.plantao === f.plantao &&
        (f.origem === 'todas' || (f.origem === 'movimento' ? e.origem === 'modelo' : e.origem === 'sistema')) &&
        (f.desfecho === 'todos' || e.desfecho === f.desfecho),
    ),
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold leading-tight">Histórico de eventos</h1>
          <p className="text-secundario">Somente metadados. Nenhuma imagem é armazenada. Clique numa linha para ver os bastidores.</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <Filtro rotulo="Torre" valor={f.torre} onChange={filtrar('torre')} opcoes={[['todas', 'Todas'], ...TORRES.map((t) => [String(t.numero), `Torre ${t.numero}`])]} />
          <Filtro rotulo="Plantão" valor={f.plantao} onChange={filtrar('plantao')} opcoes={[['atual', 'Atual (desde 19:00)'], ['anterior', 'Anterior']]} />
          <Filtro rotulo="Origem" valor={f.origem} onChange={filtrar('origem')} opcoes={[['todas', 'Todas'], ['movimento', 'Movimento'], ['contexto', 'Contexto']]} />
          <Filtro rotulo="Desfecho" valor={f.desfecho} onChange={filtrar('desfecho')} opcoes={[['todos', 'Todos'], ...DESFECHOS.map((d) => [d, d])]} />
        </div>
      </div>

      <div className="overflow-hidden rounded border border-linha bg-superficie">
        <table className="w-full border-collapse text-left">
          <thead className="bg-superficie-2 text-[15px] text-secundario">
            <tr>
              <th className="px-3 py-2 font-bold">Horário</th>
              <th className="px-3 py-2 font-bold">Leito</th>
              <th className="px-3 py-2 font-bold">Evento</th>
              <th className="px-3 py-2 font-bold">Origem</th>
              <th className="px-3 py-2 text-right font-bold">Confiança</th>
              <th className="px-3 py-2 text-right font-bold">Tempo de resposta</th>
              <th className="px-3 py-2 font-bold">Desfecho</th>
            </tr>
          </thead>
          <tbody>
            {eventos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-secundario">
                  Nenhum evento com estes filtros.
                </td>
              </tr>
            )}
            {eventos.map((e) => {
              const leito = LEITOS[e.leito]
              return (
                <tr
                  key={e.id}
                  tabIndex={0}
                  onClick={() => agir({ type: 'BASTIDORES', evento: e })}
                  onKeyDown={(k) => {
                    if (k.key === 'Enter' || k.key === ' ') {
                      k.preventDefault()
                      agir({ type: 'BASTIDORES', evento: e })
                    }
                  }}
                  aria-label={`Leito ${e.numero}, ${e.horario}: ver bastidores`}
                  className={`cursor-pointer border-t border-linha hover:bg-superficie-2 ${e.criadoNaDemo ? 'bg-marca/[0.07]' : ''}`}
                >
                  <td className="num px-3 py-2 font-bold">{e.horario}</td>
                  <td className="px-3 py-2 leading-tight">
                    <span className="block text-lg font-bold">{e.numero}</span>
                    <span className="block text-[14px] text-secundario">
                      Torre {e.torre}, {nomeAndar(leito.andar)}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="flex flex-col items-start gap-1">
                      <Selo chave={e.estado} pequeno rotulo={ESTADOS[e.estado].rotuloCurto} />
                      {e.atenuado && (
                        <span className="inline-flex items-center gap-1 text-[14px] text-secundario">
                          <Users className="size-4" aria-hidden="true" /> atenuado: acompanhante
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-2">{e.origem === 'modelo' ? 'Modelo' : 'Sistema'}</td>
                  <td className="num px-3 py-2 text-right">{e.confianca != null ? decimal(e.confianca) : ''}</td>
                  <td className="num px-3 py-2 text-right">{e.tempoResposta != null ? duracao(e.tempoResposta) : '—'}</td>
                  <td className="px-3 py-2">{e.desfecho}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <section className="grid grid-cols-2 gap-4 rounded border border-linha bg-superficie p-4" aria-label="Dados armazenados">
        <div>
          <h2 className="mb-1.5 font-bold">O que o VIGIA guarda</h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {GUARDA.map((g) => (
              <li key={g} className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-marca" aria-hidden="true" /> {g}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-1.5 font-bold">O que o VIGIA nunca guarda</h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {NUNCA.map((g) => (
              <li key={g} className="inline-flex items-center gap-1.5">
                <Ban className="size-4 text-vermelho" aria-hidden="true" /> {g}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
