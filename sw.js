const cachePrefix='reigns-garden-'+encodeURIComponent(self.registration.scope)+'-';
const cacheVersion='studio-music-v3';
const cacheName=cachePrefix+cacheVersion;
const files=['./','index.html','style.css','storybook.css','tablet.css','learning.css?v=2','studio.css?v=studio1','paint.js?v=studio1','studio.js?v=studio1','garden-audio.js?v=studio1','engine.js?v=studio1','learning-data.js?v=2','learning.js?v=2','learning-ui.js?v=studio1','storage.js','boot.js?v=studio1','app.js?v=studio1','manifest.webmanifest','assets/garden-world.jpg','assets/garden-scene.jpg','assets/icon-192.png','assets/icon-512.png',...Array.from({length:24},(_,index)=>'audio/words-'+index+'.wav'),'audio/sounds.wav','audio/prompts.wav','audio/garden-music.wav'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(cacheName).then(async cache=>{for(let index=0;index<files.length;index+=4)await cache.addAll(files.slice(index,index+4));}));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(cachePrefix)&&key!==cacheName).map(key=>caches.delete(key)))).then(()=>self.clients.claim()).then(async()=>{for(const client of await self.clients.matchAll())client.postMessage({type:'garden-offline-ready',version:cacheVersion});}));});
self.addEventListener('message',event=>{if(event.data?.type==='garden-version')event.source?.postMessage({type:'garden-offline-ready',version:cacheVersion});if(event.data?.type==='garden-activate-update')event.waitUntil(self.skipWaiting());});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||!event.request.url.startsWith(self.registration.scope))return;
  event.respondWith(caches.open(cacheName).then(async cache=>{
    if(new URL(event.request.url).pathname.endsWith('/boot.js'))return fetch(event.request).catch(()=>cache.match(event.request));
    if(event.request.mode==='navigate')return (await cache.match('index.html'))||fetch(event.request);
    return (await cache.match(event.request))||fetch(event.request);
  }));
});
