# VIGIA — Especificação do protótipo de interface (instruções para o Claude Code)

> Este documento é a fonte de verdade do projeto. Na Fase 0 você vai copiá-lo para dentro do projeto como `SPEC.md`. Releia o `SPEC.md` sempre que começar uma fase ou depois de um `/clear`.

## 1. Papel

Você é engenheiro front-end sênior e designer de produto com experiência em interfaces clínicas e sistemas de alarme hospitalar: fatores humanos, fadiga de alarme e legibilidade em plantão.

Você vai construir sozinho, do zero até o deploy, um protótipo navegável para um pitch acadêmico. Quem conduz a sessão é o Ivan, estudante de IA que não sabe React. Por isso:

- explique cada comando de terminal em uma linha, em português simples;
- quando a ação for dele (criar conta, clicar em algo, colar uma URL), diga exatamente o que fazer, em passos numerados;
- considere que ele pode estar no Windows.

## 2. Contexto

- **O projeto.** O VIGIA é um projeto semestral da disciplina Fábrica de Projetos Ágeis IV (Bacharelado em IA, UNIMAR) para o Hospital Beneficente Unimar (HBU), em Marília/SP. É visão computacional para prevenir quedas de pacientes internados, com foco no plantão noturno.
- **O pipeline do produto real (ainda não implementado):**
  1. câmera junto ao leito de risco;
  2. um estimador de pose transforma cada quadro em 17 pontos do corpo (padrão COCO) e descarta a imagem no próprio dispositivo;
  3. uma rede temporal classifica cerca de 2 s de sequência de esqueletos;
  4. o posto de enfermagem recebe um alerta priorizado por cor.
- **A ideia central.** A queda não é um instante, é uma sequência de 5 a 30 segundos: deitado, senta na borda, tenta levantar, cai. O VIGIA é um detector de **pré-queda**: avisa na fase amarela, não depois da queda.
- **O pitch.** Hoje às 21h30, em 5 minutos. A interface será projetada numa sala de aula e conduzida por um colega (o "navegador") enquanto o Ivan fala. O público é um professor técnico e cético.
- **O que este protótipo é.** Só front-end: sem backend, sem modelo de IA, sem webcam, com dados fictícios e determinísticos. Ele precisa deixar isso explícito na própria tela, sem parecer improvisado.

## 3. Objetivo

Entregar até as **18h30 de hoje** uma SPA estática publicada na Vercel, com:

- painel do posto de enfermagem;
- detalhe do leito com esqueleto animado e linha do tempo;
- histórico só de metadados;
- gaveta de bastidores;
- página do projeto;
- um cenário de demonstração roteirizado que o navegador controla com um botão.

**Critério de sucesso:** o roteiro da seção 9 roda do início ao fim três vezes seguidas, sem erro e idêntico a cada vez, legível num projetor de 1024×768.

## 4. Stack (fixa — não substitua)

- **Vite + React em JavaScript (JSX).** Não use TypeScript: um erro de tipo derruba o build da Vercel.
- **Tailwind CSS v4** com o plugin `@tailwindcss/vite`. Use `@import "tailwindcss";` no CSS e defina os tokens em `@theme`. Não crie `tailwind.config.js` nem use as diretivas `@tailwind base/components/utilities`, que são da v3.
- **`lucide-react`** para ícones.
- **Fonte Atkinson Hyperlegible**, empacotada localmente via Fontsource (`@fontsource/atkinson-hyperlegible`, ou a variante "Next" se existir no npm). Nada de Google Fonts ou CDN: o site tem que funcionar offline depois de carregado.
- **Navegação por estado** (`useState`/`useReducer` no App). Sem react-router: rotas internas dão 404 ao recarregar na Vercel.
- **Animação** com CSS transitions e `requestAnimationFrame`. Esqueleto em SVG puro.

Dependências permitidas: react, react-dom, vite, @vitejs/plugin-react, tailwindcss, @tailwindcss/vite, lucide-react e a fonte. Qualquer outra exige autorização do Ivan, com justificativa.

Proibido:

