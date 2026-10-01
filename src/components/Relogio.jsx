import { horario } from '../lib/formato.js'

// Cada caractere numa caixa de largura fixa, para o relógio não tremer.
export default function Relogio({ segundos, className = '' }) {
  return (
    <span className={`num inline-flex font-bold ${className}`} aria-label={`Horário ${horario(segundos)}`}>
      {horario(segundos)
        .split('')
        .map((c, i) => (
          <span key={i} className={c === ':' ? 'w-[0.32em] text-center' : 'w-[0.62em] text-center'}>
            {c}
          </span>
        ))}
    </span>
  )
}
