import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import Selo from './Selo.jsx'
import { Cena, DesenhoEsqueleto } from './Esqueleto.jsx'
import { POSES } from '../data/poses.js'
import { ESTADOS, FASES, CANAIS } from '../data/estados.js'
import { LEITOS, nomeAndar } from '../data/hospital.js'
import { decimal, duracao } from '../lib/formato.js'

const COR_BARRA = { ambar: 'bg-ambar', laranja: 'bg-laranja', vermelho: 'bg-vermelho', calmo: 'bg-secundario' }

function Passo({ numero, titulo, children }) {
  return (
    <li className="grid grid-cols-[2rem_1fr] gap-x-3 border-t border-linha py-3 first:border-t-0">
      <span className="num flex size-8 items-center justify-center rounded-full bg-tinta font-bold text-superficie" aria-hidden="true">
        {numero}
      </span>
      <div className="min-w-0">
        <h3 className="mb-1 font-bold leading-8">{titulo}</h3>
        <div className="flex flex-col gap-1 text-[16px]">{children}</div>
      </div>
    </li>
  )
}

function Campo({ rotulo, children }) {
  return (
    <p>
      <span className="text-secundario">{rotulo}:</span> {children}
    </p>
  )
}

// Barras horizontais das quatro classes de movimento, com o limiar do leito.
function Probabilidades({ probs, limiar }) {
  const linhas = FASES.map((f) => [f, probs[f] ?? 0]).sort((a, b) => b[1] - a[1])
  return (
    <div className="mt-1">
      <div className="relative flex flex-col gap-1.5 pr-1">
        {linhas.map(([f, p], i) => (
          <div key={f} className="grid grid-cols-[9.5rem_1fr_2.6rem] items-center gap-2">
            <span className="truncate text-[15px]">{ESTADOS[f].rotulo}</span>
            <span className="relative h-4 rounded-sm bg-superficie-2 ring-1 ring-linha">
              <span className={`absolute inset-y-0 left-0 rounded-sm ${i === 0 ? COR_BARRA[ESTADOS[f].tom] : 'bg-sensor'}`} style={{ width: `${p * 100}%` }} />
              {/* limiar do leito */}
              <span className="absolute -inset-y-1 w-0.5 bg-tinta" style={{ left: `${limiar * 100}%` }} aria-hidden="true" />
            </span>
            <span className="num text-right text-[15px] font-bold">{decimal(p)}</span>
          </div>
        ))}
      </div>
      <p className="mt-1 text-[14px] text-secundario">
        Linha vertical: limiar deste leito, <span className="num">{decimal(limiar)}</span> (sensibilidade {limiar < 0.6 ? 'alta' : 'padrão'}).
      </p>
    </div>
  )
}

