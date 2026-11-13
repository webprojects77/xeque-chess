const {spawn,execFileSync}=require('child_process');const fs=require('fs');const os=require('os');
const R=__dirname+'/..',T=__dirname;
const M=+process.argv[2]||40,mini=process.env.TREINO_TESTE=='1';
const POS=mini?400:Math.round(M*700),GAMES=Math.max(4,Math.ceil(POS/20)),SECS=mini?20:Math.round(M*60*0.25);
const MATCH=mini?6:(M>=100?200:120),MT=mini?0.05:0.06,DEPTH=mini?6:10;
const cpus=Math.max(1,Math.min(4,os.cpus().length));
const tmp=fs.mkdtempSync(os.tmpdir()+'/treino-');
const cur=JSON.parse(fs.readFileSync(R+'/weights.json'));
const log=(...a)=>console.log(new Date().toISOString().slice(11,19),...a);
async function main(){
  log('gerando posicoes: ',GAMES,'partidas');
  await Promise.all(Array.from({length:cpus},(_,i)=>new Promise((res,rej)=>{
    const f=fs.openSync(tmp+'/gen'+i+'.txt','w');
    const p=spawn('node',[T+'/gen.js',String(Math.ceil(GAMES/cpus))],{stdio:['ignore',f,'inherit']});
    p.on('exit',c=>c?rej(new Error('gen')):res());
  })));
  const fens=[...new Set(Array.from({length:cpus},(_,i)=>fs.readFileSync(tmp+'/gen'+i+'.txt','utf8')).join('\n').split('\n').filter(Boolean))];
  log('posicoes unicas:',fens.length,'| rotulando com Stockfish (profundidade',DEPTH+')');
  const lab=execFileSync('node',[T+'/label.js',String(DEPTH),String(cpus)],{input:fens.join('\n'),maxBuffer:1<<30,encoding:'utf8'});
  fs.writeFileSync(tmp+'/rot.txt',lab);
  log('ajustando pesos por',SECS,'s');
  const tu=JSON.parse(execFileSync('node',[T+'/tune.js',tmp+'/rot.txt',R+'/weights.json',tmp+'/novo.json',String(SECS)],{encoding:'utf8'}).trim().split('\n').pop());
  log('erro de validacao',tu.valAntes.toFixed(5),'->',tu.valDepois.toFixed(5));
  let m={v:0,e:0,d:0,score:0.5},aceito=false,escolhido=null;
  const defs=Object.assign({},require(R+'/engine.js').weights(),cur.v);
  const novo=JSON.parse(fs.readFileSync(tmp+'/novo.json'));
  const mix=(t)=>{const o={};for(const k in novo.v)o[k]=+(defs[k]+(novo.v[k]-defs[k])*t).toFixed(3);return o;};
  const jogar=(f,n)=>JSON.parse(execFileSync('python3',[T+'/match.py',R+'/weights.json',f,String(n),String(MT)],{encoding:'utf8'}).trim().split('\n').pop());
  if(tu.valDepois<tu.valAntes*0.998){
    const metade=Math.max(2,Math.ceil(MATCH/2));
    const cands=[1,0.5].map(t=>{const f=tmp+'/c'+t+'.json';fs.writeFileSync(f,JSON.stringify({gen:cur.gen||0,v:mix(t)}));log('candidato',t,': jogando',metade,'partidas');return{t,f,m:jogar(f,metade)};});
    cands.sort((x,y)=>y.m.score-x.m.score);
    const c=cands[0];
    log('melhor candidato:',c.t,'com',c.m.score.toFixed(3),'| confirmando com',MATCH,'partidas');
    const k=jogar(c.f,MATCH);
    m={v:c.m.v+k.v,e:c.m.e+k.e,d:c.m.d+k.d,score:(c.m.score*metade+k.score*MATCH)/(metade+MATCH),alfa:c.t};
    log('placar dos novos:',m.v,'V',m.e,'E',m.d,'D');
    aceito=m.score>=0.52;
    escolhido=c.f;
  }else log('sem melhora na validacao, descartado');
  const gen=(cur.gen||0)+(aceito?1:0);
  if(aceito){const n=JSON.parse(fs.readFileSync(escolhido));fs.writeFileSync(R+'/weights.json',JSON.stringify({gen,v:n.v}));}
  const hf=T+'/historico.json';
  const h=fs.existsSync(hf)?JSON.parse(fs.readFileSync(hf)):[];
  h.push({quando:new Date().toISOString(),geracao:gen,posicoes:tu.n,erroAntes:+tu.valAntes.toFixed(5),erroDepois:+tu.valDepois.toFixed(5),partidas:m,aceito});
  fs.writeFileSync(hf,JSON.stringify(h.slice(-300),null,1));
  log(aceito?'ACEITO: geracao '+gen:'rejeitado: continua na geracao '+gen);
}
main().catch(e=>{console.error('falhou:',e.message);process.exit(1);});
