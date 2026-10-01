# VIGIA — protótipo de interface

Leia SPEC.md antes de cada fase (e depois de todo /clear). Ele é a fonte de verdade.

- Stack fixa: Vite + React em JSX (sem TypeScript), Tailwind v4 via @tailwindcss/vite (`@import "tailwindcss"` + `@theme`, sem tailwind.config.js), lucide-react, Atkinson Hyperlegible local via Fontsource.
- Navegação por estado (useReducer no App). Proibido: react-router, Next.js, framer-motion, bibliotecas de componentes ou de gráficos, fetch, backend, localStorage.
- Nenhuma imagem de pessoa: sem <img> de pessoa, <video> ou getUserMedia. O "feed" é um esqueleto SVG de 17 pontos COCO.
- Guardamos só metadados (leito, torre, posto, evento, origem, horário, confiança, canais, tempo de resposta, desfecho). Nunca nome de paciente.
- Interface organizada por leito, não por câmera. Um único usuário: a enfermagem do posto.
- Estados em 3 grupos (Movimento, Contexto, Sensor), sempre com ícone e texto. Definições só em src/data/estados.js.
- Acompanhante atenua um nível; Queda nunca é atenuada.
- Nenhuma métrica de desempenho inventada (acurácia, precisão, recall, KPIs). Nenhuma contagem regressiva até a queda.
- Faixa fixa "Modo demonstração: protótipo de interface com dados simulados". Dados determinísticos, sem Math.random.
- Tudo em pt-BR: "0,87", "03:41:07", "00:21".
- Dependências novas só com autorização do Ivan. A skill taste (.agents/skills) orienta o estilo; a SPEC vence em conflito.
- Ao fim de cada fase: npm run build, commit, push, resumo de até 5 linhas e esperar o "ok".
