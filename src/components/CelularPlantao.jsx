import { PersonStanding } from 'lucide-react'
import { LEITOS, nomeAndar } from '../data/hospital.js'

// Cartão em forma de celular no canto inferior direito. Some em 6 s (relógio simulado).
export default function CelularPlantao({ aviso }) {
  const l = LEITOS[aviso.leito]
  return (
    <div className="celular-entra fixed bottom-4 right-4 z-30 w-72 rounded-[22px] border-[5px] border-tinta bg-superficie p-3 pt-4" role="status">
      <span className="absolute left-1/2 top-1.5 h-1 w-12 -translate-x-1/2 rounded-full bg-linha" aria-hidden="true" />
      <p className="text-[14px] font-bold text-secundario">Celular do plantão</p>
      <div className="mt-1.5 flex gap-2.5 rounded-lg border-l-[6px] border-laranja bg-superficie-2 p-2.5">
        <PersonStanding className="mt-0.5 size-5 shrink-0 text-laranja" aria-hidden="true" />
        <p className="leading-snug">
          <strong>VIGIA:</strong> leito {l.numero} tentando levantar (Torre {l.torre}, {nomeAndar(l.andar)})
        </p>
      </div>
    </div>
  )
}
