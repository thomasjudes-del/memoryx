// Optional models run on-device. No user text or audio is sent to a server.
let library,writer,listener;
self.onmessage=async ev=>{const {type,payload,job}=ev.data,send=(status,data={})=>self.postMessage({job,status,...data});
 try{
  library ||= await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2/dist/transformers.min.js');
  const {pipeline,env}=library;env.allowLocalModels=false;env.backends.onnx.wasm.numThreads=1;
  const progress_callback=p=>{if(p.status==='progress')send('progress',{text:`Téléchargement local : ${Math.round(p.progress||0)} % (${p.file||'modèle'})`});};
  if(type==='organize'){
   if(listener){await listener.dispose();listener=null;}
   writer ||= await pipeline('text-generation','onnx-community/Qwen2.5-0.5B-Instruct',{device:'wasm',dtype:'q4',progress_callback});
   send('progress',{text:'Le modèle organise ton récit sur cet appareil…'});
   const out=await writer([{role:'system',content:'Réponds uniquement par un tableau JSON. Découpe le récit en événements. Chaque objet a un titre court "titre" et un "extrait" copié EXACTEMENT du récit. Ne complète rien, n’invente rien. Maximum 8 objets.'},{role:'user',content:payload}],{max_new_tokens:350,do_sample:false,return_full_text:false});
   const generated=out[0].generated_text;send('done',{text:typeof generated==='string'?generated:generated.at(-1).content});
  }else{
   if(writer){await writer.dispose();writer=null;}
   listener ||= await pipeline('automatic-speech-recognition','onnx-community/whisper-tiny',{device:'wasm',dtype:'q8',progress_callback});
   send('progress',{text:'Transcription sur cet appareil…'});
   const out=await listener(payload,{task:'transcribe',chunk_length_s:20,stride_length_s:3,max_new_tokens:256,repetition_penalty:1.1,no_repeat_ngram_size:4});const words=out.text.trim().toLowerCase().split(/\s+/);if(!out.text.trim()||(words.length>30&&new Set(words).size<8))throw Error('Unreliable transcription');send('done',{text:out.text});
  }
 }catch(error){send('error',{text:String(error.message||error)});}
};
