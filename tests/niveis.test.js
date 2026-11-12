const test=require('node:test');
const assert=require('node:assert');
const X=require('../engine.js');
const LV=require('../levels.js');
const OP=require('../aberturas.js');

test('niveis ficam mais fortes a cada degrau',()=>{
  assert.strictEqual(LV.length,9);
  for(let i=1;i<LV.length;i++){
    assert.ok(LV[i].d>=LV[i-1].d);
    assert.ok(LV[i].t<=LV[i-1].t);
    assert.ok(LV[i].p<=LV[i-1].p);
  }
});

test('nivel mais fraco joga lances legais variados',()=>{
  X.setup(X.START,[]);
  const l=LV[0],seen=new Set();
  for(let i=0;i<40;i++){
    const m=X.think(l.ms,l.d,l.t,null,null,l.p);
    assert.ok(X.legal().indexOf(m)>=0);
    seen.add(m);
  }
  assert.ok(seen.size>4);
});

test('nivel mais fraco erra bem mais que o forte numa posicao tatica',()=>{
  const fen='r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4';
  const hit=l=>{
    let n=0;
    for(let i=0;i<30;i++){X.setup(fen,[]);if(X.uci(X.think(l.ms,l.d,l.t,null,null,l.p))=='h5f7')n++;}
    return n;
  };
  assert.ok(hit(LV[7])>=28);
  assert.ok(hit(LV[0])<hit(LV[7]));
});

test('todas as aberturas do livro sao legais',()=>{
  for(const o of OP){
    X.setup(X.START,[]);
    for(const u of o.m){
      const m=X.parse(u);
      assert.ok(m,o.n+' '+u);
      X.make(m);
    }
  }
});