export default function Bastidores({ evento, onFechar }) {
  const fecharRef = useRef(null)
  useEffect(() => {
    fecharRef.current?.focus()
  }, [evento])

  const leito = LEITOS[evento.leito]
  const e = ESTADOS[evento.estado]
  const movimento = FASES.includes(evento.estado)
  const b = evento.bastidores
  let resultado
  if (b.pausado) resultado = 'leito pausado, nenhum alerta'
  else if (!movimento) resultado = 'alerta de contexto gerado pela regra'
  else if (evento.estado === 'repouso') resultado = 'nenhum alerta'
  else if (evento.atenuado) resultado = e.atenuacao?.registro ? 'atenuado: vira só registro' : 'atenuado: alerta visual, sem som'
  else resultado = 'alerta sem atenuação'

  const registro = [
    ['Leito', `${evento.numero}`],
    ['Torre', `${evento.torre}`],
    ['Posto', `${nomeAndar(leito.andar)}, ${leito.setor}`],
    ['Evento', e.rotulo],
    ['Origem', evento.origem === 'modelo' ? 'Modelo' : 'Sistema'],
    ['Horário', evento.horario],
    ['Confiança', evento.confianca != null ? decimal(evento.confianca) : 'não se aplica'],
    ['Canais notificados', evento.canais.length ? evento.canais.map((c) => CANAIS[c]).join(', ') : 'nenhum (só registro)'],
    ['Tempo de resposta', evento.tempoResposta != null ? duracao(evento.tempoResposta) : '—'],
    ['Desfecho', evento.desfecho],
  ]

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="titulo-bastidores">
      <button type="button" className="absolute inset-0 cursor-default bg-tinta/40" aria-label="Fechar bastidores" tabIndex={-1} onClick={onFechar} />
      <aside className="relative flex h-full w-[min(580px,94vw)] flex-col border-l border-linha bg-superficie">
        <header className="flex items-start gap-3 border-b border-linha px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="titulo-bastidores" className="text-xl font-bold leading-tight">
                Como este alerta foi gerado
              </h2>
              <span className="rounded border border-secundario px-1.5 text-[14px] font-bold text-secundario">valores ilustrativos</span>
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-secundario">
              <span>
                Leito <strong className="text-tinta">{evento.numero}</strong>, Torre {evento.torre}, às <span className="num">{evento.horario}</span>
              </span>
              <Selo chave={evento.estado} pequeno rotulo={e.rotuloCurto} />
            </p>
          </div>
          <button
            ref={fecharRef}
            type="button"
            onClick={onFechar}
            className="inline-flex min-h-11 items-center gap-1.5 rounded border border-linha px-3 font-bold hover:border-secundario"
          >
            <X className="size-5" aria-hidden="true" /> Fechar
          </button>
        </header>

        <ol className="flex-1 overflow-y-auto px-4 py-1">
          <Passo numero={1} titulo="Percepção">
            <div className="flex gap-3">
              <div className="min-w-0 flex-1">
                <Campo rotulo="Entrada">
                  imagem de <span className="num">640×480×3 = 921.600</span> valores por quadro, descartada no dispositivo
                </Campo>
                <Campo rotulo="Saída">
                  <span className="num">17</span> pontos × (x, y, confiança) = <span className="num">51</span> valores
                </Campo>
                <Campo rotulo="Estimador">candidatos em avaliação (YOLO-pose, RTMPose, MediaPipe)</Campo>
              </div>
              <div className="w-36 shrink-0 overflow-hidden rounded border border-linha">
                <Cena id="mini" className="w-full" rotulo="Esqueleto ilustrativo">
                  {POSES[evento.estado] && <DesenhoEsqueleto pontos={POSES[evento.estado].pontos} />}
                </Cena>
              </div>
            </div>
          </Passo>

          <Passo numero={2} titulo="Janela temporal">
            <p>
              Cerca de <span className="num">2 s</span> a <span className="num">30</span> quadros/s: <strong className="num">3.060</strong> valores, contra cerca de{' '}
              <span className="num">55</span> milhões em pixels.
            </p>
          </Passo>

          <Passo numero={3} titulo="Decisão (aprendida)">
            {movimento && b.probabilidades ? (
              <>
                <Campo rotulo="Rede temporal">candidatas em avaliação (ST-GCN, LSTM/GRU)</Campo>
                <Probabilidades probs={b.probabilidades} limiar={b.limiar} />
              </>
            ) : (
              <p>Não se aplica: evento de contexto.</p>
            )}
          </Passo>

          <Passo numero={4} titulo="Contexto (regras do sistema)">
            {movimento ? (
              <>
                <Campo rotulo="Pessoas detectadas">
                  <span className="num">{b.pessoas}</span>
                </Campo>
                <Campo rotulo="Leito pausado">{b.pausado ? 'sim' : 'não'}</Campo>
              </>
            ) : (
              <Campo rotulo="Regra">nenhum esqueleto na área do leito há 10 min</Campo>
            )}
            <Campo rotulo="Resultado">
              <strong>{resultado}</strong>
            </Campo>
          </Passo>

          <Passo numero={5} titulo="Registro">
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 rounded border border-linha bg-superficie-2 p-3 text-[15px]">
              {registro.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-secundario">{k}:</dt>
                  <dd className="font-bold">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-[14px] text-secundario">Estes são todos os campos salvos. Nenhuma imagem, vídeo, áudio ou nome de paciente.</p>
          </Passo>
        </ol>

        <footer className="border-t border-linha bg-superficie-2 px-4 py-3 text-[15px] text-secundario">
          Comparação planejada para o 3º mês: regra geométrica contra rede temporal, sobre o mesmo esqueleto.
        </footer>
      </aside>
    </div>
  )
}
