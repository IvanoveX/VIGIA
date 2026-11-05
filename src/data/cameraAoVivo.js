export const ROTULO_PRIVACIDADE = 'Pose estimada em tempo real neste notebook. A imagem não sai do dispositivo e não é exibida.'
export const ROTULO_METRICAS = 'A biblioteca de pose envia ao Google métricas de uso e desempenho, sem imagem. O modelo e o wasm são baixados da internet.'
export const ROTULO_CLASSIFICACAO = 'Classificação de risco: não ativa nesta etapa'

export const MSG_PERMISSAO = 'Permissão da câmera negada. Libere o acesso à câmera nas configurações do navegador e tente de novo.'
export const MSG_SEM_CAMERA = 'Nenhuma câmera encontrada neste dispositivo.'
export const MSG_EM_USO = 'A câmera está em uso por outro aplicativo. Feche-o e tente de novo.'
export const MSG_GENERICA = 'Não foi possível acessar a câmera.'
export const MSG_MODELO = 'Não foi possível carregar o modelo de pose. É preciso estar conectado à internet para baixar o modelo e o wasm.'

export const ESTADOS_CAMERA = {
  desligada: 'Câmera desligada',
  carregando: 'Carregando o modelo de pose…',
  permissao: 'Aguardando a permissão da câmera…',
  ligada: 'Câmera ligada',
  erro: 'Erro',
}
