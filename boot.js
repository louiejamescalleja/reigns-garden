(async function(){
  await GardenStorage.ready;
  const script=document.createElement('script');script.src='app.js';script.onerror=()=>{document.getElementById('main').textContent='The game could not load. Please refresh when connected.';};document.body.appendChild(script);
  if(location.protocol==='https:'&&'serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
