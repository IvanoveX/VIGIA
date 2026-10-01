// Marca VIGIA: a palavra e um pequeno símbolo de pontos ligados.
export function SimboloVigia({ className = 'size-7' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="8" y1="23" x2="16" y2="9" />
        <line x1="16" y1="9" x2="24" y2="23" />
        <line x1="8" y1="23" x2="24" y2="23" opacity="0.45" />
      </g>
      <g fill="currentColor">
        <circle cx="8" cy="23" r="3.2" />
        <circle cx="16" cy="9" r="3.2" />
        <circle cx="24" cy="23" r="3.2" />
      </g>
    </svg>
  )
}

export default function Marca() {
  return (
    <span className="flex items-center gap-2 text-marca">
      <SimboloVigia />
      <span className="text-2xl font-bold tracking-tight">VIGIA</span>
    </span>
  )
}
