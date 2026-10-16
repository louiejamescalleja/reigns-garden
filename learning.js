(function(root){
  const library=root.GardenLibrary;
  const skills={beginning:'Beginning sounds',middle:'Middle sounds',ending:'Ending sounds',vowels:'Vowel identification',consonants:'Consonant identification',sequencing:'Sound sequencing',blends:'Blends and digraphs',mapping:'Sound-to-letter mapping',independent:'Independent spelling'};
  const empty=()=>({attempts:0,independent:0,hinted:0,errors:0});
  function fresh(){return {version:2,skills:{},words:{},patterns:{},levels:{},recent:[],dailyRounds:0};}
  function migrate(value){const next=JSON.parse(JSON.stringify(value));if(!next.learning)next.learning=fresh();return next;}
  function valid(value){
    if(value===undefined)return true;
    const integer=(number,max=10000000)=>Number.isInteger(number)&&number>=0&&number<=max;
    const metric=entry=>entry&&['attempts','independent','hinted','errors'].every(key=>integer(entry[key]))&&entry.independent<=entry.attempts&&entry.hinted<=entry.attempts;
    const map=(entries,keys,check,max)=>entries&&typeof entries==='object'&&!Array.isArray(entries)&&Object.keys(entries).length<=max&&Object.entries(entries).every(([key,entry])=>keys.includes(key)&&check(entry));
    return value?.version===2&&integer(value.dailyRounds)&&map(value.skills,Object.keys(skills),metric,9)&&map(value.patterns,[...new Set(library.levels.map(level=>level.pattern)),...Object.values(library.words).map(word=>word.pattern)],metric,100)&&map(value.words,Object.keys(library.words),entry=>metric(entry)&&integer(entry.lastSeen,9007199254740991)&&integer(entry.due,9007199254740991)&&integer(entry.successes)&&integer(entry.gap,365),1000)&&map(value.levels,library.levels.map(level=>String(level.id)),entry=>metric(entry)&&integer(entry.runs)&&integer(entry.lastPlayed,9007199254740991),30)&&Array.isArray(value.recent)&&value.recent.length<=30&&value.recent.every(word=>Object.hasOwn(library.words,word));
  }
  const baseValidate=root.Garden.validate;
  root.Garden.validate=value=>baseValidate(value)&&valid(value.learning);
  function weighted(pool,weight,random){const weights=pool.map(weight);let target=random()*weights.reduce((sum,value)=>sum+value,0);for(let index=0;index<pool.length;index++){target-=weights[index];if(target<=0)return pool[index];}return pool.at(-1);}
  function choose(state,levelId,recent=[],random=Math.random,now=Date.now()){
    const learning=state.learning||fresh();
    let level=library.levels.find(entry=>entry.id===levelId);
    if(levelId!==0&&!level)throw Error('Unknown level');
    if(!level){const experience=Object.values(learning.skills).reduce((sum,metric)=>sum+metric.independent,0);const comfort=1+Math.min(5,Math.floor(experience/25));level=weighted(library.levels,entry=>{const skill=learning.skills[entry.skill]||empty();const focus=['vowels','middle'].includes(entry.skill)?1.5:1;return focus*(1+3*(1-(skill.independent+1)/(skill.attempts+2)))/(1+Math.max(0,entry.difficulty-comfort)*2);},random);}
    let pool=level.words.filter(word=>!recent.includes(word)&&!learning.recent.slice(-10).includes(word));
    if(!pool.length)pool=level.words.filter(word=>!recent.includes(word));if(!pool.length)pool=level.words;
    const word=weighted(pool,entry=>{if(levelId!==0)return 1;const previous=learning.words[entry];return !previous?2:previous.due<=now?4+Math.min(previous.errors,4):1;},random);
    let activity=level.activity;
    if(activity==='pair')activity='missing';
    if(activity==='build'&&levelId===0&&library.words[word].groups&&random()<.25)activity='count';
    return {levelId:level.id,word:library.words[word],activity,skill:level.skill,pattern:level.pattern};
  }
  function record(state,question,result,date,now=Date.now()){
    const next=migrate(state),learning=next.learning;
    const independent=!result.hinted&&result.errors===0;
    const legacySkill={beginning:1,ending:2,vowels:question.levelId>=16?4:0,middle:0,consonants:3,sequencing:3,blends:3,mapping:3,independent:5}[question.skill];
    const saved=root.Garden.record(next,{word:question.word.word,skill:legacySkill},independent,date);
    function increment(entry){entry.attempts++;entry.independent+=Number(independent);entry.hinted+=Number(result.hinted);entry.errors+=result.errors;return entry;}
    const target=saved.learning;
    const tracked=new Set([question.skill]);
    if(question.activity==='steps'){tracked.add('sequencing');tracked.add('mapping');}
    if(question.activity==='count')tracked.add('mapping');
    for(const key of tracked)target.skills[key]=increment(target.skills[key]||empty());
    target.patterns[question.pattern]=increment(target.patterns[question.pattern]||empty());
    let previous=target.words[question.word.word]||{...empty(),lastSeen:0,due:0,successes:0,gap:0};
    previous=increment(previous);previous.successes=independent?previous.successes+1:0;previous.gap=independent?Math.min(30,[1,3,7,14,30][Math.min(previous.successes-1,4)]):0;previous.lastSeen=now;previous.due=now+(previous.gap?previous.gap*86400000:300000);target.words[question.word.word]=previous;
    const key=String(question.levelId);target.levels[key]=increment(target.levels[key]||{...empty(),runs:0,lastPlayed:0});target.levels[key].lastPlayed=now;
    target.recent=[...target.recent,question.word.word].slice(-30);
    return saved;
  }
  function finish(state,levelId){const next=migrate(state);next.rounds++;next.coins+=10;if(levelId===0)next.learning.dailyRounds++;else{const key=String(levelId);next.learning.levels[key]||={...empty(),runs:0,lastPlayed:0};next.learning.levels[key].runs++;}return next;}
  function mastery(metric){return !!metric&&metric.attempts>=12&&metric.independent/metric.attempts>=.85;}
  root.Learning={library,skills,fresh,migrate,valid,choose,record,finish,mastery};
})(window);