- Next.js, TypeScript e react-router;
- bibliotecas de componentes (shadcn, MUI, Chakra), bibliotecas de gráficos e framer-motion;
- backend, `fetch` e APIs externas;
- `getUserMedia`, `<video>` e qualquer `<img>` de pessoa.

## 5. Restrições de domínio (inegociáveis — vêm da defesa técnica do projeto)

1. **Nenhuma imagem de pessoa, em lugar nenhum.** O "feed" do leito é um esqueleto de 17 pontos sobre fundo neutro, com o contorno do leito. Não existe vídeo, miniatura nem botão de play.
2. **O sistema guarda só metadados:** leito, torre, posto, tipo de evento, origem (modelo ou sistema), horário, confiança, canais notificados, tempo de resposta e desfecho. Nenhum campo de imagem, vídeo, áudio ou nome de paciente.
3. **A interface é organizada por leito, nunca por câmera.** A palavra "câmera" quase não aparece; o equipamento surge só como estado do sensor.
4. **Um único usuário:** a enfermagem do posto no plantão noturno. Sem login, sem perfis, sem seguranças ou vigias.
5. **Três grupos de estado, visíveis na legenda.** Cada grupo tem um título e um subtítulo curto:
   - **Movimento** (reconhecido pelo modelo): Repouso; Sentando na borda (pré-queda); Tentando levantar (risco iminente); Queda.
   - **Contexto** (regras do sistema): Fora do leito há mais de 10 min; Acompanhante presente (qualquer outra pessoa junto ao leito, inclusive a equipe).
   - **Sensor:** Pausado (procedimento); Sem sinal; Não monitorado.
6. **Hierarquia e canais.** A interface não pode virar árvore de Natal:

   | Estado | Prioridade | Canal |
   |---|---|---|
   | Repouso | nenhuma | nenhum |
   | Sentando na borda | 3 | só visual no painel, silencioso |
   | Fora do leito há mais de 10 min | 2 | painel + celular do plantão |
   | Tentando levantar | 2 | painel + som + celular do plantão |
   | Queda | 1 | painel + som contínuo + celular + faixa até alguém reconhecer |

   "Acompanhante presente" atenua um nível: Sentando na borda vira só registro, e Tentando levantar vira alerta visual sem som. **Queda nunca é atenuada.**
7. **Só leitos de risco são monitorados**, ativados pela enfermagem com base na Escala de Morse. O painel mostra a proporção, por exemplo "9 de 24 leitos monitorados".
8. **Nenhuma métrica de desempenho inventada.** Nada de números de acurácia, precisão ou recall, "quedas evitadas", porcentagens de melhoria, gráficos de tendência ou KPIs. Dados operacionais fictícios (eventos, horários, a confiança de um evento) são permitidos; desempenho do modelo, nunca.
9. **Nenhuma contagem regressiva de "segundos até a queda".** O modelo classifica a fase atual; ele não prevê o instante da queda. Use o tempo decorrido desde o primeiro sinal (contador crescente) e a sequência de fases.
10. **Honestidade visível:**
    - uma faixa fixa no topo diz "Modo demonstração: protótipo de interface com dados simulados";
    - os valores técnicos dos Bastidores levam o rótulo "valores ilustrativos";
    - estimador e rede aparecem como "candidatos em avaliação", porque ainda não foram escolhidos.
11. **Escala do HBU:** 5 torres e 300 leitos, 60 por torre. Os nomes de torres, andares, postos e setores são fictícios e ficam num único arquivo de configuração, fácil de editar. Não use logo nem marca do HBU; cite o hospital só como cliente.
12. **Tudo em português do Brasil:** decimal com vírgula ("0,87"), horário de 24 h ("03:41:07"), durações no formato "00:21".

## 6. Direção visual

O assunto é um posto de enfermagem às 3h da manhã, projetado numa sala de aula. A tela precisa ser calma por padrão, para que a cor signifique alguma coisa, e legível a 6 metros. Gaste a ousadia em um lugar só: a sequência do movimento com a linha do tempo, no detalhe do leito. Todo o resto fica quieto.

**Tipografia.** Atkinson Hyperlegible, criada para legibilidade: distingue 1/l/I e 0/O, o que importa em números de leito.

