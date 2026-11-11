const test=require('node:test');
const assert=require('node:assert');
const X=require('../engine.js');
const U=require('../chess-util.js');

test('san basico e roque',()=>{
  X.setup(X.START,['e2e4','e7e5','g1f3','b8c6','f1c4','g8f6']);
  const m=X.parse('e1g1');
  assert.strictEqual(U.san(X,m),'O-O');
  assert.strictEqual(U.san(X,X.parse('f3e5')),'Nxe5');
});

test('fen valida e invalida',()=>{
  assert.strictEqual(U.validFen(X,X.START),X.START);
  assert.strictEqual(U.validFen(X,'8/8/8/8/8/8/8/8 w - - 0 1'),null);
  assert.strictEqual(U.validFen(X,'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBN w KQkq - 0 1'),null);
  assert.strictEqual(U.validFen(X,'4k3/8/8/8/8/8/4r3/4K3 b - - 0 1'),null);
  assert.strictEqual(U.validFen(X,'P3k3/8/8/8/8/8/8/4K3 w - - 0 1'),null);
  assert.ok(U.validFen(X,'8/8/8/4k3/8/8/3QK3/8 w - - 0 1'));
});

test('pgn exporta e importa a mesma partida',()=>{
  const m=['e2e4','e7e5','g1f3','b8c6','f1b5','a7a6','b5a4','g8f6','e1g1'];
  const t=U.pgnOf(X,{m,r:'*',w:['h','x']});
  assert.match(t,/1\. e4 e5 2\. Nf3 Nc6 3\. Bb5 a6 4\. Ba4 Nf6 5\. O-O/);
  const g=U.parsePgn(X,t);
  assert.deepStrictEqual(g.m,m);
  assert.strictEqual(g.b,X.START);
});

test('pgn com fen e promocao',()=>{
  const b='8/P3k3/8/8/8/8/8/4K3 w - - 0 1';
  const t=U.pgnOf(X,{m:['a7a8q'],b,r:'*'});
  assert.match(t,/\[FEN "8\/P3k3/);
  assert.match(t,/a8=Q/);
  const g=U.parsePgn(X,t);
  assert.deepStrictEqual(g.m,['a7a8q']);
});

test('pgn ignora comentarios e variantes',()=>{
  const g=U.parsePgn(X,'[Event "x"]\n\n1. e4 {bom} e5 (1... c5) 2. Nf3 $1 Nc6 1-0');
  assert.deepStrictEqual(g.m,['e2e4','e7e5','g1f3','b8c6']);
});
