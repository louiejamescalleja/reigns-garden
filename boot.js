(async function(){
  await GardenStorage.ready;
  const script=document.createElement('script');script.src='app.js?v=2';script.onerror=()=>{document.getElementById('main').textContent='The game could not load. Please refresh when connected.';};document.body.appendChild(script);
  const offline=document.createElement('span');offline.id='offline-status';offline.setAttribute('role','status');document.querySelector('footer').appendChild(offline);
  if(window.isSecureContext&&'serviceWorker' in navigator){
    offline.textContent='Downloading offline words and sounds…';
    let currentRegistration;
    navigator.serviceWorker.addEventListener('message',event=>{if(event.data?.type==='garden-offline-ready'&&event.data.version==='learning-v2-r5'&&!currentRegistration?.waiting)offline.textContent='Offline words and sounds ready ✓';});
    navigator.serviceWorker.register('sw.js').then(registration=>{
      currentRegistration=registration;
      const inspect=()=>{if(registration.waiting)offline.textContent='Update downloaded · close all Garden tabs and reopen';registration.active?.postMessage({type:'garden-version'});};
      inspect();registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='activated'||worker.state==='installed')inspect();if(worker.state==='redundant')offline.textContent='Offline download incomplete · reopen while connected';});});
    }).catch(()=>{offline.textContent='Offline cache unavailable · connect to play audio';});
  }else offline.textContent='Open the HTTPS game to download offline audio';
})();
