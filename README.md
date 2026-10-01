# VIGIA — protótipo de interface

Protótipo navegável do VIGIA, projeto de prevenção de quedas em leitos de risco da Fábrica de Projetos Ágeis IV (Bacharelado em IA, UNIMAR). Cliente: Hospital Beneficente Unimar.

Só front-end: sem backend, sem modelo de IA e sem câmera. Os dados são fictícios e determinísticos.

## Rodar

- **Local:** `npm install` e depois `npm run dev`
- **Offline** (sem internet, depois de instalado): `npm run build` e depois `npm run preview`

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
