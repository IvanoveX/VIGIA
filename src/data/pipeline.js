// Textos da aba Pipeline em um lugar só.
import { ESTADOS } from './estados.js'

export const STATUS_MODELO = 'Classificação temporal: código de treino pronto, aguardando dados rotulados próprios'
export const TEXTO_DADOS = '17 pontos por quadro. O navegador não recebe nenhuma imagem do vídeo.'
export const TEXTO_BASELINE = 'O baseline é uma regra geométrica sobre os pontos, não o modelo de classificação.'
export const TEXTO_TRILHA_CAUSAL = 'Cada classe aparece quando a janela de 2 s termina, por isso a trilha começa vazia.'
export const TEXTO_REGRAS = 'Acompanhante presente e fora do leito por N minutos: regras ainda não implementadas nesta etapa.'

// Nomes descritivos da geometria; o enum do JSON não muda. Só queda e repouso levam o tom dos estados do produto.
const BASELINE = {
  repouso: { rotulo: 'Deitado no leito', tom: ESTADOS.repouso.tom },
  sentando: { rotulo: 'Sentado no leito', tom: 'sensor' },
  levantando: { rotulo: 'Ereto perto do leito', tom: 'sensor' },
  queda: { rotulo: 'Queda', tom: ESTADOS.queda.tom },
  fora: { rotulo: 'Fora do leito', tom: 'sensor' },
  indefinido: { rotulo: 'Indefinido', tom: 'sensor' },
}

export function estiloBaseline(classe) {
  return BASELINE[classe] ?? BASELINE.indefinido
}
