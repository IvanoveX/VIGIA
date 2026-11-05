import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { INDICES_MEDIAPIPE, VERSAO_WASM, selecionarCoco, mensagemDeErroCamera, proximoTimestamp } from './poseAoVivo.js'
import { MSG_PERMISSAO, MSG_SEM_CAMERA, MSG_EM_USO, MSG_GENERICA } from '../data/cameraAoVivo.js'

// Fixture de teste: 33 landmarks sintéticos, x = índice/100.
const landmarks = Array.from({ length: 33 }, (_, i) => ({ x: i / 100, y: 0.5, z: 0, visibility: i === 0 ? 1.7 : 0.8 }))

test('INDICES_MEDIAPIPE tem os 17 índices do Python', () => {
  assert.deepEqual(INDICES_MEDIAPIPE, [0, 2, 5, 7, 8, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28])
})

test('selecionarCoco devolve 17 pontos [x, y, conf] com conf limitada a 0-1', () => {
  const pontos = selecionarCoco(landmarks)
  assert.equal(pontos.length, 17)
  assert.deepEqual(pontos[0], [0, 0.5, 1])
  assert.deepEqual(pontos[1], [0.02, 0.5, 0.8])
})

test('selecionarCoco trata visibility ausente como zero', () => {
  const sem = landmarks.map(({ x, y }) => ({ x, y }))
  assert.equal(selecionarCoco(sem)[3][2], 0)
})

test('mensagemDeErroCamera traduz cada tipo de erro', () => {
  assert.equal(mensagemDeErroCamera({ name: 'NotAllowedError' }), MSG_PERMISSAO)
  assert.equal(mensagemDeErroCamera({ name: 'SecurityError' }), MSG_PERMISSAO)
  assert.equal(mensagemDeErroCamera({ name: 'NotFoundError' }), MSG_SEM_CAMERA)
  assert.equal(mensagemDeErroCamera({ name: 'OverconstrainedError' }), MSG_SEM_CAMERA)
  assert.equal(mensagemDeErroCamera({ name: 'NotReadableError' }), MSG_EM_USO)
  assert.equal(mensagemDeErroCamera(new Error('x')), MSG_GENERICA)
  assert.equal(mensagemDeErroCamera(null), MSG_GENERICA)
})

test('proximoTimestamp é estritamente crescente mesmo com relógio parado', () => {
  assert.equal(proximoTimestamp(10, 50), 50)
  assert.equal(proximoTimestamp(50, 50), 51)
  assert.equal(proximoTimestamp(50, 40), 51)
})

test('VERSAO_WASM é igual à versão exata do package.json', () => {
  const pacote = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'))
  assert.equal(pacote.dependencies['@mediapipe/tasks-vision'], VERSAO_WASM)
})