- Corpo de 16 a 18 px; número do leito de 26 a 30 px em negrito; relógio grande.
- `font-variant-numeric: tabular-nums` em horários e contadores. Se a fonte não suportar, use largura fixa para o relógio não tremer.

**Paleta base (tema claro, padrão):**

| Papel | Cor |
|---|---|
| Fundo (cinza frio) | `#EDF1F4` |
| Superfície | `#FFFFFF` |
| Tinta | `#14232E` |
| Texto secundário | `#526270` |
| Linhas | `#CFD8DF` |
| Marca VIGIA (azul-petróleo, longe das cores de alerta) | `#0E5A6B` |

**Severidade.** O projetor lava cores claras, então use cores sólidas, não tons pastel:

| Estado | Preenchimento | Texto |
|---|---|---|
| Âmbar | `#F2B200` | `#2A1E00` |
| Laranja | `#EA580C` | `#1C0A00` (escuro, para separar do vermelho) |
| Vermelho | `#C62828` | branco (o único estado com texto branco, o mais forte) |
| Contexto (azul-ardósia) | só contorno e ícone, nunca preenchimento | `#3F5AA8` |
| Sensor | — | cinza `#8A98A3` |

**Regras visuais:**

- Todo estado tem **ícone e rótulo escrito**; nunca só cor (daltonismo e projetor).
- **Movimento:** só o laranja (um ponto pulsando devagar) e o vermelho (pulso lento de 1,5 s) se mexem. Nada de fade-in em cada seção, hover chamativo ou animação decorativa.
- **Cartões dos leitos:** raio pequeno (4 px), sem sombra, hierarquia por borda e preenchimento — não o kit genérico de cards SaaS.
  - Repouso: branco com borda fina.
  - Âmbar: barra lateral de 8 px e selo âmbar.
  - Laranja: borda de 3 px, selo laranja e ponto pulsando.
  - Vermelho: cartão inteiro vermelho, com texto branco.
  - Pausado: cinza, com ícone de pausa e tempo restante.
  - Sem sinal: borda tracejada, com ícone wifi-off.
  - Não monitorado: 40% de opacidade, só o número.
- **Evite os vícios de interface gerada:**
  - rótulos em CAIXA ALTA com espaçamento largo;
  - textos encadeados com ponto médio ("A · B · C") ou rótulos no formato "PALAVRA — fragmento";
  - fonte monoespaçada para rótulos e seta "→" no fim de botões;
  - gradientes decorativos, fundo creme e cartões de KPI com número gigante.

  Use texto em caixa normal, verbos claros nos botões ("Estou indo", "Atendido") e o mesmo nome para a mesma ação em toda a interface.
- **Modo noturno (P2):** defina os tokens como variáveis CSS desde o início, para que o alternador custe pouco. Escuro azulado (`#0F1A22` de fundo), nunca preto puro, mantendo as cores de severidade.
- **Resolução:** projete para 1280×720 e 1366×768, e funcione sem rolagem horizontal em 1024×768 com zoom de 100%. Botões com no mínimo 44 px de altura e foco visível.

## 7. Modelo de dados (arquivos em `src/data/`)

- **`estados.js`** — definição única de cada estado: chave, rótulo, categoria (`movimento` | `contexto` | `sensor`), prioridade, cores, ícone lucide, canais e regra de atenuação. Todo o resto da interface lê daqui.
- **`hospital.js`** — torres 1 a 5, cada uma com seus postos e 60 leitos no total.
  - Formato do leito: `{ id, torre, andar, posto, setor, monitorado, sensibilidade: 'alta' | 'padrão', sensor: 'online' | 'sem_sinal', monitoradoDesde }`.
  - Gere os leitos por função determinística, sem `Math.random`; se precisar de aleatoriedade, use um PRNG com semente fixa.
  - Comentário no topo do arquivo: "Nomes fictícios — ajustar se tivermos a estrutura real do HBU".
