# VIGIA — protótipo de interface

Protótipo navegável do VIGIA, projeto de prevenção de quedas em leitos de risco da Fábrica de Projetos Ágeis IV (Bacharelado em IA, UNIMAR). Cliente: Hospital Beneficente Unimar.

Só front-end, sem backend. Tem duas partes de natureza diferente:

- **Protótipo (fictício):** Painel, Histórico, leitos, alertas e bastidores. Os dados são inventados e determinísticos, e as telas são rotuladas como protótipo.
- **Real:** a aba Pipeline e a câmera ao vivo.
  - Pipeline: lê os JSONs de `public/clipes/` (quatro clipes reais do GMDCSA-24, com pose e baseline geométrico). Esses JSONs são gerados offline pelo repositório `modelo/`; nenhum Python roda aqui. Não há classificação temporal: não existe modelo treinado com dados próprios, só o código de treino.
  - Câmera ao vivo (leito 3-310): só estimativa de pose. Sem classificação e sem alerta. A imagem não sai do navegador.

O MediaPipe é usado na demonstração; não é o estimador escolhido para o produto.

## Rodar

- **Local:** `npm install` e depois `npm run dev`. Resultado esperado: o terminal mostra `Local: http://localhost:5173/`; abra esse endereço no navegador.
- **Testes:** `npm test`. Resultado esperado: todos os testes passam, sem falhas.
- **Build:** `npm run build`. Resultado esperado: termina sem erro e cria a pasta `dist/`.
- **Offline** (sem internet, depois de instalado): `npm run build` e depois `npm run preview`. Vale para o protótipo e a aba Pipeline; a câmera ao vivo não funciona offline.
- **Câmera ao vivo:** precisa de internet, porque o navegador baixa o modelo de pose e o wasm na hora, e de HTTPS (Vercel) ou `localhost`. Em outro endereço HTTP o navegador bloqueia a câmera. Na primeira vez, permita o uso da câmera quando o navegador perguntar.
  - Privacidade: a imagem da câmera fica no navegador e não é enviada. Porém, conforme o aviso de privacidade do pacote `@mediapipe/tasks-vision`, a biblioteca envia ao Google métricas de uso e desempenho, sem imagem. A tela mostra esse aviso antes de ligar a câmera.

## Atalhos da demonstração

| Tecla | Ação |
|---|---|
| Seta para a direita | Próxima etapa do cenário |
| R | Reiniciar (relógio volta a 03:40:00) |
| F | Tela cheia |
| Esc | Fechar os bastidores |

Os botões "Próxima etapa", "Reiniciar" e "Tela cheia" ficam na faixa do topo. Recarregar a página (F5) também volta ao início.

## Roteiro

R, Próxima etapa, abrir o leito 312, Próxima etapa, "Estou indo", "Atendido", voltar ao Painel, Próxima etapa, Histórico (evento do 312 no topo), clicar na linha, Fechar, Projeto.

Conferência das poses do esqueleto: abrir a página com `?debug=poses` no fim do endereço.

Especificação completa em `SPEC.md`. Nomes de torres, postos e setores ficam em `src/data/hospital.js`.
