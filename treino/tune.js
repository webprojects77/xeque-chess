const fs=require('fs');const X=require('../engine.js');
const dataF=process.argv[2],wIn=process.argv[3],wOut=process.argv[4],secs=+process.argv[5]||60;
const DEF=X.weights();
const base=JSON.parse(fs.readFileSync(wIn)),W=Object.assign({},DEF,base.v);
X.setWeights(W);
const sig=x=>1/(1+Math.exp(-x/400));
let rows=fs.readFileSync(dataF,'utf8').split('\n').filter(Boolean).map(l=>{const i=l.lastIndexOf('|');return{fen:l.slice(0,i),y:sig(+l.slice(i+1)),sg:l.slice(0,i).split(' ')[1]=='b'?-1:1};});
for(let i=rows.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[rows[i],rows[j]]=[rows[j],rows[i]];}
rows=rows.slice(0,80000);
const cut=Math.floor(rows.length*0.85),train=rows.slice(0,cut),val=rows.slice(cut);
function loss(set){
  let s=0;
  for(const d of set){X.load(d.fen);const r=sig(X.evalStatic()*d.sg)-d.y;s+=r*r;}
  return s/set.length;
}
const keys=Object.keys(DEF),st={},lo={},hi={};
for(const k of keys){st[k]=Math.max(Math.abs(DEF[k])*0.04,0.05);lo[k]=DEF[k]*0.5;hi[k]=DEF[k]*2;}
const t0=Date.now(),trainA=loss(train),valA=loss(val);
let best=trainA,rounds=0;
while(Date.now()-t0<secs*1000){
  let improved=false;
  for(const k of keys){
    if(Date.now()-t0>=secs*1000)break;
    for(const dir of [1,-1]){
      const old=W[k],nv=Math.max(lo[k],Math.min(hi[k],old+dir*st[k]));
      if(nv==old)continue;
      W[k]=nv;X.setWeights({[k]:nv});
      const l=loss(train);
      if(l<best-1e-9){best=l;improved=true;break;}
      W[k]=old;X.setWeights({[k]:old});
    }
  }
  rounds++;
  if(!improved)for(const k of keys)st[k]/=2;
}
const out={gen:base.gen||0,v:W};
fs.writeFileSync(wOut,JSON.stringify(out));
console.log(JSON.stringify({n:rows.length,trainAntes:trainA,trainDepois:loss(train),valAntes:valA,valDepois:loss(val),rodadas:rounds}));
