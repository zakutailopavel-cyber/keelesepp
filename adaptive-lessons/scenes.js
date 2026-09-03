(function(root){
  const BUCKET='keelesepp-5136b.firebasestorage.app';
  const storageUrl=path=>`https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(path)}?alt=media`;

  const registry={
    'bus-delay-01':{
      id:'bus-delay-01',
      storagePath:'lesson-scenes/est-b1-city-problem-solving-01/bus-delay-01.jpg',
      alt:'Vihmases bussipeatuses küsib noor naine viisakalt võõralt inimeselt abi; taustal on buss ja elektrooniline sõiduplaan.',
      purpose:'Õpilane kasutab pilti olukorra mõistmiseks, probleemi kirjeldamiseks, viisakaks abi küsimiseks ja lahenduste arutamiseks.',
      focusVocabularyIds:['hilinema','abi-kusima','selgitama','lahendus']
    }
  };

  // lesson-scenes/** is intentionally public-read in Firebase Storage rules.
  // The images are non-sensitive teaching assets; staff-only writes remain protected.
  Object.values(registry).forEach(scene=>{ scene.src=storageUrl(scene.storagePath); });

  const bindings={
    d1:'bus-delay-01',
    d2:'bus-delay-01',
    d3:'bus-delay-01',
    d4:'bus-delay-01',
    d5:'bus-delay-01',
    'stage-2-language':'bus-delay-01',
    'stage-3-speaking-transfer':'bus-delay-01'
  };

  const bound={};
  Object.entries(bindings).forEach(([taskId,sceneId])=>{ bound[taskId]=registry[sceneId]; });

  root.KeeleSeppLessonSceneRegistry=registry;
  root.KeeleSeppLessonSceneBindings=bindings;
  root.KeeleSeppLessonScenes={...bound,default:registry['bus-delay-01']};
})(typeof window!=='undefined'?window:globalThis);