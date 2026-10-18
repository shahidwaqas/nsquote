/* NS Solar Energy - offline support. Bump CACHE when you want to force a refresh. */
const CACHE='nsq-v1';
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
const LIBS=[
'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js',
'https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap',
'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap'];
const HOSTS=['cdnjs.cloudflare.com','cdn.jsdelivr.net','fonts.googleapis.com','fonts.gstatic.com','www.gstatic.com'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{
 const c=await caches.open(CACHE);
 await Promise.all(CORE.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})));
 await Promise.all(LIBS.map(u=>fetch(u,{mode:'no-cors'}).then(r=>c.put(u,r)).catch(()=>{})));
 self.skipWaiting()})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
 const k=await caches.keys();await Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)));
 await self.clients.claim()})())});
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 const u=new URL(r.url);
 if(u.origin===location.origin){
  /* own files: network first (so updates show), cache when offline */
  e.respondWith((async()=>{const c=await caches.open(CACHE);
   try{const n=await fetch(r);if(n&&n.ok)c.put(r,n.clone());return n}
   catch(_){return (await c.match(r,{ignoreSearch:true}))||(r.mode==='navigate'?await c.match('./index.html'):undefined)||Response.error()}})());
  return}
 if(HOSTS.includes(u.hostname)){
  /* libraries and fonts: cache first, refresh in background */
  e.respondWith((async()=>{const c=await caches.open(CACHE),m=await c.match(r);
   const f=fetch(r).then(n=>{if(n&&(n.ok||n.type==='opaque'))c.put(r,n.clone());return n}).catch(()=>null);
   return m||(await f)||Response.error()})())}
});