- **`eventos.js`** — cerca de 30 eventos fictícios do plantão atual (19h00 até 03:39) e do anterior.
  - Distribuição plausível: maioria "Sentando na borda", alguns "Tentando levantar", 2 a 3 "Fora do leito", alguns "Falso alarme", alguns "Registrado (atenuado: acompanhante)" e uma "Queda" (por exemplo às 01:12, atendida em 00:48, desfecho "Queda com atendimento").
  - Campos: `{ id, horario, torre, posto, leito, estado, origem: 'modelo' | 'sistema', confianca (só para movimento), canais, tempoResposta, desfecho, bastidores }`.
- **`poses.js`** — os 17 pontos COCO de cada pose-chave (seção 8.3).
- **`cenario.js`** — as etapas do roteiro de demonstração (seção 9).
- **Limiares ilustrativos:** sensibilidade alta = 0,55; padrão = 0,70.

## 8. Telas

### 8.1 Moldura comum

- **Faixa de demonstração** — no topo, fina, na cor de tinta (não de alerta). Contém:
  - o texto "Modo demonstração: protótipo de interface com dados simulados";
  - um indicador de etapa, por exemplo "Etapa 2 de 3. Próximo: abrir o leito 312";
  - os botões "Próxima etapa", "Reiniciar" e "Tela cheia" (Fullscreen API).
- **Atalhos de teclado:**
  - seta para a direita: próxima etapa;
  - R: reiniciar;
  - F: tela cheia;
  - Q: cenário extra de queda (P2).

  Ignore os atalhos quando o foco estiver num campo de texto, e evite que a barra de espaço dispare duas vezes o botão focado.
- **Cabeçalho:**
  - marca VIGIA: a palavra mais um pequeno símbolo de pontos ligados, desenhado em SVG;
  - seletor de torre (1 a 5), cada torre com um pequeno contador de alertas ativos;
  - seletor de posto;
  - abas Painel, Histórico e Projeto;
  - relógio simulado grande e o rótulo "Plantão noturno".
- **Relógio simulado:** começa em 03:40:00 a cada reinício e anda em tempo real.
- **Recarregar a página (F5)** volta ao estado inicial exato. Não use localStorage.

### 8.2 Painel do posto

Tela inicial: Torre 3, 3º andar, Clínica Médica (fictício).

- **Linha de contexto:** "9 de 24 leitos monitorados", mais o alternador "Mostrar todos os leitos do posto". Desligado, aparecem só os monitorados, em cartões grandes; ligado, os não monitorados aparecem esmaecidos.
- **Grade de cartões de leito**, ocupando cerca de 70% da largura. Cada cartão mostra:
  - o número do leito, grande;
  - o rótulo do estado, com ícone;
  - o tempo desde a última mudança;
  - um selo de contexto, quando houver.

  Sem nome de paciente. A confiança **não** aparece no cartão.
- **Fila de alertas**, à direita (cerca de 30%):
  - ordenada por prioridade e depois por tempo;
  - cada item mostra leito, estado e tempo decorrido;
  - vazia, mostra "Nenhum alerta ativo";
  - tem uma seção recolhível "Atenuados por contexto".
- **Legenda** no rodapé, com os três grupos da seção 5.5 (título e subtítulo).
- **Estado inicial da Torre 3:**
  - leitos monitorados: 301, 303, 305, 308, 310, 312, 315, 318 e 321;
  - todos em Repouso, exceto: 318 (Acompanhante presente, calmo), 321 (Pausado: banho, retorna em 12 min, contando) e 303 (Sem sinal há 2 min);
  - fila vazia.
- **Outras torres:** postos gerados, todos calmos. No máximo um alerta âmbar em outra torre, para o contador do seletor fazer sentido.
- **Cliques:**
  - num leito monitorado, abre o detalhe;
  - num leito não monitorado, mostra só a dica "Monitoramento ativado pela enfermagem para leitos de risco".

### 8.3 Detalhe do leito

**Cabeçalho:** "← Painel"; "Leito 312"; torre, andar e posto; sensibilidade "Alta (definida pela enfermagem pela Escala de Morse)"; estado do sensor; "Monitorado desde 19:12".

**Esqueleto (SVG, à esquerda):**

