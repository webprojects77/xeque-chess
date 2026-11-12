(function(G){
const sqn=s=>'abcdefgh'[s&7]+((s>>4)+1);
const NM={h:'Jogador',x:'Xeque',s:'Stockfish'};

function san(X,m){
  const f=m&127,t=m>>7&127,fl=m>>14&7,pr=m>>17&7,ty=X.at(f&7,f>>4)&7;
  let s='';
  if(fl==2)s=t>f?'O-O':'O-O-O';
  else{
    const cap=X.at(t&7,t>>4)||fl==1;
    if(ty==1){if(cap)s+='abcdefgh'[f&7];}
    else{
      s+='??NBRQK'[ty];
      const amb=X.legal().filter(o=>o!=m&&(o>>7&127)==t&&(X.at((o&127)&7,(o&127)>>4)&7)==ty);
      if(amb.length){
        const sameF=amb.some(o=>(o&7)==(f&7)),sameR=amb.some(o=>((o&127)>>4)==(f>>4));
        s+=!sameF?'abcdefgh'[f&7]:!sameR?String((f>>4)+1):'abcdefgh'[f&7]+((f>>4)+1);
      }
    }
    if(cap)s+='x';
    s+=sqn(t);
    if(pr)s+='='+'??NBRQ'[pr];
  }
  X.make(m);const ck=X.inCheck(),n=X.legal().length;X.unmake();
  return s+(ck?(n?'+':'#'):'');
}

function validFen(X,f){
  const t=String(f||'').trim().replace(/\s+/g,' ').split(' ');
  if(t.length<2||!/^[pnbrqkPNBRQK1-8\/]+$/.test(t[0]))return null;
  const rows=t[0].split('/');
  if(rows.length!=8)return null;
  for(const r of rows){let c=0;for(const ch of r)c+=/\d/.test(ch)?+ch:1;if(c!=8)return null;}
  if(/[pP]/.test(rows[0]+rows[7]))return null;
  if((t[0].match(/K/g)||[]).length!=1||(t[0].match(/k/g)||[]).length!=1)return null;
  if(t[1]!='w'&&t[1]!='b')return null;
  const g=[t[0],t[1],t[2]||'-',t[3]||'-',t[4]||'0',t[5]||'1'].join(' ');
  const o=g.split(' ');o[1]=o[1]=='w'?'b':'w';o[3]='-';
  X.setup(o.join(' '),[]);
  if(X.inCheck())return null;
  X.setup(g,[]);
  if(!X.legal().length)return null;
  return g;
}

function parsePgn(X,txt){
  const fm=/\[FEN\s+"([^"]+)"\]/.exec(txt);
  const b=fm?validFen(X,fm[1]):X.START;
  if(!b)return null;
  const body=txt.replace(/\[[^\]]*\]/g,' ').replace(/\{[^}]*\}/g,' ').replace(/;[^\n]*/g,' ').replace(/\([^)]*\)/g,' ').replace(/\$\d+/g,' ').replace(/\d+\.(\.\.)?/g,' ');
  const tk=body.split(/\s+/).filter(x=>x&&!/^(1-0|0-1|1\/2-1\/2|\*)$/.test(x));
  X.setup(b,[]);
  const m=[];
  for(const raw of tk){
    const s=raw.replace(/[+#!?]/g,'').replace(/0/g,'O');
    const f=X.legal().find(x=>san(X,x).replace(/[+#]/g,'')==s);
    if(!f)break;
    m.push(X.uci(f));X.make(f);
  }
  return m.length?{b,m}:null;
}

function pgnOf(X,h){
  const b=h.b||X.START;
  X.setup(b,[]);
  const mv=[];let n=+(b.split(' ')[5])||1;
  for(const u of h.m){
    const mm=X.parse(u);if(!mm)break;
    const s0=X.side(),s=san(X,mm);
    mv.push(s0==0?n+'. '+s:(mv.length?'':n+'... ')+s);
    if(s0==1)n++;
    X.make(mm);
  }
  const R=h.r||'*',w=h.w||['h','x'],d=new Date(h.t||Date.now()).toISOString().slice(0,10).replace(/-/g,'.');
  const tags=['[Event "Xeque Chess"]','[Site "https://webprojects77.github.io/xeque-chess/"]','[Date "'+d+'"]','[White "'+NM[w[0]]+'"]','[Black "'+NM[w[1]]+'"]','[Result "'+R+'"]'];
  if(b!=X.START)tags.push('[SetUp "1"]','[FEN "'+b+'"]');
  return tags.join('\n')+'\n\n'+mv.join(' ')+(mv.length?' ':'')+R+'\n';
}


function canMate(X,n){
  for(const m of X.legal()){
    X.make(m);
    const r=X.legal();
    let ok=false;
    if(!r.length)ok=X.inCheck();
    else if(n>1){ok=true;for(const q of r){X.make(q);const c=canMate(X,n-1);X.unmake();if(!c){ok=false;break;}}}
    X.unmake();
    if(ok)return true;
  }
  return false;
}

function mates(X,n){
  const out=[];
  for(const m of X.legal()){
    X.make(m);
    const r=X.legal();
    let ok=false;
    if(!r.length)ok=X.inCheck();
    else if(n>1){ok=true;for(const q of r){X.make(q);const c=canMate(X,n-1);X.unmake();if(!c){ok=false;break;}}}
    X.unmake();
    if(ok)out.push(m);
  }
  return out;
}

function defense(X,k){
  let best=0,bl=-1;
  for(const q of X.legal()){
    X.make(q);
    let l=1;
    while(l<k&&!canMate(X,l))l++;
    X.unmake();
    if(l>bl||(l==bl&&Math.random()<.5)){bl=l;best=q;}
  }
  return best;
}

G.XUtil={sqn,san,validFen,parsePgn,pgnOf,canMate,mates,defense};
if(typeof module!=='undefined')module.exports=G.XUtil;
})(globalThis);
