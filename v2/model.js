export const CATEGORIES = [
 {id:'all',name:'Tout',icon:'spark'}, {id:'travel',name:'Voyages',icon:'compass'},
 {id:'places',name:'Lieux de vie',icon:'home'}, {id:'people',name:'Proches',icon:'people'},
 {id:'study',name:'Études',icon:'book'}, {id:'work',name:'Travail',icon:'case'},
 {id:'daily',name:'Quotidien',icon:'sun'}
];
export const SEED = [
 {id:'school',title:'Le dernier jour du lycée',date:{type:'season',year:2004,season:'summer'},category:'study',place:'Nantes',people:['Camille'],text:'On avait écrit nos prénoms au dos de nos t-shirts. Camille avait apporté un appareil jetable. Je me souviens surtout de la sensation que tout commençait.',status:'confirmed',art:null,source:'Note personnelle fictive',example:true},
 {id:'flat',title:'Les clés de mon premier chez-moi',date:{type:'year',year:2008},category:'places',place:'Rennes',people:[],text:'Un studio sous les toits. Les cartons ont servi de table pendant plusieurs semaines. Le jour exact m’échappe.',status:'confirmed',art:null,source:'Note personnelle fictive',example:true},
 {id:'lyon',title:'Une nouvelle vie à Lyon',date:{type:'exact',exact:'2016-09-03'},category:'places',place:'Lyon',people:['Max'],text:'Max m’a aidé à monter les cartons au quatrième. Le soir, on a mangé une pizza assis par terre, les fenêtres grandes ouvertes.',status:'confirmed',art:null,source:'Note personnelle fictive',example:true},
 {id:'studio',title:'Les années à l’atelier',date:{type:'range',start:2018,end:2022},category:'work',place:'Lyon',people:['Camille'],text:'Une grande table, du café et des idées sur tous les murs. Une période de travail intense, mais surtout de belles rencontres.',status:'confirmed',art:null,source:'Note personnelle fictive',example:true},
 {id:'coast',title:'Ce fameux été en Bretagne',date:{type:'season',year:2019,season:'summer'},category:'travel',place:'Côte bretonne',people:['Léa'],text:'Le vent, le petit bateau… et les sandwiches oubliés. Nous avons embarqué dans un port dont je ne retrouve plus le nom.',status:'uncertain',art:'coast',source:'Note personnelle fictive',example:true},
 {id:'forest',title:'Trois jours hors du temps',date:{type:'exact',exact:'2022-05-14'},category:'travel',place:'Cévennes',people:['Léa','Max'],text:'Pas de réseau, un sentier qui n’en finissait pas et ce dîner près de la tente. Max avait pris une petite cafetière.',status:'confirmed',art:'forest',source:'Note personnelle fictive',example:true},
 {id:'sunday',title:'Le dimanche des raviolis',date:{type:'season',year:2024,season:'winter'},category:'people',place:'Chez ma mère',people:['Maman','Camille'],text:'De la farine partout. Personne n’était d’accord sur la forme des raviolis, mais tout le monde en a repris.',status:'confirmed',art:null,source:'Note personnelle fictive',example:true},
 {id:'song',title:'La chanson dans la voiture',date:{type:'unknown'},category:'daily',place:'',people:['Papa'],text:'Il tapait le rythme sur le volant. Je voudrais retrouver le titre de cette chanson et savoir où nous allions.',status:'uncertain',art:null,source:'Note personnelle fictive',example:true}
];
export const clone = v => JSON.parse(JSON.stringify(v));
export const id = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'm'+Date.now()+Math.random().toString(36).slice(2);
export const yearStart = y => Date.UTC(y,0,1);
export function interval(d){
 if(!d||d.type==='unknown') return null;
 const y=Number(d.year);
 if(d.type==='exact'){const n=Date.parse(d.exact+'T00:00:00Z');return Number.isFinite(n)?[n,n+86400000]:null;}
 if(d.type==='month'){const [yy,mm]=d.month.split('-').map(Number);return [Date.UTC(yy,mm-1,1),Date.UTC(yy,mm,1)];}
 if(d.type==='range')return [yearStart(+d.start),yearStart(+d.end+1)];
 if(d.type==='approx')return [yearStart(y-1),yearStart(y+2)];
 if(d.type==='season'){const s={spring:[2,5],summer:[5,8],autumn:[8,11],winter:[11,14]}[d.season]||[0,12];return [Date.UTC(y,s[0],1),Date.UTC(y,s[1],1)];}
 return [yearStart(y),yearStart(y+1)];
}
export function dateLabel(d){
 if(!d||d.type==='unknown')return 'Date à retrouver';
 if(validateDate(d))return 'Préciser la date';
 if(d.type==='exact')return new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(d.exact+'T12:00:00Z'));
 if(d.type==='month')return new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(d.month+'-01T12:00:00Z'));
 if(d.type==='range')return `${d.start} à ${d.end}`;
 if(d.type==='season')return `${{spring:'Printemps',summer:'Été',autumn:'Automne',winter:'Hiver'}[d.season]} ${d.year}${d.season==='winter'?' / '+(+d.year+1):''}`;
 return (d.type==='approx'?'Vers ':'')+d.year;
}
export function validateDate(d){
 if(!d||!['unknown','exact','month','year','approx','range','season'].includes(d.type))return 'Choisis une précision de date.';
 const valid=y=>Number.isInteger(+y)&&+y>=1000&&+y<=2100;
 if(d.type==='unknown')return '';
 if(d.type==='month')return /^\d{4}-(0[1-9]|1[0-2])$/.test(d.month||'')&&valid(d.month.slice(0,4))?'':'Choisis un mois valide.';
 if(d.type==='exact'){if(!/^\d{4}-\d{2}-\d{2}$/.test(d.exact||''))return 'Choisis une date valide.';const dt=new Date(d.exact+'T00:00:00Z');if(!Number.isFinite(+dt)||dt.toISOString().slice(0,10)!==d.exact||!valid(d.exact.slice(0,4)))return 'Choisis une date valide.';return '';}
 if(d.type==='range')return !valid(d.start)||!valid(d.end)?'Indique deux années entre 1000 et 2100.':+d.end<+d.start?'La fin doit suivre le début.':'';
 if(!valid(d.year))return 'Indique une année entre 1000 et 2100.';
 if(d.type==='season'&&!['spring','summer','autumn','winter'].includes(d.season))return 'Choisis une saison.';
 return '';
}
export function fits(m,filter={}){if(filter.category&&filter.category!=='all'&&m.category!==filter.category)return false;
 if(filter.query&&!`${m.title} ${m.text} ${m.place} ${(m.people||[]).join(' ')} ${dateLabel(m.date)}`.toLocaleLowerCase('fr').includes(filter.query.toLocaleLowerCase('fr')))return false;
 if(filter.from){const i=interval(m.date);if(!i||i[1]<=filter.from||i[0]>=filter.to)return false;}return !m.deleted;
}
export function recallQuestions(memories,filter={}){
 return memories.filter(m=>fits(m,filter)&&m.status==='confirmed').flatMap(m=>{
 const base={memoryId:m.id,title:m.title,when:dateLabel(m.date)};const out=[];
 if(m.place)out.push({...base,kind:'free',field:'place',question:`Où se passe « ${m.title} » ?`,answer:m.place,hint:`Ce souvenir appartient à la période : ${dateLabel(m.date)}.`});
 if(m.people?.length)out.push({...base,kind:'card',field:'people',question:`Qui partage ce moment avec toi ?`,answer:m.people.join(', '),hint:'Pense aux voix, aux visages, à la scène.'});return out;
 });
}
export function gaps(memories){const years=memories.filter(m=>!m.deleted).map(m=>interval(m.date)).filter(Boolean).map(i=>new Date(i[0]).getUTCFullYear());const first=Math.max(1900,Math.min(...years,new Date().getFullYear()-8));const last=new Date().getFullYear();const scores=[];
 for(let y=first;y<=last;y++){const count=memories.filter(m=>fits(m,{from:yearStart(y),to:yearStart(y+1)})).length;scores.push({year:y,count});}return scores.sort((a,b)=>a.count-b.count||a.year-b.year);
}
export function safeImport(data){
 if(!data||data.format!=='memoryx-atelier'||!Array.isArray(data.memories)||data.memories.length>1000)throw Error('Ce fichier n’est pas un export MemoryX compatible (1 000 souvenirs maximum).');
 const text=(v,n=6000)=>typeof v==='string'?v.slice(0,n):'';
 return data.memories.map(m=>{if(!m||!text(m.title,100).trim()||validateDate(m.date))throw Error('Un souvenir contient un titre ou une date invalide.');
 const d=m.date, date={type:d.type};for(const k of ['year','start','end'])if(d[k]!==undefined)date[k]=+d[k];for(const k of ['exact','season','month'])if(d[k]!==undefined)date[k]=text(d[k],20);
 return {id:id(),title:text(m.title,100),text:text(m.text),date,category:CATEGORIES.some(c=>c.id===m.category&&c.id!=='all')?m.category:'daily',place:text(m.place,200),people:Array.isArray(m.people)?m.people.slice(0,20).map(v=>text(v,80)):[],status:['confirmed','uncertain','hypothesis'].includes(m.status)?m.status:'uncertain',source:text(m.source,500),photo:/^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(m.photo||'')&&m.photo.length<2100000?m.photo:null,art:['forest','coast'].includes(m.art)?m.art:null,example:false,clues:Array.isArray(m.clues)?m.clues.slice(0,100).map(c=>({id:id(),text:text(c.text),source:text(c.source,500),status:'hypothesis'})):[]};});
}
