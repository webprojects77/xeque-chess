const fs=require('fs');const {spawn}=require('child_process');const readline=require('readline');
const D=+process.argv[2]||10,K=+process.argv[3]||2,SF=process.env.SF||'/usr/games/stockfish';
const fens=[...new Set(fs.readFileSync(0,'utf8').split('\n').filter(Boolean))];
const shards=Array.from({length:K},()=>[]);
fens.forEach((f,i)=>shards[i%K].push(f));
function work(list){
  return new Promise(res=>{
    const p=spawn(SF),rl=readline.createInterface({input:p.stdout}),out=[];
    let i=0,sc=null;
    const next=()=>{
      if(i>=list.length){p.stdin.write('quit\n');return res(out);}
      p.stdin.write('position fen '+list[i]+'\ngo depth '+D+'\n');
    };
    rl.on('line',l=>{
      if(l=='readyok')next();
      else if(l.startsWith('info')&&l.indexOf('bound')<0){
        const m=/ score (cp|mate) (-?\d+)/.exec(l);
        if(m)sc=m[1]=='cp'?+m[2]:(+m[2]>0?1500:-1500);
      }else if(l.startsWith('bestmove')){
        const f=list[i];let v=sc==null?0:sc;
        if(f.split(' ')[1]=='b')v=-v;
        out.push(f+'|'+Math.max(-1500,Math.min(1500,v)));
        sc=null;i++;next();
      }
    });
    p.stdin.write('uci\nisready\n');
  });
}
Promise.all(shards.map(work)).then(r=>process.stdout.write(r.flat().join('\n')+'\n'));
