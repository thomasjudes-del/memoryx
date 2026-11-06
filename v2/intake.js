import {validateDate,id} from './model.js';
export const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
export const MONTHS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function extractDate(text,birth){
 const t=norm(text);let m,d={type:'unknown'};
 if((m=t.match(/\b(\d{4})-(\d{2})-(\d{2})\b/)))d={type:'exact',exact:`${m[1]}-${m[2]}-${m[3]}`};
 else if((m=t.match(/\b(\d{1,2})[/.](\d{1,2})[/.](\d{4})\b/)))d={type:'exact',exact:`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`};
 else if((m=t.match(/\b(\d{1,2})(?:er)?\s+(janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre)\s+(\d{4})\b/)))d={type:'exact',exact:`${m[3]}-${String(MONTHS.map(norm).indexOf(m[2])+1).padStart(2,'0')}-${m[1].padStart(2,'0')}`};
 else if((m=t.match(/\b(?:de|entre)\s+(\d{4})\s*(?:a|et|-)\s*(\d{4})\b/)))d={type:'range',start:+m[1],end:+m[2]};
 else if((m=t.match(/\b(printemps|ete|automne|hiver)\s+(?:de\s+)?(\d{4})\b/)))d={type:'season',season:{printemps:'spring',ete:'summer',automne:'autumn',hiver:'winter'}[m[1]],year:+m[2]};
 else if((m=t.match(/\b(janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre)\s+(\d{4})\b/)))d={type:'month',month:`${m[2]}-${String(MONTHS.map(norm).indexOf(m[1])+1).padStart(2,'0')}`};
 else if((m=t.match(/\b(?:vers|environ|autour de)\s+(\d{4})\b/)))d={type:'approx',year:+m[1]};
 else if((m=t.match(/\b(?:19|20)\d{2}\b/)))d={type:'year',year:+m[0]};
 else if((m=t.match(/\b(?:a|vers|avais)\s+(\d{1,2})\s+ans\b/))&&birth){const y=birth.year||Number(birth.exact?.slice(0,4));if(y)d={type:'approx',year:y+Number(m[1])};}
 else if(/\baujourd'hui\b/.test(t))d={type:'exact',exact:today()};
 else if(/\bhier\b/.test(t)){const n=new Date();n.setDate(n.getDate()-1);d={type:'exact',exact:`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`};}
 return validateDate(d)?{type:'unknown'}:d;
}
export function draft(text,source='Mon récit',birth){
 const t=norm(text);const category=/voyag|vacanc|sejour|camping|avion/.test(t)?'travel':/demenag|emm[eé]nag|habite|installe|appartement|maison/.test(t)?'places':/ecole|etude|lycee|diplome|universite/.test(t)?'study':/travail|emploi|entreprise|carriere/.test(t)?'work':/ne[e]? |naiss|enfant|rencontr|mari|famille/.test(t)?'people':'daily';
 const place=text.match(/(?:né(?:e)?|habitais|habitais|déménagé|emménagé|installé(?:e)?|arrivé(?:e)?|vivais|voyage|vacances|séjour)\s+(?:à|au|en)\s+([\p{L}][\p{L} '-]{1,55}?)(?=\s+(?:en\s+(?:\d|janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|été|hiver|automne|printemps)|avec|puis|et\b|le\s+\d)|[,.;!?]|$)/iu)?.[1]?.trim()||'';
 return {id:id(),title:text.replace(/\s+/g,' ').trim().slice(0,90),text:text.trim(),date:extractDate(text,birth),category,place,people:[],status:'uncertain',source,clues:[]};
}
export function parseStory(text,birth){return text.trim().split(/\n+|(?<=[.!?])\s+|\s+(?:puis|ensuite)\s+/iu).map(s=>s.trim()).filter(s=>s.length>3).slice(0,30).map(s=>draft(s,'Mon récit',birth));}
const unescapeICS=s=>s.replace(/\\[nN]/g,'\n').replace(/\\([,;\\])/g,'$1');
export function parseICS(text){
 if(text.length>3000000)throw Error('Calendrier trop volumineux. Choisis une période plus courte.');
 const lines=text.replace(/\r\n[ \t]/g,'').replace(/\n[ \t]/g,'').split(/\r?\n/),out=[];let ev=null;
 for(const l of lines){if(l==='BEGIN:VEVENT'){ev={};continue;}if(l==='END:VEVENT'){if(ev?.SUMMARY&&ev.STATUS!=='CANCELLED'){const raw=ev.DTSTART||'',d=/^(\d{4})(\d{2})(\d{2})/.exec(raw);const m=draft(unescapeICS(ev.SUMMARY),'Calendrier importé : événement prévu');m.text=unescapeICS(ev.DESCRIPTION||ev.SUMMARY);m.place=unescapeICS(ev.LOCATION||'');m.date=d?{type:'exact',exact:`${d[1]}-${d[2]}-${d[3]}`}:{type:'unknown'};if(!validateDate(m.date))out.push(m);}ev=null;continue;}if(ev){const colon=l.indexOf(':');if(colon>=0)ev[l.slice(0,colon).split(';')[0]]=l.slice(colon+1);}}
 return out.slice(0,300);
}
export function encodePacket(p){const bytes=new TextEncoder().encode(JSON.stringify({...p,v:1}));if(bytes.length>14000)throw Error('Ce souvenir est trop long pour un lien. Raccourcis le texte ou utilise un fichier.');let binary='';for(const b of bytes)binary+=String.fromCharCode(b);return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
export function decodePacket(str){if(str.length>20000||!/^[\w-]+$/.test(str))throw Error('Lien invalide ou trop long.');const p=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(str.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))));if(p.v!==1||!['memory','reply'].includes(p.kind))throw Error('Ce lien n’est pas compatible.');const s=(v,n)=>typeof v==='string'?v.slice(0,n):'';const clean={v:1,kind:p.kind,requestId:s(p.requestId,100),memoryId:s(p.memoryId,100),scope:['own','demo'].includes(p.scope)?p.scope:'own',title:s(p.title,100),text:s(p.text,6000),person:s(p.person,100),question:s(p.question,500),place:s(p.place,200),date:validateDate(p.date)?{type:'unknown'}:p.date};if(!clean.requestId||!clean.text.trim())throw Error('Ce lien est incomplet.');return clean;}
export function readExif(buffer){
 const view=new DataView(buffer);let base=-1;
 try{if(view.getUint16(0)!==0xffd8)return {};let p=2;while(p+4<view.byteLength){const marker=view.getUint16(p),size=view.getUint16(p+2);if(marker===0xffe1&&view.getUint32(p+4)===0x45786966){base=p+10;break;}if(size<2)break;p+=size+2;}if(base<0)return {};
 const little=view.getUint16(base)===0x4949,u16=p=>view.getUint16(p,little),u32=p=>view.getUint32(p,little),result={};
 const dir=offset=>{const p=base+offset,n=u16(p),map={};if(n>300)return map;for(let i=0;i<n;i++){const e=p+2+i*12,tag=u16(e),type=u16(e+2),count=u32(e+4),size=({1:1,2:1,3:2,4:4,5:8}[type]||1)*count;map[tag]={p:size<=4?e+8:base+u32(e+8),type,count};}return map;};
 const ascii=e=>{if(!e||e.count>500)return '';return new TextDecoder().decode(new Uint8Array(buffer,e.p,e.count)).replace(/\0/g,'');};
 const first=dir(u32(base+4)),ex=first[0x8769]?dir(u32(first[0x8769].p)):first;const ds=ascii(ex[0x9003]||ex[0x9004]||first[0x132]);const dm=/^(\d{4}):(\d{2}):(\d{2})/.exec(ds);if(dm){const date={type:'exact',exact:`${dm[1]}-${dm[2]}-${dm[3]}`};if(!validateDate(date))result.date=date;}
 if(first[0x8825]){const gps=dir(u32(first[0x8825].p)),r=e=>{if(!e||e.count!==3)return NaN;let sum=0;for(let i=0;i<3;i++)sum+=u32(e.p+i*8)/u32(e.p+i*8+4)/[1,60,3600][i];return sum;};let lat=r(gps[2]),lon=r(gps[4]);if(ascii(gps[1])==='S')lat=-lat;if(ascii(gps[3])==='W')lon=-lon;if(Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180)result.gps={lat,lon};}return result;
 }catch{return {};}
}
export async function photoDraft(file){
 if(file.size>30000000)throw Error('Photo trop volumineuse (30 Mo maximum).');
 const meta=readExif(await file.arrayBuffer()),url=URL.createObjectURL(file);
 try{const img=new Image();img.src=url;await img.decode();const c=document.createElement('canvas'),ratio=Math.min(1,900/Math.max(img.width,img.height));c.width=Math.round(img.width*ratio);c.height=Math.round(img.height*ratio);c.getContext('2d').drawImage(img,0,0,c.width,c.height);return {...draft('Un moment en photo','Photo importée : date EXIF si disponible'),date:meta.date||{type:'unknown'},photo:c.toDataURL('image/jpeg',.72),gps:meta.gps,place:meta.gps?`${meta.gps.lat.toFixed(4)}, ${meta.gps.lon.toFixed(4)}`:''};}finally{URL.revokeObjectURL(url);}
}

export function mergeSuggestions(text,suggestions,birth){
 const normal=s=>s.replace(/\s+/g,' ').trim().toLowerCase(),original=normal(text);
 const verified=(Array.isArray(suggestions)?suggestions:[]).filter(x=>typeof x.extrait==='string'&&x.extrait.length>3&&original.includes(normal(x.extrait)));
 return parseStory(text,birth).map(m=>{const suggestion=verified.find(x=>normal(m.text).includes(normal(x.extrait)));return suggestion&&typeof suggestion.titre==='string'&&suggestion.titre.trim()?{...m,title:suggestion.titre.slice(0,100),source:'Mon récit, titre proposé par l’IA locale'}:m;});
}
