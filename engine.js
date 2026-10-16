(function(root){
  const skills=['Short vowels','First sounds','Last sounds','Blends','Long vowels','Sight words'];
  const bank=[
    ['cat','🐈',1,0],['dog','🐕',1,0],['sun','☀️',1,0],['pig','🐖',1,0],['hen','🐔',1,0],['hat','🎩',1,0],['bed','🛏️',1,0],['cup','☕',1,0],['fox','🦊',1,0],['bus','🚌',1,0],['bug','🐞',1,0],['jam','🍓',1,0],['net','🥅',1,0],['pen','🖊️',1,0],['pot','🪴',1,0],['map','🗺️',1,0],['six','6️⃣',1,0],['fish','🐟',1,0],
    ['cat','🐈',0,1],['dog','🐕',0,1],['sun','☀️',0,1],['pig','🐖',0,1],['hen','🐔',0,1],['fox','🦊',0,1],['bed','🛏️',0,1],['map','🗺️',0,1],
    ['cat','🐈',2,2],['dog','🐕',2,2],['sun','☀️',2,2],['pig','🐖',2,2],['hat','🎩',2,2],['cup','☕',2,2],['bed','🛏️',2,2],['bus','🚌',2,2],
    ['frog','🐸',1,3],['star','⭐',1,3],['crab','🦀',1,3],['drum','🥁',1,3],['flag','🚩',1,3],['plum','🟣',1,3],['sled','🛷',1,3],['snail','🐌',1,3],
    ['cake','🍰',1,4],['kite','🪁',1,4],['bike','🚲',1,4],['rose','🌹',1,4],['cube','🧊',1,4],['home','🏠',1,4],['bone','🦴',1,4],['five','5️⃣',1,4],
    ['the','📖',2,5],['you','👉',1,5],['said','💬',1,5],['like','❤️',1,5],['come','👋',1,5],['have','🤲',1,5],['was','🕰️',1,5],['they','👥',2,5]
  ].map((entry,index)=>({id:index,word:entry[0],emoji:entry[1],gap:entry[2],skill:entry[3]}));
  const items=[['daisy','🌼','Daisy patch',15],['tulip','🌷','Pink tulips',20],['mushroom','🍄','Fairy mushrooms',25],['butterfly','🦋','Butterfly friend',30],['sunflower','🌻','Sunny sunflowers',35],['bunny','🐇','Bunny buddy',40],['fountain','⛲','Little fountain',55],['rainbow','🌈','Rainbow magic',65]];
  function fresh(){return {version:1,coins:0,total:0,correct:0,rounds:0,streak:0,bestStreak:0,skills:skills.map(()=>({attempts:0,correct:0})),history:[],owned:[],placed:[],drawings:[],sound:true,autoAudio:true,daily:{}};}
  function shuffle(values,random=Math.random){return values.map(value=>({value,sort:random()})).sort((first,second)=>first.sort-second.sort).map(entry=>entry.value);}
  function select(state,recent=[],step=0,random=Math.random){
    let skill=0;
    if(step%3===2){
      const eligible=[1,2,3,4,5];
      skill=eligible.slice().sort((first,second)=>{
        const left=state.skills[first],right=state.skills[second];
        return (left.correct+1)/(left.attempts+2)-(right.correct+1)/(right.attempts+2);
      })[Math.floor(random()*Math.min(2,eligible.length))];
    }
    let pool=bank.filter(question=>question.skill===skill&&!recent.includes(question.id));
    if(!pool.length)pool=bank.filter(question=>question.skill===skill);
    const question=pool[Math.floor(random()*pool.length)];
    const answer=question.word[question.gap];
    const record=state.skills[skill];
    const count=record.attempts>=6&&record.correct/record.attempts>.8?5:record.attempts>=3&&record.correct/record.attempts<.5?3:4;
    const alphabet=skill===0||skill===4?'aeiou':'bcdfghjklmnprstvwyaeiou';
    return {...question,answer,choices:shuffle([answer,...shuffle([...new Set(alphabet)].filter(letter=>letter!==answer),random).slice(0,count-1)],random)};
  }
  function record(state,question,firstTry,date){
    const next=JSON.parse(JSON.stringify(state));
    next.total++;next.correct+=Number(firstTry);next.coins+=firstTry?5:2;
    next.streak=firstTry?next.streak+1:0;next.bestStreak=Math.max(next.bestStreak,next.streak);
    next.skills[question.skill].attempts++;next.skills[question.skill].correct+=Number(firstTry);
    next.daily[date]=(next.daily[date]||0)+1;
    next.history.push({word:question.word,skill:question.skill,firstTry,date});next.history=next.history.slice(-150);
    return next;
  }
  function purchase(state,id){const item=items.find(entry=>entry[0]===id);if(!item||state.owned.includes(id)||state.coins<item[3])return false;state.coins-=item[3];state.owned.push(id);state.placed.push(id);return true;}
  function validate(value){
    const integer=(entry,max=10000000)=>Number.isInteger(entry)&&entry>=0&&entry<=max;
    if(value?.artDraft!==undefined&&value.artDraft!==null&&(typeof value.artDraft!=='string'||value.artDraft.length>1500000||!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(value.artDraft)))return false;
    if(value?.artTools!==undefined&&(!value.artTools||!/^#[a-fA-F0-9]{6}$/.test(value.artTools.ink)||!integer(value.artTools.brush,30)||value.artTools.brush<3||typeof value.artTools.erasing!=='boolean'))return false;
    if(!value||value.version!==1||!['coins','total','correct','rounds','streak','bestStreak'].every(key=>integer(value[key]))||value.correct>value.total)return false;
    if(!Array.isArray(value.skills)||value.skills.length!==6||!value.skills.every(entry=>entry&&integer(entry.attempts)&&integer(entry.correct)&&entry.correct<=entry.attempts))return false;
    const ids=items.map(entry=>entry[0]);
    if(!['owned','placed'].every(key=>Array.isArray(value[key])&&value[key].length<=8&&new Set(value[key]).size===value[key].length&&value[key].every(id=>ids.includes(id)))||!value.placed.every(id=>value.owned.includes(id)))return false;
    if(!Array.isArray(value.drawings)||value.drawings.length>6||!value.drawings.every(entry=>typeof entry==='string'&&entry.length<1500000&&/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(entry)))return false;
    if(!Array.isArray(value.history)||value.history.length>150||!value.history.every(entry=>entry&&typeof entry.word==='string'&&(bank.some(question=>question.word===entry.word)||Object.hasOwn(root.GardenLibrary?.words||{},entry.word))&&integer(entry.skill,5)&&typeof entry.firstTry==='boolean'&&/^\d{4}-\d{2}-\d{2}$/.test(entry.date)))return false;
    return typeof value.sound==='boolean'&&typeof value.autoAudio==='boolean'&&value.daily&&typeof value.daily==='object'&&!Array.isArray(value.daily)&&Object.entries(value.daily).every(([key,amount])=>/^\d{4}-\d{2}-\d{2}$/.test(key)&&integer(amount));
  }
  const api={skills,bank,items,fresh,select,record,purchase,validate};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Garden=api;
})(typeof window!=='undefined'?window:globalThis);
