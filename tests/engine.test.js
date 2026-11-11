const test=require('node:test');
const assert=require('node:assert');
const X=require('../engine.js');

test('acha mate em 1',()=>{
  X.reset();
  X.setup('6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',[]);
  assert.strictEqual(X.uci(X.think(500,6,0)),'a1a8');
});

test('mate do pastor invertido e detectado',()=>{
  X.setup(X.START,['f2f3','e7e5','g2g4','d8h4']);
  assert.strictEqual(X.status(),'mate');
});

test('afogamento',()=>{
  X.setup('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1',[]);
  assert.strictEqual(X.status(),'stalemate');
});

test('material insuficiente',()=>{
  X.setup('8/8/4k3/8/8/3NK3/8/8 w - - 0 1',[]);
  assert.strictEqual(X.status(),'material');
});

test('profundidade limitada e aleatoriedade devolvem lance legal',()=>{
  X.reset();
  X.setup(X.START,[]);
  const m=X.think(200,2,150);
  assert.ok(X.legal().indexOf(m)>=0);
});

test('pesos podem ser trocados',()=>{
  const w=X.weights();
  X.setWeights({nm:340});
  assert.strictEqual(X.weights().nm,340);
  X.setWeights(w);
});
