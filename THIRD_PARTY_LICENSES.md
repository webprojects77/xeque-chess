# Componentes de terceiros

## Stockfish (via Stockfish.js)

- Arquivos: `stockfish/stockfish-19-lite-single.js`, `stockfish/stockfish-19-lite-single.wasm`
- Licença: GNU General Public License v3 (texto integral em `stockfish/Copying.txt`)
- Versão: Stockfish.js v19.0.1, build `stockfish-19-lite-single` (uma thread, rede neural NNUE embutida no `.wasm`)
- Origem dos arquivos: pacote oficial `stockfish` 19.0.1 do npm, mantido por Nathan Rugg
- Código-fonte correspondente: https://github.com/nmrugg/stockfish.js (release v19.0.1) e https://github.com/official-stockfish/Stockfish
- Autores: Tord Romstad, Marco Costalba, Joona Kiiski, Gary Linscott e os demais colaboradores do Stockfish; port para WebAssembly por Nathan Rugg
- Os arquivos não foram modificados.

O Stockfish é um projeto independente, usado aqui como componente auxiliar. O motor Xeque (`engine.js`) é próprio e não deriva do Stockfish.
