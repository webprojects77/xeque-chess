const X=require('../engine.js');
const U=require('../chess-util.js');
const cp=require('child_process');
const fs=require('fs');
const SFP=process.env.STOCKFISH||'/usr/games/stockfish';
const LIM={m1:20,m2:20,m3:12,tat:20,err:20};
const T0=Date.now(),MAXMS=(+process.argv[2]||8)*60000;
const out=[],seen=new Set(),cnt={m1:0,m2:0,m3:0,tat:0,err:0};
const full=()=>Object.keys(LIM).every(k=>cnt[k]>=LIM[k]);
const sf=cp.spawn(SFP);
let buf='',wait=null;
sf.stdout.on('data',d=>{buf+=d;let i;while((i=buf.indexOf('\n'))>=0){const l=buf.slice(0,i).trim();buf=buf.slice(i+1);if(wait)wait(l);}});
const send=s=>sf.stdin.write(s+'\n');
function analyse(fen,depth,mpv){
  return new Promise(res=>{
    const best={};
    wait=l=>{
      if(l.startsWith('info')&&l.includes(' pv ')&&l.includes(' multipv ')&&!l.includes('bound')){
        const k=+/multipv (\d+)/.exec(l)[1],c=/score (cp|mate) (-?\d+)/.exec(l),mv=/ pv (\S+)/.exec(l)[1];
        if(c)best[k]={m:mv,v:c[1]=='mate'?(+c[2]>0?1:-1)*(10000-Math.abs(+c[2])):+c[2]};
      }else if(l.startsWith('bestmove')){wait=null;res(Object.keys(best).sort((a,b)=>a-b).map(k=>best[k]));}
    };
    send('setoption name MultiPV value '+mpv);
    send('position fen '+fen);
    send('go depth '+depth);
  });
}
const key=f=>f.split(' ')[0];
function add(p){
  if(cnt[p.c]>=LIM[p.c]||seen.has(key(p.f)))return false;
  seen.add(key(p.f));cnt[p.c]++;p.id=p.c+cnt[p.c];out.push(p);
  console.log(p.id,Math.round((Date.now()-T0)/1000)+'s');
  return true;
}
function game(){
  X.reset();X.setup(X.START,[]);
  const strong=Math.random()<.5?0:1,rec=[];
  for(let ply=0;ply<170;ply++){
    if(X.status())break;
    const side=X.side(),fen=X.fen();
    let m;
    if(ply<6){const l=X.legal();m=l[Math.floor(Math.random()*l.length)];}
    else if(side==strong)m=X.think(50,4,0);
    else m=X.think(30,2,120);
    rec.push({fen,side,u:X.uci(m),weak:side!=strong});
    X.make(m);
  }
  return{rec,end:X.status()};
}
function mateCands(g){
  const n=g.rec.length;
  if(g.end!='mate')return;
  for(const i of [n-1,n-3,n-5]){
    if(i<0||cnt.m1>=LIM.m1&&cnt.m2>=LIM.m2&&cnt.m3>=LIM.m3)continue;
    const f=g.rec[i].fen;
    X.setup(f,[]);
    let k=1,ms=U.mates(X,1);
    if(!ms.length){k=2;ms=U.mates(X,2);}
    if(!ms.length&&cnt.m3<LIM.m3){k=3;ms=U.mates(X,3);}
    if(!ms.length||ms.length>3)continue;
    if(k==1&&X.legal().length<3)continue;
    add({c:'m'+k,f,n:k,s:ms.map(X.uci)});
  }
}
async function tactics(g){
  for(let i=8;i<g.rec.length-1;i+=4){
    if(cnt.tat>=LIM.tat&&cnt.err>=LIM.err)return;
    const r=g.rec[i];
    X.setup(r.fen,[]);
    if(X.legal().length<8)continue;
    if(cnt.tat<LIM.tat){
      const a=await analyse(r.fen,12,3);
      if(a.length>1&&a[0].v>=250&&a[0].v<=900&&a[0].v-a[1].v>=200){
        add({c:'tat',f:r.fen,n:1,s:[a[0].m]});
      }
    }
    if(r.weak&&cnt.err<LIM.err){
      const pre=await analyse(r.fen,10,1),post=await analyse(g.rec[i+1].fen,12,3);
      if(pre.length&&post.length>1&&pre[0].v>=-200&&pre[0].v+post[0].v>=300&&post[0].v>=350&&post[0].v<=2000&&post[0].v-post[1].v>=150){
        add({c:'err',f:g.rec[i+1].fen,n:1,s:[post[0].m],l:r.u});
      }
    }
  }
}
(async()=>{
  send('uci');
  await new Promise(r=>{wait=l=>{if(l=='uciok'){wait=null;r();}};});
  let n=0;
  while(!full()&&Date.now()-T0<MAXMS){
    const g=game();n++;
    mateCands(g);
    await tactics(g);
  }
  sf.stdin.end();
  fs.writeFileSync(__dirname+'/../exercicios.json',JSON.stringify({v:1,p:out}));
  console.log('jogos',n,JSON.stringify(cnt));
  process.exit(0);
})();
