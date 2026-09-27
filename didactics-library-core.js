(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.DidacticsLibraryCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const CATEGORIES=['Raamat','Õpetajaraamat','Metoodika','Tööleht','Mäng','Kaardid','Hindamine','Muu'];
  const LANGUAGES=['Eesti','Vene','Inglise','Muu'];
  const MAX_FILE_SIZE=100*1024*1024;
  const ALLOWED_EXTENSIONS=['pdf','epub','doc','docx','ppt','pptx','txt','rtf','jpg','jpeg','png','webp'];
  const normalize=value=>String(value||'').trim().toLocaleLowerCase('et-EE');
  const titleFromFileName=name=>String(name||'')
    .replace(/\.[^.]+$/,'')
    .replace(/[_-]+/g,' ')
    .replace(/\s+/g,' ')
    .trim();
  const extension=name=>normalize(String(name||'').split('.').pop());
  function validateFile(file){
    if(!file||!file.name)return {ok:false,message:'Faili nimi puudub.'};
    if(!ALLOWED_EXTENSIONS.includes(extension(file.name)))return {ok:false,message:'Toetatud on PDF, EPUB, Word, PowerPoint, TXT ja pildifailid.'};
    if(!Number(file.size)||file.size<=0)return {ok:false,message:'Fail on tühi.'};
    if(file.size>MAX_FILE_SIZE)return {ok:false,message:'Ühe faili suurus võib olla kuni 100 MB.'};
    return {ok:true,message:''};
  }
  function storagePath(uid,fileName,stamp){
    const safe=String(fileName||'book').replace(/[^a-zA-Z0-9._-]+/g,'_').slice(-140);
    return `didactics/${String(uid||'unknown').replace(/[^a-zA-Z0-9_-]/g,'')}/${Number(stamp)||Date.now()}_${safe}`;
  }
  function searchableText(item){
    return normalize([
      item?.title,item?.author,item?.description,item?.category,item?.subject,item?.level,
      item?.language,...(Array.isArray(item?.tags)?item.tags:[]),item?.file?.name
    ].filter(Boolean).join(' '));
  }
  function filterItems(items,filters){
    const query=normalize(filters?.query);
    return (items||[]).filter(item=>{
      if(filters?.category&&filters.category!=='all'&&item.category!==filters.category)return false;
      if(filters?.subject&&filters.subject!=='all'&&item.subject!==filters.subject)return false;
      if(filters?.language&&filters.language!=='all'&&item.language!==filters.language)return false;
      return !query||searchableText(item).includes(query);
    });
  }
  function uniqueValues(items,key){
    return [...new Set((items||[]).map(item=>String(item?.[key]||'').trim()).filter(Boolean))]
      .sort((a,b)=>a.localeCompare(b,'et',{numeric:true,sensitivity:'base'}));
  }
  function uploadDraft(file,defaults){
    return {
      title:titleFromFileName(file.name)||'Pealkirjata materjal',author:'',description:'',
      category:defaults?.category||'Raamat',subject:defaults?.subject||'Üldine',
      level:defaults?.level||'Kõik tasemed',language:defaults?.language||'Eesti',
      tags:Array.isArray(defaults?.tags)?defaults.tags:[],status:'active'
    };
  }
  return {CATEGORIES,LANGUAGES,MAX_FILE_SIZE,ALLOWED_EXTENSIONS,titleFromFileName,validateFile,storagePath,searchableText,filterItems,uniqueValues,uploadDraft};
});
