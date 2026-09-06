(function(){
  if(typeof location==='undefined')return;
  const token=new URLSearchParams(location.search).get('authoringPreview');
  if(token===null)return;
  // This dedicated mode cannot acquire a studentId, even if one is added to the URL.
  window.KeeleSeppAuthoringPreview={requested:true,lesson:null};
  try{
    if(!/^[a-f0-9-]{36}$/.test(token))throw new Error('Invalid preview token');
    const raw=sessionStorage.getItem('keelesepp.authoring-preview.'+token);
    window.KeeleSeppAuthoringPreview.lesson=window.KeeleSeppLessonAuthoring.previewLesson(window.KeeleSeppLessonAuthoring.parse(raw));
  }catch(error){window.KeeleSeppAuthoringPreview.error=error.message;}
})();
