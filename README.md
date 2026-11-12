# ♞ Xeque

IA de xadrez que roda inteira no navegador, criada por **Davi Ch.** · Discord: **777.imt**
A chess AI that runs entirely in the browser, made by **Davi Ch.** · Discord: **777.imt**

**Jogar / Play:** https://webprojects77.github.io/xeque-chess/

[Português](#português) · [English](#english)

---

## Português

### O que é

O Xeque é uma IA de xadrez com motor próprio (`engine.js`) e interface web que funciona no celular e no PC, sem servidor. Ele joga acompanhado do Stockfish, que atua como supervisor.

Sem exagero: o Xeque não é a melhor IA do mundo. O Stockfish é muito mais forte. O Xeque é um projeto que nasceu pra aprender, evoluir e ser treinado.

### Como foi criado

1. **Versão em C++.** O primeiro motor foi escrito em C++ (tabuleiro com bitboards, busca alpha-beta, tabela de transposição, poda por lance nulo, redução de lances tardios, SEE, UCI). A geração de lances foi validada em 6 posições padrão de teste (perft). Em partidas rápidas contra o Stockfish com força limitada, ele ficou em torno de 2700 na escala do Stockfish limitado (estimativa grosseira, não é Elo oficial). Essa versão ainda não está neste repositório.
2. **Versão para navegador.** Como o C++ não roda direto numa página, o motor foi reescrito em JavaScript (`engine.js`): tabuleiro 0x88, busca PVS com aprofundamento iterativo, tabela de transposição, poda, buscas de quiescência e uma avaliação feita à mão (valor das peças, posição das peças, mobilidade, par de bispos, peões dobrados/isolados/passados, torres em colunas abertas, proteção do rei). Estimativa: cerca de 2200 contra o Stockfish limitado a 2200, em partidas rápidas.
3. **Interface.** HTML puro, feito pra celular: toque na peça e na casa de destino. O roque funciona tocando no rei e na torre. A IA tem 9 níveis de dificuldade, do Principiante ao Impossível (nível máximo).
4. **Dois cérebros.** O Xeque é o cérebro principal e o Stockfish confere os lances dele (veja abaixo).
5. **Treino automático.** Um workflow do GitHub Actions treina a avaliação do Xeque o tempo todo, mesmo sem ninguém no site.

Testes feitos: perft nas 6 posições padrão; comparação dos lances legais com o python-chess em 57 mil posições de partidas aleatórias (zero divergências); problemas táticos; partidas contra o Stockfish limitado.

### Novidades

- **Abas:** Jogar, Aprender, Exercícios e Mais. Tudo que antes estava espalhado agora tem um lugar só.
- **Nova partida:** uma única tela para escolher cor, dificuldade e relógio.
- **Dificuldade de verdade:** 9 níveis. Nos mais fáceis o Xeque erra como um iniciante (deixa peças penduradas e perde lances táticos); nos mais altos ele joga com toda a força, e no Impossível o Stockfish supervisiona.
- **Relógio:** 3, 5 e 10 minutos, 3+2, 5+3 e tempo personalizado, com incremento.
- **Aprender:** jogar com ajuda do Xeque (nota e explicação de cada lance), análise livre e ver aberturas, em que o Xeque e o Stockfish jogam e o app explica a abertura.
- **Exercícios:** mate em 1, 2 e 3, táticas e "aproveite o erro", com progresso e recomendação do que treinar.
- **Histórico:** guarda as últimas 60 partidas e as que você marcar com estrela nunca saem. Dá para rever lance a lance, pedir comentários do Xeque, exportar e importar PGN e fazer backup.
- **Posição personalizada:** partidas a partir de qualquer FEN.
- **Interface:** peças novas, sons, animação dos lances, 5 temas de tabuleiro e escolha da peça na promoção.
- **App:** dá para instalar na tela inicial e abrir sem internet depois do primeiro acesso.
- **Acessibilidade:** o tabuleiro funciona pelo teclado (setas, Enter) e leitores de tela anunciam cada casa e cada mensagem.
- **Diagnóstico:** em Mais, uma tela com versão e erros registrados, para mandar quando algo quebrar.
- **Testes:** `node --test tests/*.test.js` roda perft nas 6 posições padrão, testes do motor, dos níveis, das aberturas e do PGN/FEN. O workflow `testes.yml` roda isso a cada alteração.

### Como ele joga

A cada lance da IA:

1. O **Xeque** (principal) e o **Stockfish** (supervisor) pensam ao mesmo tempo, cerca de 3 segundos.
2. Se os dois escolhem o mesmo lance, ele é jogado.
3. Se escolhem lances diferentes, o Stockfish compara os dois lances na mesma busca. Se o lance do Xeque for pior que o do Stockfish por mais de 0,6 de peão, o Stockfish "avisa".
4. Depois do aviso, o Xeque refaz a busca sem o lance ruim. Se o novo lance for aprovado, ele joga. Se ainda for fraco, o Stockfish decide.
5. Se o Stockfish não carregar, o Xeque joga sozinho.

### Como ele melhora

Há duas formas, com limites diferentes:

- **Memória de lições (no navegador).** Cada vez que o Stockfish aprova ou corrige um lance, o Xeque guarda a posição e o lance certo (até 20 mil posições, no `localStorage`). Se a mesma posição voltar, ele joga direto e não repete o erro. Isso só ajuda em posições repetidas (principalmente aberturas) e fica só naquele aparelho e navegador.
- **Treino automático (na nuvem).** A avaliação do Xeque tem 43 pesos ajustáveis (valor das peças, mobilidade, peões, etc.), guardados em `weights.json`. A página carrega esse arquivo ao abrir e mostra "cérebro: geração N".

### Como funcionam os treinos

O workflow `.github/workflows/treino.yml` roda a cada 3 horas e cada rodada dura cerca de 2h30. Em cada rodada:

1. **Gerar posições:** o Xeque joga contra si mesmo, com lances levemente aleatórios, e guarda posições variadas e "calmas" (sem capturas pendentes).
2. **Rotular:** o Stockfish (profundidade 10) dá uma nota pra cada posição.
3. **Ajustar:** o Xeque modifica um peso por vez e mantém a mudança se a avaliação dele ficar mais próxima da nota do Stockfish (erro quadrático em probabilidade de vitória). Os dados são separados em treino (85%) e validação (15%).
4. **Conferir:** se o erro de validação caiu, os pesos novos jogam de 120 a 200 partidas contra os atuais. Só são aceitos se não perderem (placar de pelo menos 50%).
5. **Registrar:** se aceitos, `weights.json` ganha uma geração nova. Toda rodada anota o resultado em `treino/historico.json`.

Resultado da primeira rodada de teste: 13 mil posições, erro de validação de 0,00995 para 0,00886, mas os pesos novos fizeram 44 vitórias, 27 empates e 49 derrotas. Foram recusados pela trava, e o Xeque ficou na geração 0.

### Limites

- Só os pesos da avaliação são treinados. A busca e a forma de avaliar continuam as mesmas, então o treino pode estagnar.
- A memória de lições não deixa o Xeque mais forte em posições novas.
- Os números de Elo são estimativas grosseiras (poucas partidas, partidas rápidas, escala do Stockfish limitado). Não valem como Elo oficial.

### Projetos para o futuro

Ideias, sem promessa de prazo:

- Compilar o Xeque em C++ para WebAssembly e rodar no navegador (mais forte que a versão em JavaScript).
- Treinar uma avaliação com rede neural (estilo NNUE) por self-play.
- Treinar mais parâmetros (segurança do rei, estrutura de peões) e com mais dados.
- Compartilhar a memória de lições entre aparelhos (exportar/importar ou guardar no repositório).
- Livro de aberturas aprendido nas partidas.
- Lista de lances, exportação em PGN e modo análise.
- Definir uma licença para o código do Xeque.

### Arquivos

- `index.html`: interface
- `engine.js`: motor do Xeque
- `chess-util.js`: SAN, validação de FEN, PGN e busca de mates
- `levels.js`: os 9 níveis de dificuldade
- `aberturas.js`: livro de aberturas usado na demonstração
- `exercicios.json`: exercícios gerados por `treino/exercicios.js`
- `tests/`: testes automatizados
- `sw.js` e `manifest.webmanifest`: instalação como app e uso offline
- `treino/comparar.js`: joga a versão atual contra uma versão antiga (`node treino/comparar.js HEAD~10 20`)
- `docs/ARQUITETURA.md`: como o projeto é organizado
- `weights.json`: pesos treinados (geração atual)
- `treino/`: scripts de treino (`gen.js`, `label.js`, `tune.js`, `match.py`, `rodada.js`) e `historico.json`
- `uci.js`: liga o Xeque em interfaces UCI (Arena, Cute Chess, Lichess-bot) com `node uci.js`
- `stockfish/`: Stockfish (terceiros, GPL v3)
- `THIRD_PARTY_LICENSES.md`: detalhes das licenças de terceiros

### Créditos

- **Xeque:** ideia, direção e projeto de **Davi Ch.** · Discord: **777.imt**
- **Stockfish:** projeto independente, usado aqui como supervisor. Pertence aos autores e colaboradores do Stockfish, sob GPL v3. Build para navegador: Stockfish.js v19.0.1, de Nathan Rugg. O Stockfish não foi criado pelo autor do Xeque.
- **python-chess** (Niklas Fiekas): usado nos testes e nas partidas de conferência do treino.


---

## English

### What it is

Xeque is a chess AI with its own engine (`engine.js`) and a web interface that works on phones and desktops, with no server. It plays alongside Stockfish, which acts as its supervisor.

To be clear: Xeque is not the best chess AI in the world. Stockfish is far stronger. Xeque is a project built to learn, evolve and be trained.

### How it was made

1. **C++ version.** The first engine was written in C++ (bitboards, alpha-beta search, transposition table, null-move pruning, late-move reductions, SEE, UCI). Move generation was validated on 6 standard test positions (perft). In fast games against strength-limited Stockfish it scored around 2700 on the limited-Stockfish scale (a rough estimate, not an official Elo). This version is not in this repository yet.
2. **Browser version.** Since C++ does not run directly in a web page, the engine was rewritten in JavaScript (`engine.js`): 0x88 board, PVS search with iterative deepening, transposition table, pruning, quiescence search and a hand-written evaluation (piece values, piece placement, mobility, bishop pair, doubled/isolated/passed pawns, rooks on open files, king shelter). Estimate: about 2200 against Stockfish limited to 2200, in fast games.
3. **Interface.** Plain HTML, built for phones: tap a piece, then tap the target square. Castling works by tapping the king and the rook. The AI has 9 difficulty levels, from Beginner to Impossible (maximum strength).
4. **Two brains.** Xeque is the main brain and Stockfish checks its moves (see below).
5. **Automatic training.** A GitHub Actions workflow keeps training Xeque's evaluation, even when nobody is on the site.

Tests run: perft on the 6 standard positions; legal moves compared with python-chess on 57 thousand positions from random games (zero mismatches); tactical puzzles; games against strength-limited Stockfish.

### What's new

- **Tabs:** Play, Learn, Exercises and More. Everything that was scattered now has one place.
- **New game:** a single screen to pick color, difficulty and clock.
- **Real difficulty:** 9 levels. At the easy levels Xeque blunders like a beginner (leaves pieces hanging and misses tactics); at the top it plays at full strength, and at Impossible Stockfish supervises.
- **Clock:** 3, 5 and 10 minutes, 3+2, 5+3 and custom time, with increment.
- **Learn:** play with Xeque's help (grade and explanation for every move), free analysis and watch openings, where Xeque and Stockfish play and the app explains the opening.
- **Exercises:** mate in 1, 2 and 3, tactics and "punish the mistake", with progress and training recommendations.
- **History:** keeps the last 60 games, and starred games never drop off. Review move by move, ask Xeque for comments, export and import PGN, and back everything up.
- **Custom position:** games from any FEN.
- **Interface:** new pieces, sounds, move animations, 5 board themes and a promotion piece picker.
- **App:** installable to the home screen, works offline after the first visit.
- **Accessibility:** the board works from the keyboard (arrows, Enter) and screen readers announce every square and message.
- **Diagnostics:** a screen under More with the version and logged errors, to send along when something breaks.
- **Tests:** `node --test tests/*.test.js` runs perft on the 6 standard positions plus engine, level, opening and PGN/FEN tests. The `testes.yml` workflow runs it on every change.

### How it plays

For each AI move:

1. **Xeque** (main) and **Stockfish** (supervisor) think at the same time, for about 3 seconds.
2. If both pick the same move, it is played.
3. If they pick different moves, Stockfish compares both in the same search. If Xeque's move is worse than Stockfish's by more than 0.6 of a pawn, Stockfish "warns" it.
4. After the warning, Xeque searches again without the bad move. If the new move is approved, it is played. If it is still weak, Stockfish decides.
5. If Stockfish fails to load, Xeque plays alone.

### How it improves

There are two ways, with different limits:

- **Lesson memory (in the browser).** Each time Stockfish approves or corrects a move, Xeque stores the position and the right move (up to 20 thousand positions, in `localStorage`). If the same position comes back, it plays directly and does not repeat the mistake. This only helps with repeated positions (mostly openings) and stays on that device and browser.
- **Automatic training (in the cloud).** Xeque's evaluation has 43 tunable weights (piece values, mobility, pawns, etc.), stored in `weights.json`. The page loads this file on open and shows "cérebro: geração N" (brain: generation N).

### How training works

The workflow `.github/workflows/treino.yml` runs every 3 hours and each round lasts about 2h30. In each round:

1. **Generate positions:** Xeque plays against itself with slightly random moves and keeps varied, "quiet" positions (no pending captures).
2. **Label:** Stockfish (depth 10) scores each position.
3. **Tune:** Xeque changes one weight at a time and keeps the change if its evaluation gets closer to Stockfish's score (squared error on win probability). Data is split into training (85%) and validation (15%).
4. **Check:** if the validation error dropped, the new weights play 120 to 200 games against the current ones. They are accepted only if they do not lose (score of at least 50%).
5. **Record:** if accepted, `weights.json` gets a new generation. Every round logs its result in `treino/historico.json`.

First test round result: 13 thousand positions, validation error from 0.00995 to 0.00886, but the new weights scored 44 wins, 27 draws and 49 losses. The safety check rejected them, so Xeque stayed at generation 0.

### Limits

- Only the evaluation weights are trained. The search and the way of evaluating stay the same, so training may plateau.
- The lesson memory does not make Xeque stronger in new positions.
- Elo numbers are rough estimates (few games, fast games, limited-Stockfish scale). They are not official Elo.

### Future projects

Ideas, with no deadline promised:

- Compile Xeque's C++ version to WebAssembly and run it in the browser (stronger than the JavaScript version).
- Train a neural-network evaluation (NNUE style) through self-play.
- Train more parameters (king safety, pawn structure) with more data.
- Share the lesson memory across devices (export/import or store it in the repository).
- An opening book learned from games.
- Move list, PGN export and analysis mode.
- Choose a license for Xeque's code.

### Files

- `index.html`: interface
- `engine.js`: Xeque engine
- `weights.json`: trained weights (current generation)
- `treino/`: training scripts (`gen.js`, `label.js`, `tune.js`, `match.py`, `rodada.js`) and `historico.json`
- `uci.js`: plugs Xeque into UCI GUIs (Arena, Cute Chess, Lichess-bot) with `node uci.js`
- `stockfish/`: Stockfish (third party, GPL v3)
- `THIRD_PARTY_LICENSES.md`: third-party license details

### Credits

- **Xeque:** idea, direction and project by **Davi Ch.** · Discord: **777.imt**
- **Stockfish:** an independent project, used here as a supervisor. It belongs to the Stockfish authors and contributors, under GPL v3. Browser build: Stockfish.js v19.0.1 by Nathan Rugg. Stockfish was not created by Xeque's author.
- **python-chess** (Niklas Fiekas): used in tests and in the training verification games.