- Vista lateral, fundo neutro liso com uma grade muito sutil, contorno do leito (colchão, cabeceira e pés) e linha do chão.
- Os 17 pontos COCO, nesta ordem de índice:

  | Índice | Ponto | Índice | Ponto |
  |---|---|---|---|
  | 0 | nariz | 9 | punho esquerdo |
  | 1 | olho esquerdo | 10 | punho direito |
  | 2 | olho direito | 11 | quadril esquerdo |
  | 3 | orelha esquerda | 12 | quadril direito |
  | 4 | orelha direita | 13 | joelho esquerdo |
  | 5 | ombro esquerdo | 14 | joelho direito |
  | 6 | ombro direito | 15 | tornozelo esquerdo |
  | 7 | cotovelo esquerdo | 16 | tornozelo direito |
  | 8 | cotovelo direito | | |

- Arestas: 15-13, 13-11, 16-14, 14-12, 11-12, 5-11, 6-12, 5-6, 5-7, 6-8, 7-9, 8-10, 1-2, 0-1, 0-2, 1-3, 2-4, 3-5, 4-6.
- Escolha um lado do corpo como o mais distante da câmera e mantenha a escolha. Esse lado fica deslocado cerca de 4 px e com 50% de opacidade, para dar profundidade.
- Cada ponto tem uma confiança. Em Repouso, joelhos e tornozelos ficam entre 0,4 e 0,6 (oclusão do lençol) e são desenhados mais transparentes, com arestas tracejadas.
- Legenda fixa abaixo do esqueleto: "17 pontos (x, y, confiança) por quadro. Nenhuma imagem é exibida, gravada ou transmitida."

**Poses-chave**, em coordenadas de um `viewBox` fixo, com proporções anatômicas coerentes (tronco ≈ coxa ≈ canela; cabeça pequena):

- **A — Repouso:** deitado de costas ao longo do colchão, cabeça na cabeceira.
- **B — Sentando na borda:** tronco vertical sobre a borda do colchão, quadril na altura do colchão, coxas curtas (em escorço, apontando para a câmera) e canelas penduradas até perto do chão.
- **C — Tentando levantar:** quadril saindo do colchão, joelhos dobrados, pés no chão, tronco inclinado para o lado e um braço apoiado no colchão. Balanço lateral suave (±3 px), para sugerir instabilidade.
- **D — Queda** (só no cenário extra): corpo no chão, à frente do leito.

**Animação e conferência das poses:**

- Transição entre poses por interpolação ponto a ponto, com easing, em 1,5 a 2,5 s.
- Em Repouso, uma "respiração" de ±1 px nos ombros.
- Crie a página `?debug=poses`, que mostra as quatro poses lado a lado com os índices dos pontos, para o Ivan conferir visualmente.
- Se o seu ambiente permitir capturar a tela do navegador sem instalações demoradas, confira você mesmo. Senão, peça ao Ivan para olhar e descrever o que está errado.

**Painel de estado (à direita):**

- estado atual, com ícone e cor;
- "Confiança do modelo: 0,87", com uma barra fina;
- "Primeiro sinal há 00:14", contador crescente;
- notificações enviadas, com horário (por exemplo: Painel 03:41:02; Celular do plantão 03:41:09);
- botões "Estou indo", "Atendido", "Falso alarme", "Pausar 15 min" e "Ver bastidores".

**Sequência do movimento e linha do tempo** — embaixo, em largura total. Este é o elemento memorável da interface.

- *Linha 1, sequência de fases:* Repouso → Sentando na borda → Tentando levantar → Queda.
  - Fases passadas ficam preenchidas, a fase atual fica destacada na sua cor e as fases futuras aparecem só em contorno.
  - Acima, um colchete "Janela de prevenção" vai do início de "Sentando na borda" até "Queda". A parte já percorrida fica preenchida, e a restante encolhe a cada fase.
  - Sob a fase Queda (vermelha), o rótulo "Aqui começam os detectores de queda comuns".
- *Linha 2, linha do tempo dos últimos 60 s:* segmentos coloridos por estado; marcas "-60 s", "-30 s" e "agora"; marcadores pequenos para notificações e ações ("Estou indo", "Atendido").
- *Depois de "Atendido":* o colchete mostra "Atendido dentro da janela", com um ícone de check, e o vermelho permanece como fase não atingida.

