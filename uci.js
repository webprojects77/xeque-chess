const X=require('./engine.js');
const fs=require('fs');
const rl=require('readline').createInterface({input:process.stdin});
let fen=X.START,mv=[];
rl.on('line',l=>{
  const t=l.trim().split(/\s+/),g=k=>{const i=t.indexOf(k);return i<0?null:+t[i+1];};
  if(t[0]=='uci')console.log('id name Xeque JS\nid author Davi Ch.\noption name Weights type string default <empty>\nuciok');
  else if(t[0]=='setoption'&&t[2]=='Weights'){const p=t.slice(4).join(' ');if(p&&p!='<empty>')X.setWeights(JSON.parse(fs.readFileSync(p,'utf8')).v);}
  else if(t[0]=='isready')console.log('readyok');
  else if(t[0]=='ucinewgame')X.reset();
  else if(t[0]=='position'){
    fen=X.START;mv=[];
    const j=t.indexOf('moves');
    if(t[1]=='fen')fen=t.slice(2,j<0?t.length:j).join(' ');
    if(j>=0)mv=t.slice(j+1);
  }
  else if(t[0]=='go'){
    X.setup(fen,mv);
    let ms=1000,d=64;
    if(g('movetime')!=null)ms=g('movetime');
    else if(g('wtime')!=null){const w=X.side()==0;ms=Math.max(20,(w?g('wtime'):g('btime'))/30+((w?g('winc'):g('binc'))||0)/2);}
    if(g('depth')!=null){d=g('depth');ms=1e9;}
    console.log('bestmove '+X.uci(X.think(ms,d,0)));
  }
  else if(t[0]=='quit')process.exit(0);
});
