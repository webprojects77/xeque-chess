# Arquitetura do Xeque Chess

O projeto roda inteiro no navegador. Não há backend: o GitHub Pages só serve os arquivos.

## Arquivos

| Arquivo | Função |
| --- | --- |
| `index.html` | Interface, estado da partida, relógio, sons, modos e telas |
| `engine.js` | Motor do Xeque: geração de lances, busca alfa-beta, avaliação, perft e fraqueza controlada |
| `levels.js` | Os 9 níveis (profundidade, ruído, chance de lance aleatório, tempo) |
| `aberturas.js` | Livro de aberturas usado na demonstração |
| `chess-util.js` | SAN, validação de FEN, PGN e busca exaustiva de mates |
| `uci.js` | Camada UCI em volta do motor |
| `stockfish/` | Stockfish em WebAssembly, usado como supervisor e nas demonstrações |
| `weights.json` | Pesos de avaliação treinados |
| `exercicios.json` | Exercícios gerados por `treino/exercicios.js` |
| `sw.js`, `manifest.webmanifest` | Instalação como app e uso offline |
| `treino/` | Treino automático dos pesos, gerador de exercícios, calibragem e comparação de versões |
| `tests/` | Testes automatizados (`npm test`) |

## Fluxo de um lance

1. O clique no tabuleiro vira um lance legal (`X.legal()`), com escolha da peça na promoção.
2. `humanMove` registra o lance, atualiza relógio, som e animação e, no modo Aprender, pede a análise.
3. `engineMove` chama `think()`. Nos níveis 1 a 8 só o Xeque joga, com os parâmetros de `levels.js`. No nível 9 o Stockfish supervisiona o lance do Xeque.
4. `apply` aplica o lance e devolve a vez.

## Como o nível enfraquece o motor

`think(ms, profundidade, ruído, callback, excluir, aleatório)`:

- com probabilidade `aleatório`, joga um lance legal qualquer;
- senão avalia cada lance na profundidade pedida e soma um ruído gaussiano de desvio `ruído` (em centipeões), escolhendo o melhor resultado;
- mates encontrados nunca recebem ruído.

## Armazenamento no navegador

| Chave | Conteúdo |
| --- | --- |
| `xeque_cfg` | Cor, nível, relógio, tema, sons e animações |
| `xeque_st` | Estatísticas, rating local e progresso dos exercícios |
| `xeque_hist` | Histórico de partidas (as com estrela nunca saem) |
| `xeque_mem` | Lições aprendidas pelo motor |
| `xeque_log` | Erros registrados para o diagnóstico |

O backup em Mais → Estatísticas exporta e restaura tudo isso num arquivo.

## Como estender

- **Novo nível ou ajuste:** edite `levels.js` e rode `node treino/calibrar.js 8 0 8`.
- **Nova abertura:** acrescente uma linha em `aberturas.js`. O teste `niveis.test.js` confere se todos os lances são legais.
- **Novos exercícios:** `node treino/exercicios.js 8` regenera `exercicios.json`. Precisa de um Stockfish nativo (variável `STOCKFISH`).
- **Comparar versões:** `node treino/comparar.js <commit> <jogos> <ms>`.

## Testes e publicação

`npm test` roda perft, motor, níveis, aberturas, PGN/FEN e um teste de força. O workflow `testes.yml` roda isso a cada alteração no `main` e o `treino.yml` atualiza os pesos a cada 3 horas.

## Treino automático dos pesos

`treino/rodada.js` roda a cada 3 horas no GitHub Actions:

1. `gen.js` gera posições calmas de partidas do próprio Xeque;
2. `label.js` rotula cada posição com a avaliação do Stockfish;
3. `tune.js` ajusta os pesos de avaliação para se aproximarem do Stockfish, com cada peso limitado a 70% a 140% do valor padrão;
4. `rodada.js` cria dois candidatos (pesos ajustados por inteiro e pela metade do caminho), joga os dois contra os pesos atuais, confirma o melhor com mais partidas e só aceita se o placar combinado for de pelo menos 52%.

Em 15 rodadas seguidas os pesos ajustados jogaram um pouco pior que os atuais, mesmo com o erro de validação caindo cerca de 11%. Ou seja, aproximar a avaliação estática do Stockfish não torna o Xeque mais forte. Ganhos maiores devem vir da busca (poda, extensões, tabela de transposição), não dos pesos.
