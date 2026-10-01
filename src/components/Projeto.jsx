import { Database, ScanLine, Cpu, ShieldCheck, Check, Minus } from 'lucide-react'
import { SimboloVigia } from './Marca.jsx'

const VIAVEL = [
  {
    icone: Database,
    titulo: 'Não depende de dados do hospital',
    texto: 'Bases públicas (UP-Fall, UR Fall, Le2i, NTU RGB+D) mais cenas gravadas pela equipe em simulação.',
  },
  {
    icone: ScanLine,
    titulo: 'A percepção já existe pronta',
    texto: 'Estimadores de pose pré-treinados. O que treinamos vê só 51 números por quadro.',
  },
  {
    icone: Cpu,
    titulo: 'Hardware barato',
    texto: 'Webcam e notebook no MVP; Raspberry Pi 5 ou Jetson Orin Nano no piloto.',
  },
  {
    icone: ShieldCheck,
    titulo: 'LGPD por arquitetura',
    texto: 'A imagem é descartada no dispositivo. Só esqueletos e metadados saem do quarto.',
  },
]

const ENTREGAMOS = [
  'Protótipo de interface e fluxo do posto de enfermagem',
  'Estimador de pose rodando sobre vídeo gravado',
  'Rede temporal treinada em bases públicas e cenas simuladas',
  'Comparação entre regra geométrica e rede temporal',
  'Precisão e recall reportados no fim do semestre',
]

const NAO_ENTREGAMOS = ['Uso com paciente real', 'Instalação no HBU', 'Integração com prontuário', 'Aplicativo de celular separado']

const MARCOS = [
  { m: 'M1', texto: 'Feito: protótipo de interface e fluxo.', agora: true },
  { m: 'M2', texto: 'Próximo: bases públicas processadas e estimador de pose rodando sobre vídeo gravado.' },
  { m: 'M3', texto: 'Demonstração: modelo contra regra geométrica.' },
  { m: 'M4', texto: '' },
  { m: 'M5', texto: '' },
]

export default function Projeto() {
  return (
    <article className="mx-auto flex max-w-5xl flex-col gap-6 py-2">
      <header>
        <h1 className="text-2xl font-bold leading-tight">O projeto VIGIA</h1>
        <p className="mt-1 max-w-[65ch] text-secundario">
          Visão computacional para prevenir quedas de pacientes internados em leitos de risco, com foco no plantão noturno. O VIGIA avisa na fase de pré-queda, não depois da queda.
        </p>
      </header>

      <section aria-labelledby="viavel">
        <h2 id="viavel" className="mb-2 text-lg font-bold">
          Por que é viável
        </h2>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
          {VIAVEL.map(({ icone: Icone, titulo, texto }) => (
            <li key={titulo} className="flex gap-3">
              <Icone className="mt-0.5 size-6 shrink-0 text-marca" aria-hidden="true" />
              <p>
                <strong>{titulo}.</strong> <span className="text-secundario">{texto}</span>
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="escopo" className="border-t border-linha pt-5">
        <h2 id="escopo" className="mb-2 text-lg font-bold">
          Escopo do semestre
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="mb-1 font-bold">Entregamos</h3>
            <ul className="flex flex-col gap-1">
              {ENTREGAMOS.map((t) => (
                <li key={t} className="flex gap-2">
                  <Check className="mt-0.5 size-5 shrink-0 text-marca" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-1 font-bold">Não entregamos</h3>
            <ul className="flex flex-col gap-1">
              {NAO_ENTREGAMOS.map((t) => (
                <li key={t} className="flex gap-2 text-secundario">
                  <Minus className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="onde" className="border-t border-linha pt-5">
        <h2 id="onde" className="mb-3 text-lg font-bold">
          Onde estamos
        </h2>
        <ol className="relative grid grid-cols-5">
          <span className="absolute left-[10%] right-[10%] top-[18px] h-0.5 bg-linha" aria-hidden="true" />
          {MARCOS.map(({ m, texto, agora }) => (
            <li key={m} className="relative flex flex-col items-center px-2 text-center">
              <span
                className={`num relative flex size-9 items-center justify-center rounded-full border-2 font-bold ${
                  agora ? 'border-marca bg-marca text-white' : 'border-linha bg-superficie text-secundario'
                }`}
              >
                {m}
              </span>
              {agora && <span className="mt-1 rounded bg-tinta px-1.5 text-[14px] font-bold text-superficie">Agora: M1</span>}
              {texto && <p className={`mt-1 text-[15px] leading-snug ${agora ? '' : 'text-secundario'}`}>{texto}</p>}
            </li>
          ))}
        </ol>
      </section>

      <blockquote className="flex items-start gap-4 border-y border-linha py-6">
        <SimboloVigia className="mt-1 size-10 shrink-0 text-marca" />
        <p className="text-[28px] font-bold leading-snug tracking-tight">Um par de olhos a mais em cada quarto — que nunca vê o rosto de ninguém.</p>
      </blockquote>

      <footer className="text-[15px] text-secundario">
        Projeto acadêmico da Fábrica de Projetos Ágeis IV, Bacharelado em IA, UNIMAR. Cliente: Hospital Beneficente Unimar.
      </footer>
    </article>
  )
}
