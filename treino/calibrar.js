const X=require('../engine.js');
const LV=require('../levels.js');
const cp=require('child_process');
const sf=cp.spawn(process.env.STOCKFISH||'/usr/games/stockfish');
let buf='',wait=null;
sf.stdout.on('data',d=>{buf+=d;let i;while((i=buf.indexOf('\n'))>=0){const l=buf.slice(0,i).trim();buf=buf.slice(i+1);if(wait)wait(l);}});
const send=s=>sf.stdin.write(s+'\n');
const until=f=>new Promise(r=>{wait=l=>{const v=f(l);if(v!==undefined){wait=null;r(v);}};});
async function sfMove(moves,elo){
  send('setoption name UCI_LimitStrength value true');
  send('setoption name UCI_Elo value '+elo);
  send('position startpos'+(moves.length?' moves '+moves.join(' '):''));
  send('go movetime 30');
  return until(l=>l.startsWith('bestmove')?l.split(' ')[1]:undefined);
}
function xMove(lv){return X.uci(X.think(lv.ms,lv.d,lv.t,null,null,lv.p));}
function rMove(){const l=X.legal();return X.uci(l[Math.floor(Math.random()*l.length)]);}
async function game(lv,opp,xs,elo){
  const mv=[];
  for(let i=0;i<200;i++){
    X.setup(X.START,mv);
    const st=X.status();
    if(st){return st=='mate'?(X.side()==xs?0:1):.5;}
    const u=X.side()==xs?xMove(lv):opp=='r'?rMove():await sfMove(mv,elo);
    mv.push(u);
  }
  return .5;
}
(async()=>{
  send('uci');await until(l=>l=='uciok'?1:undefined);
  const N=+process.argv[2]||6,from=+process.argv[3]||0,to=+process.argv[4]||6;
  for(let k=from;k<=to;k++){
    const out={};
    for(const [o,elo] of [['r',0],['s',1320]]){
      let t=0;
      for(let g=0;g<N;g++)t+=await game(LV[k],o,g%2,elo);
      out[o+(o=='s'?elo:'')]=t+'/'+N;
    }
    console.log(k,LV[k].n,JSON.stringify(out));
  }
  process.exit(0);
})();
