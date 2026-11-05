import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Camera, CameraOff } from 'lucide-react'
import EsqueletoReal from './EsqueletoReal.jsx'
import { criarDetector, selecionarCoco, mensagemDeErroCamera, proximoTimestamp } from '../lib/poseAoVivo.js'
import { ROTULO_PRIVACIDADE, ROTULO_CLASSIFICACAO, ESTADOS_CAMERA } from '../data/cameraAoVivo.js'

const LARGURA = 640

// Captura oculta: nunca exibida. Fora da tela e com 1 px para o navegador ainda decodificar quadros.
const ESTILO_CAPTURA = { position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }

// O stream fica numa ref própria: na desmontagem o React já soltou video.current.
function pararStream(stream, video) {
  stream.current?.getTracks().forEach((t) => t.stop())
  stream.current = null
  if (video) video.srcObject = null
}

// Laço de detecção: só roda a rede quando o vídeo avançou para um quadro novo.
function iniciarLaco({ id, execucao, video, detector, quadro, setPontos, falhar }) {
  let ultimoTempo = -1
  let ultimoTs = -1
  const passo = () => {
    if (id !== execucao.current) return
    try {
      const v = video.current
      if (v.currentTime !== ultimoTempo && v.readyState >= 2) {
        ultimoTempo = v.currentTime
        ultimoTs = proximoTimestamp(ultimoTs, performance.now())
        const poses = detector.current.detectForVideo(v, ultimoTs).landmarks
        setPontos(poses.length ? selecionarCoco(poses[0]) : null)
      }
      quadro.current = requestAnimationFrame(passo)
    } catch (e) {
      falhar(id, e)
    }
  }
  passo()
}

function useCameraAoVivo() {
  const video = useRef(null)
  // Token da execução: cada await confere se ela continua válida antes de seguir.
  const execucao = useRef(0)
  const detector = useRef(null)
  const stream = useRef(null)
  const quadro = useRef(0)
  const [estado, setEstado] = useState('desligada')
  const [erro, setErro] = useState(null)
  const [pontos, setPontos] = useState(null)
  const [proporcao, setProporcao] = useState(3 / 4)

  // Só mexe em refs, para poder rodar também na desmontagem.
  function liberar() {
    execucao.current += 1
    cancelAnimationFrame(quadro.current)
    pararStream(stream, video.current)
    detector.current?.close()
    detector.current = null
  }

  function desligar() {
    liberar()
    setPontos(null)
    setEstado('desligada')
  }

  useEffect(() => liberar, [])

  async function abrirCamera(id) {
    const novo = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    if (id !== execucao.current) return novo.getTracks().forEach((t) => t.stop())
    stream.current = novo
    video.current.srcObject = novo
    await video.current.play()
    return id === execucao.current
  }

  function falhar(id, e) {
    if (id !== execucao.current) return
    liberar()
    setPontos(null)
    setErro(mensagemDeErroCamera(e))
    setEstado('erro')
  }

  async function ligar() {
    if (estado !== 'desligada' && estado !== 'erro') return
    liberar()
    const id = execucao.current
    setErro(null)
    try {
      setEstado('carregando')
      const novo = await criarDetector()
      if (id !== execucao.current) return novo.close()
      detector.current = novo
      setEstado('permissao')
      if (!(await abrirCamera(id))) return
      setProporcao(video.current.videoHeight / video.current.videoWidth || 3 / 4)
      setEstado('ligada')
      iniciarLaco({ id, execucao, video, detector, quadro, setPontos, falhar })
    } catch (e) {
      falhar(id, e)
    }
  }

  return { video, estado, erro, pontos, proporcao, ligar, desligar }
}

export default function CameraAoVivo({ onVoltar }) {
  const { video, estado, erro, pontos, proporcao, ligar, desligar } = useCameraAoVivo()
  const ocupado = estado === 'carregando' || estado === 'permissao'
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <button type="button" onClick={onVoltar} className="inline-flex min-h-11 items-center gap-2 rounded border border-linha bg-superficie px-3 font-bold hover:border-secundario">
          <ArrowLeft className="size-5" aria-hidden="true" /> Voltar ao leito
        </button>
        <h1 className="text-[28px] font-bold leading-none">Câmera ao vivo (demonstração)</h1>
      </div>

      <section className="flex flex-col gap-2 rounded border border-linha bg-superficie p-3" aria-label="Câmera ao vivo">
        <p className="text-secundario">{ROTULO_PRIVACIDADE}</p>
        <div className="mx-auto w-full max-w-[640px]">
          <EsqueletoReal pontos={pontos} largura={LARGURA} altura={Math.round(LARGURA * proporcao)} poligono={null} />
        </div>
        <video ref={video} muted playsInline aria-hidden="true" style={ESTILO_CAPTURA} />
        <p role="status" className="font-bold">{estado === 'erro' ? erro : ESTADOS_CAMERA[estado]}</p>
        <div className="flex flex-wrap gap-2">
          <BotaoCamera icone={Camera} forte onClick={ligar} disabled={estado === 'ligada' || ocupado}>Ligar câmera</BotaoCamera>
          <BotaoCamera icone={CameraOff} onClick={desligar} disabled={estado === 'desligada'}>Desligar câmera</BotaoCamera>
        </div>
        <p className="text-[15px] text-secundario">{ROTULO_CLASSIFICACAO}</p>
      </section>
    </div>
  )
}

function BotaoCamera({ icone: Icone, forte = false, children, ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded px-3 font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        forte ? 'bg-marca text-white hover:bg-marca/90' : 'border border-linha bg-superficie text-tinta hover:border-secundario'
      }`}
      {...props}
    >
      <Icone className="size-5 shrink-0" aria-hidden="true" />
      {children}
    </button>
  )
}
