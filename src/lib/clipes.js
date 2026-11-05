// Leitura e consulta dos clipes em /clipes/. Contrato: schema/clipe.schema.json do repositório do modelo.

const MAJOR_SUPORTADO = '1'

export function checarClipe(clipe) {
  const major = String(clipe?.versao_schema ?? '').split('.')[0]
  if (major !== MAJOR_SUPORTADO) {
    return `Versão do formato do clipe não suportada (${clipe?.versao_schema ?? 'ausente'}).`
  }
  if (clipe.keypoints?.length !== 17) return 'O clipe não tem 17 pontos por quadro.'
  return null
}

// Índice do último quadro com t <= tempo (busca binária). Antes do início devolve 0.
export function quadroNoTempo(quadros, tempo) {
  let baixo = 0
  let alto = quadros.length - 1
  while (baixo < alto) {
    const meio = Math.ceil((baixo + alto) / 2)
    if (quadros[meio].t <= tempo) baixo = meio
    else alto = meio - 1
  }
  return baixo
}

// Achata intervalos que se sobrepõem: em cada trecho vale o que começou por último.
// Trechos vizinhos com a mesma chave viram um só.
export function segmentos(intervalos, chave) {
  const cortes = [...new Set(intervalos.flatMap((i) => [i.t_ini, i.t_fim]))].sort((a, b) => a - b)
  const saida = []
  for (let k = 0; k < cortes.length - 1; k++) {
    const [ini, fim] = [cortes[k], cortes[k + 1]]
    const cobrem = intervalos.filter((i) => i.t_ini <= ini && i.t_fim >= fim)
    if (cobrem.length === 0) continue
    const item = cobrem.reduce((a, b) => (b.t_ini >= a.t_ini ? b : a))
    const ultimo = saida.at(-1)
    if (ultimo && ultimo.t_fim === ini && chave(ultimo.item) === chave(item)) ultimo.t_fim = fim
    else saida.push({ t_ini: ini, t_fim: fim, item })
  }
  return saida
}

export function trilhas(clipe) {
  return {
    origem: clipe.rotulos_origem,
    baseline: clipe.baseline ? clipe.baseline.janelas : [],
    modelo: clipe.predicao_modelo ? clipe.predicao_modelo.janelas : { pendente: true },
  }
}

// O servidor de desenvolvimento devolve index.html em caminho inexistente: por isso o corpo é lido como texto.
async function buscarJson(caminho, buscar) {
  let resposta
  try {
    resposta = await buscar(caminho)
  } catch {
    throw new Error(`Não foi possível carregar ${caminho}: sem conexão com o servidor.`)
  }
  if (resposta.status !== 200) {
    throw new Error(`Não foi possível carregar ${caminho} (código ${resposta.status}).`)
  }
  try {
    return JSON.parse(await resposta.text())
  } catch {
    throw new Error(`O arquivo ${caminho} não é um clipe válido (não é JSON).`)
  }
}

export async function carregarIndice(buscar = globalThis.fetch) {
  const indice = await buscarJson('/clipes/indice.json', buscar)
  if (!Array.isArray(indice.clipes)) throw new Error('O arquivo /clipes/indice.json não é um clipe válido (sem lista de clipes).')
  return indice.clipes
}

export async function carregarClipe(id, buscar = globalThis.fetch) {
  const clipe = await buscarJson(`/clipes/${id}.json`, buscar)
  const problema = checarClipe(clipe)
  if (problema) throw new Error(problema)
  return clipe
}
