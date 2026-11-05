// Textos da aba Pipeline em um lugar só.
import { ESTADOS } from './estados.js'

export const STATUS_MODELO = 'Classificação temporal: código de treino pronto, aguardando dados rotulados próprios'
export const TEXTO_DADOS = '17 pontos por quadro. O navegador não recebe nenhuma imagem do vídeo.'
export const TEXTO_BASELINE = 'O baseline é uma regra geométrica sobre os pontos, não o modelo de classificação.'
export const TEXTO_REGRAS = 'Acompanhante presente e fora do leito por N minutos: regras ainda não implementadas nesta etapa.'

// Nome e tom de cada classe do baseline. "Indefinido" não faz parte dos estados do produto.
export function estiloBaseline(classe) {
  if (classe === 'indefinido') return { rotulo: 'Indefinido', tom: 'sensor' }
  const e = ESTADOS[classe]
  return { rotulo: e.rotuloCurto ?? e.rotulo, tom: e.tom }
}
