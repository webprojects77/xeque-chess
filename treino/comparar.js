const cp=require('child_process');
const fs=require('fs');
const os=require('os');
const path=require('path');
const root=path.join(__dirname,'..');
const ref=process.argv[2]||'HEAD~5',N=+process.argv[3]||10,MS=+process.argv[4]||100;
function load(r){
  let X,w;
  if(r=='atual'){X=require(path.join(root,'engine.js'));w=JSON.parse(fs.readFileSync(path.join(root,'weights.json'),'utf8'));}
  else{
    const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'xq-'));
    fs.writeFileSync(path.join(tmp,'engine.js'),cp.execSync('git show '+r+':engine.js',{cwd:root}));
    X=require(path.join(tmp,'engine.js'));
    try{w=JSON.parse(cp.execSync('git show '+r+':weights.json',{cwd:root}));}catch(e){w=null;}
  }
  if(w&&w.v)X.setWeights(w.v);
  return X;
}
const A=load('atual'),B=load(ref);
function game(a,b,aw){
  const mv=[];
  for(let i=0;i<300;i++){
    const mine=(i%2==0)==aw,X=mine?a:b;
    A.setup(A.START,mv);B.setup(B.START,mv);
    const st=A.status();
    if(st){if(st!='mate')return .5;return (i%2==0)==aw?0:1;}
    mv.push(X.uci(X.think(MS,64,0)));
  }
  return .5;
}
let s=0,w=0,d=0,l=0;
for(let g=0;g<N;g++){
  const r=game(A,B,g%2==0);
  s+=r;if(r==1)w++;else if(r==0)l++;else d++;
  console.log('jogo',g+1,r==1?'vitoria':r==0?'derrota':'empate');
}
console.log('atual contra '+ref+': '+w+'V '+d+'E '+l+'D, '+Math.round(s/N*100)+'% de aproveitamento');
