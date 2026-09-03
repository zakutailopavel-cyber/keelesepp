(function(root){
  const bus={
    src:'/adaptive-lessons/scenes/bus-delay-v2.jpg',
    version:'2026-09-03-v2',
    alt:'Vihmases bussipeatuses küsib noor naine viisakalt võõralt inimeselt, kui kaua buss hilineb; taustal on buss ja elektrooniline sõiduplaan.',
    purpose:'Õpilane kasutab pilti olukorra mõistmiseks, probleemi kirjeldamiseks, viisakaks abi küsimiseks ja lahenduste arutamiseks.'
  };
  root.KeeleSeppLessonScenes={
    default:bus,
    d1:bus,d2:bus,d3:bus,d4:bus,d5:bus,
    'stage-2-language':bus,
    'stage-3-speaking-transfer':bus
  };
})(typeof window!=='undefined'?window:globalThis);
