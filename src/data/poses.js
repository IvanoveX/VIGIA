// 17 pontos COCO por pose-chave: [x, y, confiança], no viewBox fixo da cena (480 × 300, recortado a partir de y = 50).
// Vista lateral. Cabeceira à esquerda (x ≈ 55), pés do leito à direita (x ≈ 340),
// topo do colchão em y = 205, chão em y = 288.
// Lado distante da câmera: o lado DIREITO do corpo (índices pares a partir de 2).
// O desenho desloca esse lado em cerca de 4 px e o mostra com 50% de opacidade.
// Proporções: tronco ≈ coxa ≈ canela ≈ 66 px; cabeça pequena.

export const NOMES_PONTOS = [
  'nariz',
  'olho esquerdo',
  'olho direito',
  'orelha esquerda',
  'orelha direita',
  'ombro esquerdo',
  'ombro direito',
  'cotovelo esquerdo',
  'cotovelo direito',
  'punho esquerdo',
  'punho direito',
  'quadril esquerdo',
  'quadril direito',
  'joelho esquerdo',
  'joelho direito',
  'tornozelo esquerdo',
  'tornozelo direito',
]

export const ARESTAS = [
  [15, 13], [13, 11], [16, 14], [14, 12], [11, 12], [5, 11], [6, 12], [5, 6],
  [5, 7], [6, 8], [7, 9], [8, 10], [1, 2], [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 6],
]

export const LADO_DISTANTE = new Set([2, 4, 6, 8, 10, 12, 14, 16])

export const CENA = { largura: 480, altura: 300, topo: 50, colchao: 205, chao: 288 }

export const POSES = {
  // A: deitado de costas ao longo do colchão, cabeça na cabeceira.
  // Joelhos e tornozelos com confiança baixa (oclusão do lençol).
  repouso: {
    rotulo: 'A. Repouso',
    pontos: [
      [104, 186, 0.93],
      [97, 182, 0.91], [97, 182, 0.88],
      [86, 190, 0.86], [86, 190, 0.8],
      [116, 199, 0.92], [116, 199, 0.89],
      [158, 203, 0.84], [158, 203, 0.78],
      [196, 203, 0.8], [196, 203, 0.72],
      [184, 199, 0.88], [184, 199, 0.85],
      [250, 198, 0.55], [250, 198, 0.48],
      [316, 199, 0.46], [316, 199, 0.41],
    ],
  },
  // B: sentado na borda, de frente para a câmera. Coxas curtas (escorço), canelas penduradas.
  sentando: {
    rotulo: 'B. Sentando na borda',
    pontos: [
      [205, 106, 0.94],
      [211, 97, 0.92], [199, 97, 0.92],
      [219, 101, 0.88], [191, 101, 0.86],
      [226, 134, 0.93], [184, 134, 0.92],
      [232, 168, 0.89], [178, 168, 0.87],
      [226, 199, 0.86], [184, 199, 0.83],
      [217, 204, 0.9], [193, 204, 0.89],
      [219, 220, 0.84], [191, 220, 0.82],
      [219, 281, 0.8], [191, 281, 0.78],
    ],
  },
  // C: quadril saindo do colchão, joelhos dobrados, pés no chão,
  // tronco inclinado e o braço direito apoiado no colchão.
  levantando: {
    rotulo: 'C. Tentando levantar',
    pontos: [
      [241, 101, 0.9],
      [247, 92, 0.88], [235, 91, 0.86],
      [255, 97, 0.84], [227, 95, 0.82],
      [252, 128, 0.91], [212, 118, 0.9],
      [272, 158, 0.86], [188, 152, 0.88],
      [280, 186, 0.82], [170, 203, 0.85],
      [226, 188, 0.89], [202, 188, 0.88],
      [234, 228, 0.85], [206, 228, 0.83],
      [231, 286, 0.82], [203, 286, 0.8],
    ],
  },
  // D: corpo no chão, à frente do leito (só no cenário extra).
  queda: {
    rotulo: 'D. Queda',
    pontos: [
      [426, 270, 0.82],
      [420, 266, 0.8], [422, 269, 0.74],
      [412, 272, 0.76], [414, 276, 0.7],
      [390, 279, 0.84], [392, 284, 0.78],
      [360, 266, 0.78], [425, 286, 0.7],
      [385, 258, 0.74], [455, 286, 0.66],
      [322, 280, 0.82], [324, 284, 0.78],
      [262, 276, 0.78], [266, 283, 0.72],
      [205, 282, 0.74], [212, 285, 0.68],
    ],
  },
}

// Segunda pessoa (a técnica), em pé ao lado dos pés do leito, de perfil para o leito.
export const TECNICA = {
  rotulo: 'Técnica de enfermagem',
  pontos: [
    [384, 72, 0.9],
    [388, 68, 0.88], [388, 68, 0.84],
    [396, 72, 0.86], [396, 72, 0.8],
    [394, 96, 0.92], [400, 96, 0.88],
    [388, 138, 0.88], [395, 138, 0.82],
    [384, 176, 0.84], [391, 176, 0.78],
    [394, 164, 0.9], [400, 164, 0.86],
    [393, 226, 0.88], [399, 226, 0.84],
    [392, 286, 0.86], [398, 286, 0.82],
  ],
}