**Ações:**

- **"Estou indo"** mostra "Técnica a caminho" e um contador.
- **"Atendido"**:
  - registra o desfecho "Atendido em pré-queda" e o tempo total;
  - devolve o esqueleto à pose B;
  - volta o cartão do painel ao estado calmo, com um selo "Atendido" que some em 10 s;
  - coloca o evento no topo do Histórico.
- **"Falso alarme"** (P1) registra o desfecho "Falso alarme".
- **"Pausar 15 min"** (P1) coloca o leito em Pausado, com contagem.

**(P1) Chegada da técnica:** ao clicar "Atendido", um segundo esqueleto (a técnica) aparece em pé ao lado do leito, e o selo "Acompanhante presente" surge por 5 s. Isso mostra que o sistema atenua sozinho quando chega outra pessoa.

**(P1) Notificação de celular:** quando o leito vai para laranja, um pequeno cartão em forma de celular desliza no canto inferior direito, com o título "Celular do plantão" e o texto "VIGIA: leito 312 tentando levantar (Torre 3, 3º andar)". Some em 6 s.

### 8.4 Histórico (só metadados)

- Título "Histórico de eventos", com o subtítulo "Somente metadados. Nenhuma imagem é armazenada."
- Filtros: torre, plantão (atual ou anterior), origem (Movimento ou Contexto) e desfecho.
- Colunas da tabela:
  - horário;
  - leito, com a torre numa linha menor;
  - evento, como selo com ícone;
  - origem (Modelo ou Sistema);
  - confiança, vazia para eventos de contexto;
  - tempo de resposta;
  - desfecho.
- Nenhum botão de play, nenhuma miniatura.
- Clicar numa linha abre os Bastidores daquele evento.
- O evento do cenário (leito 312) aparece no topo assim que for atendido.
- No rodapé, uma caixa com duas colunas:
  - "O que o VIGIA guarda": leito, horário, tipo de evento, origem, confiança e desfecho;
  - "O que o VIGIA nunca guarda": imagem, vídeo, áudio, rosto e nome do paciente.

### 8.5 Bastidores (P1)

Gaveta lateral que abre pelo detalhe ou pelo histórico. Título "Como este alerta foi gerado" e etiqueta "valores ilustrativos". São cinco passos numerados; aqui a numeração faz sentido, porque é um pipeline.

1. **Percepção.**
   - Entrada: imagem de 640×480×3 = 921.600 valores por quadro, descartada no dispositivo.
   - Saída: 17 pontos × (x, y, confiança) = 51 valores.
   - Estimador: candidatos em avaliação (YOLO-pose, RTMPose, MediaPipe).
   - Um mini-esqueleto ilustrativo.
2. **Janela temporal.** Cerca de 2 s a 30 quadros/s: 3.060 valores, contra cerca de 55 milhões em pixels.
3. **Decisão (aprendida).**
   - Rede temporal: candidatas em avaliação (ST-GCN, LSTM/GRU).
   - Barras horizontais com a probabilidade das quatro classes de movimento. Exemplo: Tentando levantar 0,87; Sentando na borda 0,09; Repouso 0,03; Queda 0,01.
   - Uma linha vertical marcando o limiar do leito (0,55).
4. **Contexto (regras do sistema).** Pessoas detectadas: 1. Leito pausado: não. Resultado: alerta sem atenuação.
5. **Registro.** Um cartão com exatamente os campos salvos para este evento, em formato legível (chave: valor).

Rodapé da gaveta: "Comparação planejada para o 3º mês: regra geométrica contra rede temporal, sobre o mesmo esqueleto."

Para eventos de contexto (por exemplo, Fora do leito), o passo 3 mostra "Não se aplica: evento de contexto", e o passo 4 mostra a regra ("nenhum esqueleto na área do leito há 10 min").

### 8.6 Projeto (P1)

Página sóbria, sem cara de landing page.

- **"Por que é viável":**
  - não depende de dados do hospital: bases públicas (UP-Fall, UR Fall, Le2i, NTU RGB+D) mais cenas gravadas pela equipe em simulação;
  - a percepção já existe pronta (estimadores de pose pré-treinados), e o que treinamos vê só 51 números por quadro;
  - hardware barato: webcam e notebook no MVP; Raspberry Pi 5 ou Jetson Orin Nano no piloto;
  - LGPD por arquitetura.
