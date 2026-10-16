const cachePrefix='reigns-garden-'+encodeURIComponent(self.registration.scope)+'-';
const cacheName=cachePrefix+'v4';
const files=['./','index.html','style.css','storybook.css','tablet.css','engine.js','storage.js','boot.js','app.js','manifest.webmanifest','assets/garden-world.jpg','assets/garden-scene.jpg','assets/icon-192.png','assets/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(cacheName).then(cache=>cache.addAll(files)));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(cachePrefix)&&key!==cacheName).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||!event.request.url.startsWith(self.registration.scope))return;
  if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.open(cacheName).then(cache=>cache.match(new URL('index.html',self.registration.scope).href))));return;}
  event.respondWith(caches.open(cacheName).then(cache=>cache.match(event.request)).then(cached=>cached||fetch(event.request)));
});
