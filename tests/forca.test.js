const test=require('node:test');
const assert=require('node:assert');
const X=require('../engine.js');
const LV=require('../levels.js');

function jogo(fo,fr,forteBrancas){
  const mv=[];
  for(let i=0;i<240;i++){
    X.setup(X.START,mv);
    const st=X.status();
    if(st)return st=='mate'?((i%2==0)==forteBrancas?0:1):.5;
    const forte=(i%2==0)==forteBrancas,l=forte?fo:fr;
    mv.push(X.uci(X.think(l.ms,l.d,l.t,null,null,l.p)));
  }
  return .5;
}

test('nivel Difícil iniciante vence o Principiante na maioria das partidas',{timeout:180000},()=>{
  let s=0;
  for(let g=0;g<4;g++)s+=jogo(LV[5],LV[0],g%2==0);
  assert.ok(s>=3,'placar '+s+'/4');
});
