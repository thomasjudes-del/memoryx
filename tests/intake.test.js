import test from 'node:test';
import assert from 'node:assert/strict';
import {extractDate,mergeSuggestions,parseStory,parseICS,encodePacket,decodePacket,readExif} from '../v2/intake.js';
test('French narrative preserves exact, approximate and missing dates',()=>{
 assert.deepEqual(extractDate('Je suis né le 3 février 1980.'),{type:'exact',exact:'1980-02-03'});
 assert.deepEqual(extractDate('J’ai déménagé en septembre 2016.'),{type:'month',month:'2016-09'});
 assert.deepEqual(extractDate('Vers 2018, nouveau métier.'),{type:'approx',year:2018});
 assert.deepEqual(extractDate('À 10 ans, je découvre la mer.',{type:'exact',exact:'1980-02-03'}),{type:'approx',year:1990});
 assert.deepEqual(extractDate('Un repas avec Léa.'),{type:'unknown'});
 assert.deepEqual(extractDate('Le 31 février 2010'),{type:'unknown'});
});
test('multiple events are proposed without merging or making up people',()=>{
 const items=parseStory('Je suis né à Nantes en 1980. Puis j’ai déménagé à Lyon en 2016.');
 assert.equal(items.length,2);assert.equal(items[0].place,'Nantes');assert.equal(items[1].place,'Lyon');assert.deepEqual(items[1].people,[]);assert.equal(items[1].status,'uncertain');
});
test('calendar import unfolds text and ignores cancellations',()=>{
 const text='BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nSUMMARY:Un grand\r\n  voyage\r\nDTSTART;TZID=Europe/Paris:20230514T090000\r\nLOCATION:Lyon\\, France\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nSUMMARY:Annulé\r\nSTATUS:CANCELLED\r\nEND:VEVENT\r\nEND:VCALENDAR';
 const list=parseICS(text);assert.equal(list.length,1);assert.equal(list[0].title,'Un grand voyage');assert.equal(list[0].date.exact,'2023-05-14');assert.equal(list[0].place,'Lyon, France');assert.equal(list[0].status,'uncertain');
});
test('share packets round-trip accents and reject corrupted or oversized payloads',()=>{
 const p={kind:'memory',requestId:'request',memoryId:'mem',scope:'own',title:'Été à Lyon',text:'Un souvenir avec Léa 🌞',date:{type:'year',year:2019}};
 const result=decodePacket(encodePacket(p));assert.equal(result.text,p.text);assert.equal(result.title,p.title);assert.equal(result.date.year,2019);
 assert.throws(()=>decodePacket('bad!'));assert.throws(()=>encodePacket({...p,text:'a'.repeat(15000)}));assert.throws(()=>decodePacket(encodePacket({...p,kind:'admin'})));
});
test('invalid images and malformed EXIF do not invent dates or locations',()=>{
 assert.deepEqual(readExif(new ArrayBuffer(0)),{});assert.deepEqual(readExif(new Uint8Array([255,216,255,225,0,40]).buffer),{});
});
test('JPEG EXIF extraction uses capture date rather than file modification time',()=>{
 const b=new ArrayBuffer(100),v=new DataView(b);v.setUint16(0,0xffd8);v.setUint16(2,0xffe1);v.setUint16(4,90);v.setUint32(6,0x45786966);const base=12;v.setUint16(base,0x4949);v.setUint16(base+2,42,true);v.setUint32(base+4,8,true);v.setUint16(base+8,1,true);v.setUint16(base+10,0x132,true);v.setUint16(base+12,2,true);v.setUint32(base+14,20,true);v.setUint32(base+18,30,true);new Uint8Array(b,base+30,20).set(new TextEncoder().encode('2019:07:14 12:00:00\0'));assert.deepEqual(readExif(b).date,{type:'exact',exact:'2019-07-14'});
});

test('AI suggestions cannot drop events or their dates',()=>{const text='En 2010, je suis allé à Rennes. En 2018, je pars à Lyon.';const list=mergeSuggestions(text,[{extrait:'je suis allé à Rennes',titre:'Voyage à Rennes'},{extrait:'Je suis astronaute',titre:'Dans l’espace'}]);assert.equal(list.length,2);assert.equal(list[0].date.year,2010);assert.equal(list[1].date.year,2018);assert.equal(list[0].title,'Voyage à Rennes');assert(!list.some(x=>x.title.includes('espace')));});
