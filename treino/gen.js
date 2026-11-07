const X=require('../engine.js');
const n=+process.argv[2]||50;
let buf=[];
const flush=()=>{if(buf.length){process.stdout.write(buf.join('\n')+'\n');buf=[];}};
for(let g=0;g<n;g++){
  X.setup(X.START,[]);
  for(let i=0;i<8;i++){const l=X.legal();if(!l.length)break;X.make(l[Math.floor(Math.random()*l.length)]);}
  for(let ply=8;ply<180;ply++){
    if(X.status())break;
    const m=X.think(1e9,2,100,null);
    if(!m)break;
    X.make(m);
    if(ply>=10&&Math.random()<0.4&&!X.inCheck()){
      const e=X.evalStatic(),q=X.qscore();
      if(Math.abs(q-e)<=30)buf.push(X.fen());
    }
  }
  if(g%10==9)flush();
}
flush();
