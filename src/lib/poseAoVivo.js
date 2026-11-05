import { MSG_PERMISSAO, MSG_SEM_CAMERA, MSG_EM_USO, MSG_GENERICA, MSG_MODELO } from '../data/cameraAoVivo.js'

// Precisa ser igual à versão de @mediapipe/tasks-vision no package.json (há teste).
export const VERSAO_WASM = '1.2.2'
const URL_WASM = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSAO_WASM}/wasm`
const URL_MODELO = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'

// Mesma tabela do modelo/vigia_modelo/coco.py: 33 landmarks do MediaPipe para 17 pontos COCO.
export const INDICES_MEDIAPIPE = [0, 2, 5, 7, 8, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]

export function selecionarCoco(landmarks) {
  return INDICES_MEDIAPIPE.map((i) => {
    const { x, y, visibility } = landmarks[i]
    return [x, y, Math.min(1, Math.max(0, visibility ?? 0))]
  })
}

export function mensagemDeErroCamera(erro) {
  switch (erro?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return MSG_PERMISSAO
    case 'NotFoundError':
    case 'OverconstrainedError':
      return MSG_SEM_CAMERA
    case 'NotReadableError':
      return MSG_EM_USO
    default:
      return MSG_GENERICA
  }
}

// detectForVideo exige timestamps estritamente crescentes.
export function proximoTimestamp(ultimo, agora) {
  return Math.max(ultimo + 1, agora)
}

async function criarComDelegate(PoseLandmarker, fileset, delegate) {
  return PoseLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: URL_MODELO, delegate },
    runningMode: 'VIDEO',
    numPoses: 1,
  })
}

// Import dinâmico para o pacote não pesar nas outras abas.
export async function criarDetector() {
  try {
    const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision')
    const fileset = await FilesetResolver.forVisionTasks(URL_WASM)
    try {
      return await criarComDelegate(PoseLandmarker, fileset, 'GPU')
    } catch {
      return await criarComDelegate(PoseLandmarker, fileset, 'CPU')
    }
  } catch {
    throw new Error(MSG_MODELO)
  }
}
