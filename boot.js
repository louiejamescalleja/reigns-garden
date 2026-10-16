(async function(){
  await GardenStorage.ready;
  const script=document.createElement('script');script.src='app.js?v=2';script.onerror=()=>{document.getElementById('main').textContent='The game could not load. Please refresh when connected.';};document.body.appendChild(script);
  const offline=document.createElement('span');offline.id='offline-status';offline.setAttribute('role','status');document.querySelector('footer').appendChild(offline);
  if(window.isSecureContext&&'serviceWorker' in navigator){
    offline.textContent='Downloading offline words and sounds…';
    let currentRegistration,applying=false;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(applying)location.reload();});
    navigator.serviceWorker.addEventListener('message',event=>{if(event.data?.type==='garden-offline-ready'&&event.data.version==='learning-v2-r6'&&!currentRegistration?.waiting)offline.textContent='Offline words and sounds ready ✓';});
    navigator.serviceWorker.register('sw.js').then(registration=>{
      currentRegistration=registration;
      const inspect=()=>{
        if(registration.waiting){
          offline.textContent='Update downloaded · ';const button=document.createElement('button');button.className='secondary';button.textContent='Load saved-safe update';button.style.minHeight='44px';
          button.onclick=async()=>{button.disabled=true;await GardenStorage.flush();if(document.getElementById('save-status').textContent.includes('unavailable')){offline.textContent='Export a backup before loading the update · saving is unavailable';return;}applying=true;registration.waiting?.postMessage({type:'garden-activate-update'});offline.textContent='Opening the update · your saved garden stays here';};offline.appendChild(button);
        }else registration.active?.postMessage({type:'garden-version'});
      };
      inspect();registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='activated'||worker.state==='installed')inspect();if(worker.state==='redundant')offline.textContent='Offline download incomplete · reopen while connected';});});
    }).catch(()=>{offline.textContent='Offline cache unavailable · connect to play audio';});
  }else offline.textContent='Open the HTTPS game to download offline audio';
})();
