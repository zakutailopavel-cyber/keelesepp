(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.CurriculumDocumentCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const MAX_BYTES=20*1024*1024-1;
  const ACCEPT='.pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.gif,.txt';
  const IMAGE_EXTENSIONS=new Set(['jpg','jpeg','png','webp','gif']);
  const DOCUMENT_EXTENSIONS=new Set(['pdf','doc','docx','ppt','pptx','txt']);
  function extension(name){return String(name||'').split('.').pop().toLowerCase();}
  function previewKind(file){const ext=extension(file&&file.name);const type=String(file&&file.type||'').toLowerCase();if(type.startsWith('image/')||IMAGE_EXTENSIONS.has(ext))return'image';if(type==='application/pdf'||ext==='pdf')return'pdf';if(type.startsWith('text/')||ext==='txt')return'text';return'download';}
  function validate(file){if(!file||!file.name)return{ok:false,message:'Faili nime ei õnnestunud lugeda.'};const ext=extension(file.name);if(!IMAGE_EXTENSIONS.has(ext)&&!DOCUMENT_EXTENSIONS.has(ext))return{ok:false,message:'See failitüüp ei ole toetatud. Vali PDF, Word, PowerPoint, pilt või TXT.'};if(!Number(file.size))return{ok:false,message:'Fail on tühi.'};if(Number(file.size)>MAX_BYTES)return{ok:false,message:'Fail on liiga suur. Maksimaalne suurus on 20 MB.'};return{ok:true,message:''};}
  function formatBytes(bytes){const value=Number(bytes)||0;if(value<1024)return value+' B';if(value<1024*1024)return(value/1024).toFixed(value<10240?1:0)+' KB';return(value/(1024*1024)).toFixed(1)+' MB';}
  function safeStorageName(name){return String(name||'document').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(-120)||'document';}
  function storagePath(file,now){return'curriculum/'+(now||Date.now())+'_'+safeStorageName(file&&file.name);}
  return{MAX_BYTES,ACCEPT,extension,previewKind,validate,formatBytes,safeStorageName,storagePath};
});
