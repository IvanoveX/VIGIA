export default function App() {
  return (
    <main className="min-h-[100dvh] grid place-items-center p-6">
      <div className="bg-superficie border border-linha rounded px-10 py-8 max-w-xl">
        <p className="flex items-center gap-3 text-3xl font-bold text-marca">
          <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
            <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="9" y1="22" x2="16" y2="10" />
              <line x1="16" y1="10" x2="23" y2="22" />
            </g>
            <g fill="currentColor">
              <circle cx="9" cy="22" r="3" />
              <circle cx="16" cy="10" r="3" />
              <circle cx="23" cy="22" r="3" />
            </g>
          </svg>
          VIGIA em construção
        </p>
        <p className="mt-3 text-secundario">
          Protótipo de interface para prevenção de quedas em leitos de risco.
          Esta página provisória confirma que o deploy está funcionando.
        </p>
      </div>
    </main>
  )
}
