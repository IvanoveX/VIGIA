import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checarClipe, quadroNoTempo, segmentos, janelasNoFim, trilhas, carregarClipe, carregarIndice } from './clipes.js'

// Fixture escrita à mão para teste, não é dado real.
const pontos = Array.from({ length: 17 }, () => [0.5, 0.5, 0.9])
const clipeBase = {
  versao_schema: '1.0.0',
  id_clipe: 'exemplo',
  origem: { dataset: 'exemplo-de-teste', arquivo: 'a.mp4', licenca: 'teste', url: 'https://exemplo.org', citacao: 'teste' },
  keypoints: Array.from({ length: 17 }, (_, i) => `k${i}`),
  quadros: [{ t: 0, pontos }, { t: 0.5, pontos: null }, { t: 1, pontos }],
  rotulos_origem: [{ t_ini: 0, t_fim: 1, rotulo: 'lying' }],
  baseline: { descricao: 'x', versao: '1', janelas: [{ t_ini: 0, t_fim: 2, classe: 'repouso', features: {} }] },
  predicao_modelo: null,
}

test('quadroNoTempo: antes do início devolve o primeiro quadro', () => {
  assert.equal(quadroNoTempo(clipeBase.quadros, -1), 0)
})

test('quadroNoTempo: entre quadros devolve o último que já começou', () => {
  assert.equal(quadroNoTempo(clipeBase.quadros, 0.7), 1)
  assert.equal(quadroNoTempo(clipeBase.quadros, 0.5), 1)
})

test('quadroNoTempo: depois do fim devolve o último quadro', () => {
  assert.equal(quadroNoTempo(clipeBase.quadros, 99), 2)
})

test('checarClipe aceita 1.x com 17 pontos', () => {
  assert.equal(checarClipe(clipeBase), null)
})

test('checarClipe recusa major 2.0.0', () => {
  assert.match(checarClipe({ ...clipeBase, versao_schema: '2.0.0' }), /Versão/)
})

test('checarClipe recusa pontos diferentes de 17', () => {
  const ruim = { ...clipeBase, keypoints: ['a', 'b'] }
  assert.match(checarClipe(ruim), /17/)
})

test('trilhas: modelo nulo fica pendente', () => {
  const t = trilhas(clipeBase)
  assert.deepEqual(t.modelo, { pendente: true })
  assert.equal(t.origem, clipeBase.rotulos_origem)
  assert.equal(t.baseline, clipeBase.baseline.janelas)
})

test('trilhas: modelo preenchido devolve as janelas', () => {
  const janelas = [{ t_ini: 0, t_fim: 2, classe: 'repouso', confianca: 0.9 }]
  const t = trilhas({ ...clipeBase, predicao_modelo: { modelo: 'm', versao: '1', janelas } })
  assert.equal(t.modelo, janelas)
})

test('trilhas: baseline nulo vira lista vazia', () => {
  assert.deepEqual(trilhas({ ...clipeBase, baseline: null }).baseline, [])
})

function respostaFalsa(status, corpo) {
  return async () => ({ status, ok: status === 200, text: async () => corpo, json: async () => JSON.parse(corpo) })
}

test('carregarClipe devolve o clipe com status 200', async () => {
  const clipe = await carregarClipe('exemplo', respostaFalsa(200, JSON.stringify(clipeBase)))
  assert.equal(clipe.id_clipe, 'exemplo')
})

test('carregarClipe rejeita 404 com mensagem em pt-BR', async () => {
  await assert.rejects(carregarClipe('x', respostaFalsa(404, 'nada')), /Não foi possível carregar/)
})

test('carregarClipe rejeita HTML com mensagem em pt-BR', async () => {
  await assert.rejects(carregarClipe('x', respostaFalsa(200, '<!doctype html><html></html>')), /não é um clipe válido/)
})

test('carregarIndice rejeita HTML com mensagem em pt-BR', async () => {
  await assert.rejects(carregarIndice(respostaFalsa(200, '<html>')), /não é um clipe válido|índice/)
})

test('segmentos: janelas sobrepostas mostram a que começou por último', () => {
  const janelas = [
    { t_ini: 0, t_fim: 2, classe: 'repouso' },
    { t_ini: 0.5, t_fim: 2.5, classe: 'sentando' },
  ]
  const segs = segmentos(janelas, (j) => j.classe)
  assert.deepEqual(
    segs.map((s) => [s.t_ini, s.t_fim, s.item.classe]),
    [[0, 0.5, 'repouso'], [0.5, 2.5, 'sentando']],
  )
})

test('segmentos: junta trechos vizinhos de mesma chave e deixa lacunas vazias', () => {
  const janelas = [
    { t_ini: 0, t_fim: 1, classe: 'repouso' },
    { t_ini: 0.5, t_fim: 1.5, classe: 'repouso' },
    { t_ini: 3, t_fim: 4, classe: 'queda' },
  ]
  const segs = segmentos(janelas, (j) => j.classe)
  assert.deepEqual(segs.map((s) => [s.t_ini, s.t_fim, s.item.classe]), [[0, 1.5, 'repouso'], [3, 4, 'queda']])
})

test('janelasNoFim: o rótulo passa a valer a partir do fim da janela, por 0,5 s', () => {
  const janelas = [{ t_ini: 0, t_fim: 2, classe: 'repouso', features: {} }]
  assert.deepEqual(janelasNoFim(janelas), [{ t_ini: 2, t_fim: 2.5, classe: 'repouso', features: {} }])
})

test('janelasNoFim com segmentos: passo de 0,5 s deixa o início vazio e junta classes iguais', () => {
  const janelas = [
    { t_ini: 0, t_fim: 2, classe: 'repouso' },
    { t_ini: 0.5, t_fim: 2.5, classe: 'repouso' },
    { t_ini: 1, t_fim: 3, classe: 'sentando' },
  ]
  const segs = segmentos(janelasNoFim(janelas), (j) => j.classe)
  assert.deepEqual(segs.map((x) => [x.t_ini, x.t_fim, x.item.classe]), [[2, 3, 'repouso'], [3, 3.5, 'sentando']])
})
