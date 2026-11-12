(function(G){
const P=1,N=2,B=3,R=4,Q=5,K=6,INF=30000,MATE=29000,START='rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const DN=[33,31,18,14,-33,-31,-18,-14],DK=[16,-16,1,-1,17,15,-17,-15],DB=[17,15,-17,-15],DR=[16,-16,1,-1];
const VAL=[0,100,320,330,500,900,0],PH=[0,0,1,1,2,4,0];
const b=new Int8Array(128),CM=new Int8Array(128).fill(15);
CM[0]=13;CM[7]=14;CM[4]=12;CM[112]=7;CM[119]=11;CM[116]=3;
const L=2080,Z=new Int32Array(2*L);
(function(){let s=0x9E3779B9|0;for(let i=0;i<Z.length;i++){s^=s<<13;s^=s>>>17;s^=s<<5;Z[i]=s;}})();
let side=0,castle=0,ep=-1,half=0,n=0,hash=0,hash2=0,nodes=0,stop=false,tEnd=0,rootBest=0,rootEx=[];
const kg=[0,0];
const sM=new Int32Array(4096),sC=new Int8Array(4096),sCa=new Int8Array(4096),sE=new Int16Array(4096),sH=new Int16Array(4096),sK=new Int32Array(4096),sK2=new Int32Array(4096);
const MV=new Int32Array(130*256),SC=new Int32Array(130*256),K1=new Int32Array(130),K2=new Int32Array(130),Hs=new Int32Array(32768);
const TN=1<<20,tA=new Int32Array(TN),tM=new Int32Array(TN),tS=new Int16Array(TN),tD=new Int8Array(TN),tF=new Int8Array(TN);
const X=i=>{hash^=Z[i];hash2^=Z[i+L];};

function load(fen){
  b.fill(0);const t=fen.split(' ');let r=7,f=0;
  for(const ch of t[0]){
    if(ch=='/'){r--;f=0;}
    else if(ch>='1'&&ch<='8')f+=+ch;
    else{const lo=ch==ch.toLowerCase(),i='pnbrqk'.indexOf(ch.toLowerCase());b[r*16+f]=(i+1)|(lo?8:0);if(i==5)kg[lo?1:0]=r*16+f;f++;}
  }
  side=t[1]=='b'?1:0;castle=0;
  for(const ch of t[2]||'')castle|={K:1,Q:2,k:4,q:8}[ch]||0;
  ep=-1;if(t[3]&&t[3]!='-')ep=(t[3].charCodeAt(1)-49)*16+t[3].charCodeAt(0)-97;
  half=+t[4]||0;n=0;hash=hash2=0;
  for(let s=0;s<128;s++)if(!(s&136)&&b[s])X(b[s]<<7|s);
  X(2048+castle);if(ep>=0)X(2064+(ep&7));if(side)X(2072);
}

function attacked(sq,by){
  const c=by<<3,pd=by?15:-15,e=by?2:-2;
  let t=sq+pd;if(!(t&136)&&b[t]==(P|c))return true;
  t+=e;if(!(t&136)&&b[t]==(P|c))return true;
  for(let i=0;i<8;i++){
    t=sq+DN[i];if(!(t&136)&&b[t]==(N|c))return true;
    t=sq+DK[i];if(!(t&136)&&b[t]==(K|c))return true;
  }
  for(let i=0;i<4;i++){
    let d=DB[i];t=sq+d;
    while(!(t&136)){const p=b[t];if(p){if(p==(B|c)||p==(Q|c))return true;break;}t+=d;}
    d=DR[i];t=sq+d;
    while(!(t&136)){const p=b[t];if(p){if(p==(R|c)||p==(Q|c))return true;break;}t+=d;}
  }
  return false;
}

function gen(o,caps){
  let k=o;const s=side,d=s?-16:16,sr=s?6:1,pr=s?1:6;
  for(let sq=0;sq<128;sq++){
    if(sq&136){sq+=7;continue;}
    const p=b[sq];if(!p||(p>>3)!=s)continue;
    const ty=p&7;
    if(ty==P){
      const r=sq>>4;let t=sq+d;
      if(!b[t]){
        if(r==pr){MV[k++]=sq|t<<7|5<<17;if(!caps){MV[k++]=sq|t<<7|4<<17;MV[k++]=sq|t<<7|3<<17;MV[k++]=sq|t<<7|2<<17;}}
        else if(!caps){MV[k++]=sq|t<<7;if(r==sr&&!b[t+d])MV[k++]=sq|(t+d)<<7|3<<14;}
      }
      for(let e=-1;e<=1;e+=2){
        t=sq+d+e;if(t&136)continue;
        const c=b[t];
        if(c?(c>>3)!=s:t==ep){
          if(r==pr){MV[k++]=sq|t<<7|5<<17;if(!caps){MV[k++]=sq|t<<7|4<<17;MV[k++]=sq|t<<7|3<<17;MV[k++]=sq|t<<7|2<<17;}}
          else MV[k++]=sq|t<<7|(c?0:1<<14);
        }
      }
    }else{
      const ds=ty==N?DN:ty==B?DB:ty==R?DR:DK,sl=ty>=B&&ty<=Q,m=ds.length;
      for(let i=0;i<m;i++){
        const dd=ds[i];let t=sq+dd;
        while(!(t&136)){
          const c=b[t];
          if(c){if((c>>3)!=s)MV[k++]=sq|t<<7;break;}
          if(!caps)MV[k++]=sq|t<<7;
          if(!sl)break;
          t+=dd;
        }
      }
    }
  }
  if(!caps){
    if(!s){
      if((castle&1)&&!b[5]&&!b[6]&&!attacked(4,1)&&!attacked(5,1)&&!attacked(6,1))MV[k++]=4|6<<7|2<<14;
      if((castle&2)&&!b[1]&&!b[2]&&!b[3]&&!attacked(4,1)&&!attacked(3,1)&&!attacked(2,1))MV[k++]=4|2<<7|2<<14;
    }else{
      if((castle&4)&&!b[117]&&!b[118]&&!attacked(116,0)&&!attacked(117,0)&&!attacked(118,0))MV[k++]=116|118<<7|2<<14;
      if((castle&8)&&!b[113]&&!b[114]&&!b[115]&&!attacked(116,0)&&!attacked(115,0)&&!attacked(114,0))MV[k++]=116|114<<7|2<<14;
    }
  }
  return k;
}

function make(m){
  const f=m&127,t=m>>7&127,fl=m>>14&7,pr=m>>17&7,p=b[f],c=b[t],s=side;
  sM[n]=m;sC[n]=c;sCa[n]=castle;sE[n]=ep;sH[n]=half;sK[n]=hash;sK2[n]=hash2;n++;
  if(ep>=0)X(2064+(ep&7));
  ep=-1;half++;
  if((p&7)==P)half=0;
  if(c){half=0;X(c<<7|t);}
  X(p<<7|f);b[f]=0;
  const np=pr?(pr|s<<3):p;
  b[t]=np;X(np<<7|t);
  if(fl==1){const q=t+(s?16:-16);X(b[q]<<7|q);b[q]=0;half=0;}
  else if(fl==2){const rf=t>f?t+1:t-2,rt=t>f?t-1:t+1,r=R|s<<3;b[rf]=0;b[rt]=r;X(r<<7|rf);X(r<<7|rt);}
  else if(fl==3){ep=(f+t)>>1;X(2064+(ep&7));}
  X(2048+castle);castle&=CM[f]&CM[t];X(2048+castle);
  if((p&7)==K)kg[s]=t;
  side^=1;X(2072);
}

function unmake(){
  n--;const m=sM[n],f=m&127,t=m>>7&127,fl=m>>14&7,pr=m>>17&7;
  side^=1;const s=side;let p=b[t];
  if(pr)p=P|s<<3;
  b[f]=p;b[t]=sC[n];
  if(fl==1)b[t+(s?16:-16)]=P|(s^1)<<3;
  else if(fl==2){const rf=t>f?t+1:t-2,rt=t>f?t-1:t+1;b[rf]=b[rt];b[rt]=0;}
  if((p&7)==K)kg[s]=f;
  castle=sCa[n];ep=sE[n];half=sH[n];hash=sK[n];hash2=sK2[n];
}

function nullMake(){sM[n]=0;sC[n]=0;sCa[n]=castle;sE[n]=ep;sH[n]=half;sK[n]=hash;sK2[n]=hash2;n++;if(ep>=0)X(2064+(ep&7));ep=-1;half++;side^=1;X(2072);}
function nullUnmake(){n--;side^=1;castle=sCa[n];ep=sE[n];half=sH[n];hash=sK[n];hash2=sK2[n];}
function rep(){for(let i=n-2;i>=0&&i>=n-half;i-=2)if(sK[i]==hash)return true;return false;}
function inCheck(){return attacked(kg[side],side^1);}
function np(s){for(let q=0;q<128;q++){if(q&136){q+=7;continue;}const p=b[q];if(p&&(p>>3)==s&&(p&7)>1&&(p&7)<6)return true;}return false;}

const V={nm:337,ne:281,bm:365,be:297,rm:477,re:512,qm:1025,qe:936,pM:1,pE:1,pC:3,nS:14,nSe:14,bS:6,bSe:5,r7:18,r7e:25,rF:2,qS:3,qSe:5,kR:18,kF:12,kE:12,mnm:4,mne:4,mbm:3,mbe:4,mrm:2,mre:3,mqm:1,mqe:2,bpm:28,bpe:45,rom:8,roe:5,dbm:10,dbe:18,ism:9,ise:14,psm:0.5,pse:1.5,shl:9,tmp:8};
const PM=new Int16Array(16*128),PE=new Int16Array(16*128);
let mnm,mne,mbm,mbe,mrm,mre,mqm,mqe,bpm,bpe,rom,roe,dbm,dbe,ism,ise,psm,pse,shl,tmp;
function build(){
  const vm=[0,82,V.nm,V.bm,V.rm,V.qm,0],ve=[0,94,V.ne,V.be,V.re,V.qe,0];
  for(let c=0;c<2;c++)for(let ty=1;ty<=6;ty++)for(let sq=0;sq<128;sq++){
    if(sq&136)continue;
    const f=sq&7,r=sq>>4,rr=c?7-r:r,cf=3.5-Math.abs(f-3.5),d=Math.max(Math.abs(f-3.5),Math.abs(r-3.5));
    let m=vm[ty],e=ve[ty];
    if(ty==1){m+=[0,0,2,6,14,28,50,0][rr]*V.pM+(rr>1&&rr<5?cf*V.pC:0);e+=[0,0,8,16,30,55,90,0][rr]*V.pE;}
    else if(ty==2){m+=36-V.nS*d;e+=36-V.nSe*d;}
    else if(ty==3){m+=22-V.bS*d;e+=18-V.bSe*d;}
    else if(ty==4){m+=(rr==6?V.r7:0)+cf*V.rF;e+=rr==6?V.r7e:0;}
    else if(ty==5){m+=12-V.qS*d;e+=20-V.qSe*d;}
    else{m+=-V.kR*rr+V.kF*Math.abs(f-3.5)-30;e+=2-V.kE*d;}
    PM[(ty|c<<3)<<7|sq]=Math.round(m);PE[(ty|c<<3)<<7|sq]=Math.round(e);
  }
  mnm=V.mnm;mne=V.mne;mbm=V.mbm;mbe=V.mbe;mrm=V.mrm;mre=V.mre;mqm=V.mqm;mqe=V.mqe;
  bpm=V.bpm;bpe=V.bpe;rom=V.rom;roe=V.roe;dbm=V.dbm;dbe=V.dbe;ism=V.ism;ise=V.ise;psm=V.psm;pse=V.pse;shl=V.shl;tmp=V.tmp;
}
build();

const PC=[new Int8Array(8),new Int8Array(8)],WX=new Int8Array(8),WN=new Int8Array(8),BX=new Int8Array(8),BN=new Int8Array(8);
const PASS=[0,5,10,20,35,60,100,0];
function evalPos(){
  const m=[0,0],e=[0,0],bp=[0,0],rk=[[],[]];
  let ph=0,pawns=0,minors=0,majors=0;
  PC[0].fill(0);PC[1].fill(0);WX.fill(-1);WN.fill(8);BX.fill(-1);BN.fill(8);
  for(let sq=0;sq<128;sq++){
    if(sq&136){sq+=7;continue;}
    const p=b[sq];if(!p)continue;
    const c=p>>3,ty=p&7,f=sq&7,r=sq>>4;
    m[c]+=PM[p<<7|sq];e[c]+=PE[p<<7|sq];ph+=PH[ty];
    if(ty==P){
      pawns++;PC[c][f]++;
      if(c){if(r>BX[f])BX[f]=r;if(r<BN[f])BN[f]=r;}else{if(r>WX[f])WX[f]=r;if(r<WN[f])WN[f]=r;}
    }else if(ty<K){
      if(ty<R)minors++;else majors++;
      if(ty==B)bp[c]++;
      if(ty==R)rk[c].push(f);
      const ds=ty==N?DN:ty==B?DB:ty==R?DR:DK,sl=ty>=B;
      let mob=0;
      for(let i=0;i<ds.length;i++){
        let t=sq+ds[i];
        while(!(t&136)){const x=b[t];if(x){if((x>>3)!=c)mob++;break;}mob++;if(!sl)break;t+=ds[i];}
      }
      if(ty==N){m[c]+=(mob-4)*mnm;e[c]+=(mob-4)*mne;}
      else if(ty==B){m[c]+=(mob-6)*mbm;e[c]+=(mob-6)*mbe;}
      else if(ty==R){m[c]+=(mob-7)*mrm;e[c]+=(mob-7)*mre;}
      else{m[c]+=(mob-14)*mqm;e[c]+=(mob-14)*mqe;}
    }
  }
  if(!pawns&&!majors&&minors<=1)return 0;
  for(let c=0;c<2;c++){
    if(bp[c]>1){m[c]+=bpm;e[c]+=bpe;}
    for(const f of rk[c])if(!PC[c][f]){const o=PC[c^1][f]?1:2;m[c]+=rom*o;e[c]+=roe*o;}
    const ks=kg[c],kr=ks>>4;
    if((c?7-kr:kr)<=1){const dd=c?-16:16;for(let x=-1;x<=1;x++){const t=ks+dd+x;if(!(t&136)&&b[t]==(P|c<<3))m[c]+=shl;}}
  }
  for(let f=0;f<8;f++){
    for(let c=0;c<2;c++){
      const cnt=PC[c][f];if(!cnt)continue;
      if(cnt>1){m[c]-=dbm*(cnt-1);e[c]-=dbe*(cnt-1);}
      if(!(f>0&&PC[c][f-1])&&!(f<7&&PC[c][f+1])){m[c]-=ism;e[c]-=ise;}
      const r=c?BN[f]:WX[f];let ok=true;
      for(let g=f-1;g<=f+1;g++){
        if(g<0||g>7||!PC[c^1][g])continue;
        if(c?WN[g]<r:BX[g]>r){ok=false;break;}
      }
      if(ok){const rr=c?7-r:r;m[c]+=PASS[rr]*psm|0;e[c]+=PASS[rr]*pse|0;}
    }
  }
  const mp=Math.min(ph,24),sc=((m[0]-m[1])*mp+(e[0]-e[1])*(24-mp))/24|0;
  return (side?-sc:sc)+tmp;
}

function qs(al,be,pl){
  if((++nodes&2047)==0&&Date.now()>tEnd)stop=true;
  if(stop)return 0;
  if(pl>=100)return evalPos();
  const inC=inCheck();let best=-INF;
  if(!inC){best=evalPos();if(best>=be)return best;if(best>al)al=best;}
  const o=pl*256,e=gen(o,inC?0:1);
  for(let i=o;i<e;i++){const m=MV[i],c=b[m>>7&127];SC[i]=(c?(c&7)*10:((m>>14&7)==1?10:0))-(b[m&127]&7)+((m>>17&7)?100:0);}
  let mc=0;
  for(let i=o;i<e;i++){
    let j=i;for(let x=i+1;x<e;x++)if(SC[x]>SC[j])j=x;
    if(j!=i){let x=MV[i];MV[i]=MV[j];MV[j]=x;x=SC[i];SC[i]=SC[j];SC[j]=x;}
    const m=MV[i];
    if(!inC&&!(m>>17&7)){const c=b[m>>7&127];if(best+(c?VAL[c&7]:100)+200<al)continue;}
    make(m);
    if(attacked(kg[side^1],side)){unmake();continue;}
    mc++;
    const v=-qs(-be,-al,pl+1);
    unmake();
    if(stop)return 0;
    if(v>best){best=v;if(v>al){al=v;if(al>=be)break;}}
  }
  if(inC&&!mc)return pl-MATE;
  return best;
}

function ab(al,be,d,pl,nl){
  if((++nodes&2047)==0&&Date.now()>tEnd)stop=true;
  if(stop)return 0;
  const pv=be-al>1,inC=inCheck();
  if(pl){
    if(half>=100||rep())return 0;
    if(pl>=120)return evalPos();
    al=Math.max(al,pl-MATE);be=Math.min(be,MATE-pl-1);
    if(al>=be)return al;
  }
  if(inC)d++;
  if(d<=0)return qs(al,be,pl);
  const ix=hash&(TN-1);let tm=0;
  if(tA[ix]==hash2&&tF[ix]){
    tm=tM[ix];let v=tS[ix];
    if(v>MATE-200)v-=pl;else if(v<200-MATE)v+=pl;
    const f=tF[ix];
    if(!pv&&tD[ix]>=d&&(f==3||(f==2&&v>=be)||(f==1&&v<=al)))return v;
  }
  const ev=inC?-INF:evalPos();
  if(!pv&&!inC){
    if(d<=6&&ev-90*d>=be&&Math.abs(be)<MATE-200)return ev;
    if(nl&&d>=3&&ev>=be&&np(side)){
      nullMake();
      const v=-ab(-be,-be+1,d-3-(d>5?1:0),pl+1,0);
      nullUnmake();
      if(stop)return 0;
      if(v>=be)return v>MATE-200?be:v;
    }
  }
  if(!tm&&d>=4)d--;
  const o=pl*256,e=gen(o,0);
  for(let i=o;i<e;i++){
    const m=MV[i],f=m&127,t=m>>7&127,pr=m>>17&7,c=b[t];let s;
    if(m==tm)s=1e7;
    else if(c||(m>>14&7)==1)s=1e6+(c?(c&7):1)*10-(b[f]&7);
    else if(pr)s=9e5+pr;
    else if(m==K1[pl])s=8e5;
    else if(m==K2[pl])s=7e5;
    else s=Hs[side<<14|f<<7|t];
    SC[i]=s;
  }
  let best=-INF,bm=0,mc=0;const al0=al;
  for(let i=o;i<e;i++){
    let j=i;for(let x=i+1;x<e;x++)if(SC[x]>SC[j])j=x;
    if(j!=i){let x=MV[i];MV[i]=MV[j];MV[j]=x;x=SC[i];SC[i]=SC[j];SC[j]=x;}
    const m=MV[i],f=m&127,t=m>>7&127,fl=m>>14&7,quiet=!b[t]&&fl!=1&&!(m>>17&7);
    if(!pv&&!inC&&quiet&&best>-MATE+200){
      if(d<=3&&mc>=4+d*d)continue;
      if(d<=2&&ev+130*d<=al)continue;
    }
    if(!pl&&rootEx.length&&rootEx.indexOf(m)>=0)continue;
    make(m);
    if(attacked(kg[side^1],side)){unmake();continue;}
    mc++;
    let v;
    if(mc==1)v=-ab(-be,-al,d-1,pl+1,1);
    else{
      let r=0;
      if(d>=3&&mc>=4&&quiet&&!inC){r=1+(mc>=9?1:0)+(d>=6?1:0)-(pv?1:0)-(m==K1[pl]||m==K2[pl]?1:0);if(r<0)r=0;}
      v=-ab(-al-1,-al,d-1-r,pl+1,1);
      if(v>al&&r)v=-ab(-al-1,-al,d-1,pl+1,1);
      if(v>al&&v<be)v=-ab(-be,-al,d-1,pl+1,1);
    }
    unmake();
    if(stop)return 0;
    if(v>best){
      best=v;bm=m;if(!pl)rootBest=m;
      if(v>al){
        al=v;
        if(al>=be){
          if(quiet){const hi=side<<14|f<<7|t;K2[pl]=K1[pl];K1[pl]=m;Hs[hi]=Math.min(Hs[hi]+d*d,9000);}
          break;
        }
      }
    }
  }
  if(!mc)return inC?pl-MATE:0;
  const fl=best>=be?2:best>al0?3:1;
  let sv=best;if(sv>MATE-200)sv+=pl;else if(sv<200-MATE)sv-=pl;
  if((pl||!rootEx.length)&&(!tF[ix]||tA[ix]!=hash2||d>=tD[ix]-2||fl==3)){tA[ix]=hash2;tM[ix]=bm;tS[ix]=sv;tD[ix]=d;tF[ix]=fl;}
  return best;
}

function legal(){
  const k=gen(0,0),r=[];
  for(let i=0;i<k;i++){const m=MV[i];make(m);if(!attacked(kg[side^1],side))r.push(m);unmake();}
  return r;
}
function uci(m){
  if(!m)return '0000';
  const f=m&127,t=m>>7&127,pr=m>>17&7;
  return String.fromCharCode(97+(f&7),49+(f>>4),97+(t&7),49+(t>>4))+(pr?' nbrq'[pr-1]:'');
}
function parse(s){
  const f=(s.charCodeAt(1)-49)*16+s.charCodeAt(0)-97,t=(s.charCodeAt(3)-49)*16+s.charCodeAt(2)-97,pr=s[4]?'..nbrq'.indexOf(s[4]):0;
  for(const m of legal())if((m&127)==f&&(m>>7&127)==t&&(m>>17&7)==pr)return m;
  return 0;
}
function setup(fen,moves){load(fen||START);for(const u of moves||[]){const m=parse(u);if(!m)break;make(m);}}
function reset(){tF.fill(0);Hs.fill(0);K1.fill(0);K2.fill(0);}
function status(){
  if(!legal().length)return inCheck()?'mate':'stalemate';
  if(half>=100)return 'draw50';
  let c=0;for(let i=n-2;i>=0&&i>=n-half;i-=2)if(sK[i]==hash&&sK2[i]==hash2)c++;
  if(c>=2)return 'rep';
  let pw=0,mi=0,ma=0;
  for(let q=0;q<128;q++){if(q&136){q+=7;continue;}const ty=b[q]&7;if(ty==P)pw++;else if(ty==N||ty==B)mi++;else if(ty==R||ty==Q)ma++;}
  return !pw&&!ma&&mi<=1?'material':'';
}
function perft(d,p){
  p=p||0;const o=p*256,k=gen(o,0);let c=0;
  for(let i=o;i<k;i++){const m=MV[i];make(m);if(!attacked(kg[side^1],side))c+=d==1?1:perft(d-1,p+1);unmake();}
  return c;
}
function gauss(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
function think(ms,maxD,temp,cb,ex,rnd){
  nodes=0;stop=false;const t0=Date.now();tEnd=t0+ms;rootBest=0;K1.fill(0);K2.fill(0);
  const all=legal();if(!all.length)return 0;
  rootEx=(ex||[]).map(parse).filter(Boolean);
  let mv=all.filter(m=>rootEx.indexOf(m)<0);
  if(!mv.length){rootEx=[];mv=all;}
  rootBest=mv[0];if(mv.length==1)return mv[0];
  if(temp>0||rnd>0){
    tEnd=t0+1e9;
    if(rnd>0&&Math.random()<rnd){
      if(cb)cb({d:0,v:0,nodes:0,ms:Date.now()-t0});
      return mv[Math.floor(Math.random()*mv.length)];
    }
    const sc=mv.map(m=>{make(m);const v=-ab(-INF,INF,Math.max(0,maxD-1),1,1);unmake();return v;});
    let bi=0,bv=-Infinity;
    for(let i=0;i<mv.length;i++){const q=Math.abs(sc[i])>MATE-200?sc[i]:sc[i]+gauss()*temp;if(q>bv){bv=q;bi=i;}}
    if(cb)cb({d:maxD,v:sc[bi],nodes,ms:Date.now()-t0});
    return mv[bi];
  }
  let bm=rootBest;
  for(let d=1;d<=maxD;d++){
    const v=ab(-INF,INF,d,0,1);
    if(stop)break;
    bm=rootBest;
    if(cb)cb({d,v,nodes,ms:Date.now()-t0});
    if(Date.now()-t0>ms*0.45||Math.abs(v)>MATE-200)break;
  }
  return bm;
}

function fen(){
  let r='';
  for(let y=7;y>=0;y--){let e=0;for(let x=0;x<8;x++){const p=b[y*16+x];if(!p)e++;else{if(e){r+=e;e=0;}const ch='pnbrqk'[(p&7)-1];r+=p>>3?ch:ch.toUpperCase();}}if(e)r+=e;if(y)r+='/';}
  let c='';if(castle&1)c+='K';if(castle&2)c+='Q';if(castle&4)c+='k';if(castle&8)c+='q';
  return r+' '+(side?'b':'w')+' '+(c||'-')+' '+(ep>=0?String.fromCharCode(97+(ep&7),49+(ep>>4)):'-')+' '+half+' 1';
}
function qscore(){stop=false;tEnd=1e18;return qs(-INF,INF,0);}
function setWeights(o){Object.assign(V,o);build();}
G.Xeque={START,fen,qscore,setWeights,weights:()=>Object.assign({},V),evalStatic:evalPos,load,legal,make,unmake,uci,parse,setup,reset,status,perft,think,inCheck,key:()=>hash+'_'+hash2,
  at:(f,r)=>b[r*16+f],side:()=>side};
if(typeof module!=='undefined')module.exports=G.Xeque;
if(typeof WorkerGlobalScope!=='undefined'&&typeof self!=='undefined'&&self instanceof WorkerGlobalScope){
  onmessage=e=>{
    const d=e.data;
    if(d.reset){reset();return;}
    if(d.weights){setWeights(d.weights);return;}
    setup(d.fen,d.moves);
    const m=think(d.ms,d.depth,d.temp,i=>postMessage({info:i}),d.ex,d.rnd);
    postMessage({best:uci(m)});
  };
}
})(globalThis);
