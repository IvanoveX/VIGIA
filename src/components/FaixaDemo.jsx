import { Info, SkipForward, RotateCcw, Maximize } from 'lucide-react'

// Depois de um clique com o mouse, tira o foco do botão:
// assim uma barra de espaço acidental não repete a ação.
function soltarFoco(e) {
  if (e.detail > 0) e.currentTarget.blur()
}

function BotaoFaixa({ onClick, icone: Icone, children, destaque = false }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        soltarFoco(e)
        onClick()
      }}
      className={`inline-flex min-h-11 items-center gap-2 rounded px-3.5 text-[15px] font-bold transition-colors ${
        destaque
          ? 'bg-faixa-texto text-faixa hover:bg-white'
          : 'border border-white/25 text-faixa-texto hover:bg-white/10'
      }`}
    >
      <Icone className="size-4.5" aria-hidden="true" />
      {children}
    </button>
  )
}

export default function FaixaDemo({ indicador, onProxima, onReiniciar, onTelaCheia }) {
  return (
    <div className="bg-faixa text-faixa-texto">
      <div className="flex items-center gap-4 px-4 py-1.5">
        <Info className="size-5 shrink-0 opacity-80" aria-hidden="true" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[14px] opacity-80">Modo demonstração: protótipo de interface com dados simulados</p>
          <p className="truncate text-[16px] font-bold" aria-live="polite">
            {indicador.texto}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <BotaoFaixa onClick={onProxima} icone={SkipForward} destaque>
            Próxima etapa
          </BotaoFaixa>
          <BotaoFaixa onClick={onReiniciar} icone={RotateCcw}>
            Reiniciar
          </BotaoFaixa>
          <BotaoFaixa onClick={onTelaCheia} icone={Maximize}>
            Tela cheia
          </BotaoFaixa>
        </div>
      </div>
    </div>
  )
}
