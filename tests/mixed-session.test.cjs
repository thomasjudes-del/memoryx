const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');let code=html.split('<script>')[1].split('</script>')[0].replace(/render\(\);\s*$/,'');
const events={},nodes={};const context=vm.createContext({console,location:{hash:''},localStorage:{getItem:()=>null,setItem:()=>{}},window:{addEventListener:()=>{},scrollTo:()=>{}},document:{addEventListener:(name,fn)=>(events[name]??=[]).push(fn),querySelector:s=>nodes[s]},setTimeout:()=>0,clearTimeout:()=>{}});vm.runInContext(code,context);vm.runInContext('render=()=>{};closeModal=()=>{};',context);
const run=s=>vm.runInContext(s,context);
assert.equal(run('unexploredYears([]).length'),10);
assert.equal(run('unexploredYears([{when:"Around September 2010"}]).includes(2010)'),false);
assert.equal(run('unexploredYears([{exploredYear:2011,when:"uncertain"}]).includes(2011)'),false);
function click(action){const b={dataset:{action}},e={target:{closest:s=>s==='button,[data-action="backdrop"]'?b:null}};for(const cb of events.click)cb(e)}
click('startdaily');assert.equal(run('state.daily.stage'),'recall');assert.equal(run('route'),'quiz');
click('nextquiz');assert.equal(run('state.daily.stage'),'explore');assert.equal(run('route'),'gap');assert.equal(run('state.gap.step'),'setup');assert.equal(run('quizFinished'),false);
nodes['#gapconfirm']={checked:false};nodes['#gapreviewtext']={value:'Maybe Lyon'};nodes['#gapprecision']={value:'Around 2010'};nodes['#gapcertainty']={value:'hypothesis'};run('state.gap.year=2010;state.gap.source="Fictional calendar"');
const submit={target:{id:'gapreview'},preventDefault(){}};for(const cb of events.submit)cb(submit);assert.equal(run('(state.memories||[]).length'),0,'unconfirmed form must not save');
nodes['#gapconfirm'].checked=true;for(const cb of events.submit)cb(submit);assert.equal(run('state.memories.length'),1);assert.equal(run('state.memories[0].status'),'hypothesis');assert.equal(run('state.memories[0].source'),'Fictional calendar');assert.equal(run('state.daily.stage'),'done');assert.equal(run('quizQs().length'),3);assert.equal(run('quizQs()[0].answer'),0);assert.equal(run('state.gap.step'),'result');
assert(html.includes('Réponse déjà enregistrée'));assert(html.includes('Réponse encore inconnue'));assert(!html.includes('fetch('));
console.log('PASS mixed session: recall→explore→done; required confirmation; hypothesis provenance; unsaved periods; known quiz isolated.');
