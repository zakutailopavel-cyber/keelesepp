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

  // Desktop density override for Lesson Mode. Keep this scoped to desktop only;
  // the mobile layout remains governed by the page's existing media query.
  if(typeof document!=='undefined'){
    const style=document.createElement('style');
    style.id='adaptive-lesson-desktop-density';
    style.textContent=`
      @media (min-width:761px){
        .layout{grid-template-columns:165px minmax(0,1fr)!important}
        .stages{padding:18px 10px!important}
        .stage{padding:8px!important;grid-template-columns:26px 1fr!important;gap:7px!important}
        .num{width:25px!important;height:25px!important;font-size:.66rem!important}
        .main{padding:20px 28px 88px!important}
        .inner{max-width:980px!important}
        .lesson-head{gap:14px!important;margin-bottom:10px!important}
        .lesson-head h1{font-size:1.42rem!important}
        .progress{margin-bottom:12px!important}
        .content{padding:22px 26px 18px!important}
        .prompt{font-size:1.46rem!important;line-height:1.25!important;margin:8px 0!important}
        .scene{margin:14px auto 16px!important;max-width:860px!important;border-radius:16px!important}
        .scene img{height:min(390px,42vh)!important;aspect-ratio:auto!important;object-fit:contain!important;background:#171717!important}
        .scene-fallback{min-height:180px!important;padding:24px!important}
        .expected{padding:11px 14px!important;font-size:.8rem!important;line-height:1.4!important}
        .help-btn{padding:10px 13px!important}
        .judge{padding:12px 20px 14px!important}
        .judge-title{font-size:.72rem!important;margin-bottom:8px!important}
        .judge button{min-height:58px!important;padding:8px!important;border-radius:13px!important}
        .nav{margin-top:10px!important}
      }
    `;
    document.head.appendChild(style);
  }
})(typeof window!=='undefined'?window:globalThis);