- **"Escopo do semestre":** o que entregamos e o que não entregamos, em duas listas curtas, coerentes com o Pitch 0 (sem paciente real, sem instalação no HBU, sem integração com prontuário). A frase "precisão e recall reportados no fim do semestre" é permitida aqui.
- **"Onde estamos":** uma linha de M1 a M5, com o marcador "Agora: M1".
  - Feito: protótipo de interface e fluxo.
  - Próximo: bases públicas processadas e estimador de pose rodando sobre vídeo gravado.
  - Marcador no M3: "Demonstração: modelo contra regra geométrica".
  - **Não escreva "em andamento" para nada além da interface.**
- **Frase final**, em destaque tipográfico: "Um par de olhos a mais em cada quarto — que nunca vê o rosto de ninguém."
- **Rodapé:** "Projeto acadêmico da Fábrica de Projetos Ágeis IV, Bacharelado em IA, UNIMAR. Cliente: Hospital Beneficente Unimar."

## 9. Cenário de demonstração (determinístico)

A etapa avança só pelo botão "Próxima etapa" ou pela seta para a direita, a partir de qualquer tela. As ações do produto (abrir leito, Estou indo, Atendido, abrir histórico) são cliques reais do navegador. O indicador na faixa mostra a etapa atual e a próxima ação esperada.

**Etapa 0** (inicial, ou depois de R): o estado inicial da seção 8.2, com o relógio em 03:40:00.

**Etapa 1:**
- o leito 312 passa para Sentando na borda, com confiança 0,78;
- entra na fila, sem som;
- o esqueleto vai da pose A para a B;
- começa o contador de primeiro sinal.

Próximo esperado: abrir o leito 312.

**Etapa 2:**
- o leito 312 passa para Tentando levantar, com confiança 0,87, e sobe na fila;
- aparece a notificação de celular (P1);
- o esqueleto vai da pose B para a C, com balanço;
- a janela encolhe.

Próximo esperado: "Estou indo" e depois "Atendido".

**Etapa 3:** o leito 318 (com acompanhante) passa para Sentando na borda, **atenuado**:
- o cartão mostra um selo âmbar pequeno com "atenuado: acompanhante presente";
- não entra na fila principal, só em "Atenuados por contexto";
- vira linha no histórico, com o desfecho "Registrado (atenuado)".

**Fim:** a faixa mostra "Fim do cenário. Aperte R para reiniciar."

**Robustez:**
- "Atendido" funciona em qualquer etapa;
- avançar com o detalhe aberto atualiza o detalhe;
- R limpa tudo, inclusive os eventos criados no histórico.

**(P2) Cenário extra, tecla Q:** o leito 305 passa por Tentando levantar e cai para Queda (pose D). Uma faixa vermelha fica no topo da tela até alguém clicar "Atendido". Serve só para as perguntas depois do pitch.

## 10. Fora do escopo (não faça)

- backend, API, banco de dados e autenticação;
- webcam, modelo de IA e app mobile separado;
- mapa de calor, risco por paciente com ML e decúbito;
- internacionalização e testes automatizados;
- página de configurações e cadastro de paciente;
- documentação além do README.

## 11. Método de trabalho

Trabalhe por fases. Ao fim de cada fase:

1. rode `npm run build`, que precisa passar sem erros;
2. faça commit, com uma mensagem clara;
3. faça push, se o repositório remoto já existir;
4. mande ao Ivan um resumo de até 5 linhas: o que mudou, como ver e qual é a próxima fase;
5. **pare e espere o "ok" dele.**

Não reescreva o que já funciona sem motivo, e não releia arquivos à toa.

### Fase 0 — Preparação e primeiro deploy (prioridade máxima)

