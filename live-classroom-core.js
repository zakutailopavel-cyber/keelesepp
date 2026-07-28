(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.LiveClassroomCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  const cleanText=(value,max=2000)=>String(value??'').trim().slice(0,max);
  const escapeHtml=value=>String(value??'')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
  const getRoles=profile=>{
    const roles=new Set(Array.isArray(profile?.roles)?profile.roles:[]);
    if(profile?.role) roles.add(profile.role);
    if(profile?.parentRole||profile?.isParent) roles.add('parent');
    if(profile?.studentRole||profile?.isStudent) roles.add('student');
    return Array.from(roles);
  };
  const isStaff=profile=>getRoles(profile).some(role=>role==='admin'||role==='teacher');
  const sceneTypes=new Set(['welcome','message','choice','short_answer','screen']);
  const normalizeOptions=options=>(Array.isArray(options)?options:String(options||'').split('\n'))
    .map(option=>cleanText(option,180))
    .filter(Boolean)
    .slice(0,8);
  const buildScene=({type='message',title='',body='',options=[],version=1}={})=>{
    const normalizedType=sceneTypes.has(type)?type:'message';
    const scene={
      type:normalizedType,
      title:cleanText(title,160),
      body:cleanText(body,4000),
      options:normalizeOptions(options),
      version:Math.max(1,Number.parseInt(version,10)||1),
      publishedAt:new Date().toISOString()
    };
    if(normalizedType==='choice'&&scene.options.length<2){
      throw new Error('Valikvastusega ülesanne vajab vähemalt kahte vastust.');
    }
    if((normalizedType==='message'||normalizedType==='choice'||normalizedType==='short_answer')&&!scene.title&&!scene.body){
      throw new Error('Lisa enne avaldamist pealkiri või juhis.');
    }
    return scene;
  };
  const sceneAcceptsResponse=scene=>scene?.type==='choice'||scene?.type==='short_answer';
  const isUnsafeDisplaySurface=surface=>String(surface||'').toLowerCase()==='monitor';
  const classroomLink=(origin,roomId)=>`${String(origin||'').replace(/\/$/,'')}/live-classroom/?room=${encodeURIComponent(roomId||'')}`;
  const responseLabel=response=>{
    if(!response) return '';
    return cleanText(response.answer||response.option||'',1000);
  };
  return {
    cleanText,
    escapeHtml,
    getRoles,
    isStaff,
    normalizeOptions,
    buildScene,
    sceneAcceptsResponse,
    isUnsafeDisplaySurface,
    classroomLink,
    responseLabel
  };
});
