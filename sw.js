const C='xeque-v1';
const CORE=['./','index.html','engine.js','levels.js','aberturas.js','chess-util.js','uci.js','weights.json','exercicios.json','manifest.webmanifest','icon-192.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!='GET'||new URL(r.url).origin!=location.origin)return;
  e.respondWith(fetch(r).then(res=>{
    if(res.status==200){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));}
    return res;
  }).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));
});