1. Confira `node -v` e `git --version`. Se faltar o Node, peça ao Ivan para instalar a versão LTS de nodejs.org.
2. Crie o projeto numa **subpasta nova**, `vigia-prototipo`, com Vite (template react, JavaScript). Se o criador do Vite travar em alguma pergunta interativa, cancele e monte o projeto à mão (package.json, vite.config.js, index.html, src/); é pequeno.
3. Instale as dependências da seção 4.
4. Copie este documento para `vigia-prototipo/SPEC.md`.
5. Crie um `CLAUDE.md` curto, de até 15 linhas, com as regras inegociáveis das seções 4 e 5 e a instrução "leia SPEC.md antes de cada fase".
6. Faça uma página provisória "VIGIA em construção" e rode o build.
7. Rode `git init` e faça o primeiro commit.
8. Guie o Ivan, passo a passo:
   1. criar um repositório vazio no GitHub (sugira o nome `vigia-prototipo`) e te passar a URL;
   2. você conecta o remoto e faz o push;
   3. criar uma conta na Vercel entrando com o GitHub e importar o repositório (o preset Vite é detectado sozinho; build `npm run build`, saída `dist`);
   4. conferir a URL publicada numa aba anônima.

Daí em diante, cada push publica sozinho.

### Fases seguintes

- **Fase 1 — Fundação:** tokens de design, arquivos de dados, moldura (faixa, cabeçalho, abas, relógio, botão Tela cheia), estado global com `useReducer` e atalhos de teclado.
- **Fase 2 — Painel (P0).**
- **Fase 3 — Detalhe do leito (P0):** esqueleto, sequência, linha do tempo e o cenário completo, incluindo `?debug=poses`. Se as poses não ficarem convincentes em duas tentativas, troque por poses estáticas com crossfade e avise o Ivan.
- **Fase 4 — Histórico (P0).** Aqui o mínimo apresentável está pronto: faça o deploy e avise.
- **Fase 5 — P1:** Bastidores, Projeto, notificação de celular, Falso alarme e Pausar, e o segundo esqueleto.
- **Fase 6 — P2, só se o Ivan pedir:** modo noturno; som (WebAudio, desligado por padrão, com botão); cenário extra Q.
- **Fase 7 — Verificação final:** checklist da seção 12, README curto e deploy final.

### Ordem de corte, se faltar tempo

Corte nesta ordem: todo o P2, depois o segundo esqueleto, depois a notificação de celular, depois uma versão simplificada do Projeto e, por último, uma versão simplificada dos Bastidores.

Nunca corte: faixa de demonstração, painel, cenário, detalhe com a sequência e histórico.

## 12. Validação antes de dizer que terminou

- [ ] `npm run build` e `npm run preview` funcionam, e o console do navegador está sem erros.
- [ ] `package.json` só tem as dependências permitidas.
- [ ] Busca no código não encontra: `<img>` de pessoa, `<video>`, `getUserMedia`, `fetch`, `localStorage` nem números de acurácia, precisão ou recall.
- [ ] Todo estado aparece com ícone e texto, e a legenda mostra os três grupos.
- [ ] O roteiro roda três vezes seguidas, com o mesmo resultado: R, etapa 1, abrir 312, etapa 2, Estou indo, Atendido, voltar ao painel, etapa 3, Histórico (evento do 312 no topo), clicar na linha, Bastidores, fechar, Projeto.
- [ ] F5 volta ao estado inicial.
- [ ] Não há rolagem horizontal em 1024×768, 1280×720 e 1366×768 com zoom de 100%, e o texto dos cartões é legível a distância.
- [ ] Todo leito monitorado, de qualquer torre, abre o detalhe sem erro.
- [ ] A URL da Vercel abre numa aba anônima com a versão final.
- [ ] O README explica, em português e em poucas linhas: como rodar local (`npm install`, `npm run dev`), como rodar offline (`npm run build` e depois `npm run preview`) e os atalhos da demonstração.

## 13. Comportamento diante de dúvidas

Se algo for ambíguo ou entrar em conflito, decida nesta ordem de prioridade:

1. respeitar as restrições da seção 5;
2. manter a demonstração determinística e à prova de erro;
3. escolher a solução mais simples.

Registre a decisão no resumo da fase. Só pergunte ao Ivan quando for bloqueante: credenciais, URL do repositório ou uma preferência visual. Não acrescente funcionalidades que não estão aqui.
