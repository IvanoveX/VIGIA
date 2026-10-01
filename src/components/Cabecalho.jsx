import { LayoutGrid, History, FileText } from 'lucide-react'
import Marca from './Marca.jsx'
import Relogio from './Relogio.jsx'
import { TORRES, postosDaTorre, nomeAndar } from '../data/hospital.js'

const ABAS = [
  { chave: 'painel', rotulo: 'Painel', icone: LayoutGrid },
  { chave: 'historico', rotulo: 'Histórico', icone: History },
  { chave: 'projeto', rotulo: 'Projeto', icone: FileText },
]

export default function Cabecalho({ aba, torre, posto, agora, alertasPorTorre, onAba, onTorre, onPosto }) {
  return (
    <header className="border-b border-linha bg-superficie">
      <div className="flex items-center gap-6 px-4 pt-2">
        <Marca />
        <nav className="flex self-end" aria-label="Seções">
          {ABAS.map(({ chave, rotulo, icone: Icone }) => {
            const ativa = aba === chave
            return (
              <button
                key={chave}
                type="button"
                onClick={() => onAba(chave)}
                aria-current={ativa ? 'page' : undefined}
                className={`inline-flex min-h-11 items-center gap-2 border-b-[3px] px-4 font-bold transition-colors ${
                  ativa ? 'border-marca text-tinta' : 'border-transparent text-secundario hover:text-tinta'
                }`}
              >
                <Icone className="size-5" aria-hidden="true" />
                {rotulo}
              </button>
            )
          })}
        </nav>
        <div className="ml-auto flex items-baseline gap-3 pb-1">
          <span className="text-[15px] text-secundario">Plantão noturno</span>
          <Relogio segundos={agora} className="text-[34px] leading-none" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-linha bg-superficie-2 px-4 py-1.5">
        <div className="flex items-center gap-2" role="group" aria-label="Torre">
          <span className="text-[15px] text-secundario">Torre</span>
          {TORRES.map((t) => {
            const ativa = t.numero === torre
            const qtd = alertasPorTorre[t.numero] || 0
            return (
              <button
                key={t.numero}
                type="button"
                onClick={() => onTorre(t.numero)}
                aria-pressed={ativa}
                aria-label={`Torre ${t.numero}${qtd ? `, ${qtd} alerta${qtd > 1 ? 's' : ''} ativo${qtd > 1 ? 's' : ''}` : ''}`}
                className={`relative inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded border px-3 text-lg font-bold ${
                  ativa ? 'border-tinta bg-tinta text-superficie' : 'border-linha bg-superficie text-tinta hover:border-secundario'
                }`}
              >
                {t.numero}
                {qtd > 0 && (
                  <span className="num inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ambar px-1 text-[13px] text-ambar-texto">
                    {qtd}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <label className="flex items-center gap-2">
          <span className="text-[15px] text-secundario">Posto</span>
          <select
            value={posto}
            onChange={(e) => onPosto(e.target.value)}
            className="min-h-11 rounded border border-linha bg-superficie px-3 font-bold text-tinta"
          >
            {postosDaTorre(torre).map((p) => (
              <option key={p.id} value={p.id}>
                {nomeAndar(p.andar)}, {p.setor}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  )
}
