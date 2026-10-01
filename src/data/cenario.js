// Roteiro determinístico da demonstração (SPEC, seção 9).
// Cada etapa lista as mudanças de estado aplicadas quando o navegador aperta "Próxima etapa".

export const LEITO_CENARIO = '3-312'
export const LEITO_ACOMPANHANTE = '3-318'
export const TOTAL_ETAPAS = 3

export const ETAPAS = {
  1: { mudancas: [{ leito: LEITO_CENARIO, estado: 'sentando', confianca: 0.78 }] },
  2: { mudancas: [{ leito: LEITO_CENARIO, estado: 'levantando', confianca: 0.87 }], celular: LEITO_CENARIO },
  3: { mudancas: [{ leito: LEITO_ACOMPANHANTE, estado: 'sentando', confianca: 0.74 }] },
}

// Texto do indicador na faixa de demonstração.
export function indicadorEtapa(estado) {
  const { etapa, fimCenario, leitoAberto, aba } = estado
  if (fimCenario) return { etapa: null, texto: 'Fim do cenário. Aperte R para reiniciar.' }
  const l = estado.leitos[LEITO_CENARIO]
  const aberto = leitoAberto === LEITO_CENARIO && aba === 'painel'
  let proximo
  if (etapa === 0) proximo = 'apertar Próxima etapa'
  else if (etapa === 1) proximo = aberto ? 'apertar Próxima etapa' : 'abrir o leito 312'
  else if (etapa === 2) {
    if (l.atendido) proximo = 'voltar ao painel e apertar Próxima etapa'
    else if (!aberto) proximo = 'abrir o leito 312'
    else if (!l.aCaminho) proximo = 'clicar “Estou indo”'
    else proximo = 'clicar “Atendido”'
  } else proximo = 'abrir o Histórico'
  const prefixo = etapa === 0 ? 'Início do cenário.' : `Etapa ${etapa} de ${TOTAL_ETAPAS}.`
  return { etapa, texto: `${prefixo} Próximo: ${proximo}` }
}
