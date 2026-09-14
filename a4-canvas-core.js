(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.KeeleSeppA4Canvas=api;})(typeof window!=='undefined'?window:globalThis,function(){
  const SPANS=[12,8,6,4];
  const copy=value=>JSON.parse(JSON.stringify(value));
  function normalize(input){
    const draft=copy(input),activities=draft.activities||[];
    draft.authoring=draft.authoring||{};draft.authoring.activities=draft.authoring.activities||{};
    activities.forEach((activity,index)=>{
      const meta=draft.authoring.activities[activity.id]||(draft.authoring.activities[activity.id]={});
      const current=meta.a4||{};
      meta.a4={page:Math.max(1,Math.floor(Number(current.page)||1)),span:SPANS.includes(Number(current.span))?Number(current.span):12,order:Number.isFinite(current.order)?current.order:index};
    });
    return draft;
  }
  function setLayout(input,id,patch){
    const draft=normalize(input),meta=draft.authoring.activities[id];if(!meta)throw Error('Plokki ei leitud.');
    if(patch.span!==undefined&&!SPANS.includes(Number(patch.span)))throw Error('Ploki laius peab olema 4, 6, 8 või 12 veergu.');
    if(patch.page!==undefined&&(!Number.isInteger(Number(patch.page))||Number(patch.page)<1||Number(patch.page)>30))throw Error('Lehekülg peab olema 1–30.');
    meta.a4={...meta.a4,...patch,...(patch.span!==undefined?{span:Number(patch.span)}:{}),...(patch.page!==undefined?{page:Number(patch.page)}:{})};return draft;
  }
  function pages(input){
    const draft=normalize(input),grouped=new Map();
    draft.activities.forEach((activity,index)=>{const layout=draft.authoring.activities[activity.id].a4,page=layout.page;const list=grouped.get(page)||[];list.push({activity,index,layout});grouped.set(page,list);});
    const max=Math.max(1,...grouped.keys());return Array.from({length:max},(_,i)=>(grouped.get(i+1)||[]).sort((a,b)=>a.layout.order-b.layout.order||a.index-b.index));
  }
  function move(input,id,beforeId,page){
    const draft=normalize(input),activity=draft.activities.find(a=>a.id===id);if(!activity)return draft;
    const targetPage=Number(page)||draft.authoring.activities[id].a4.page;draft.authoring.activities[id].a4.page=targetPage;
    const ordered=draft.activities.filter(a=>a.id!==id).filter(a=>draft.authoring.activities[a.id].a4.page===targetPage);
    const at=ordered.findIndex(a=>a.id===beforeId);ordered.splice(at<0?ordered.length:at,0,activity);ordered.forEach((a,index)=>{draft.authoring.activities[a.id].a4.order=index;});return draft;
  }
  function addPage(input){const draft=normalize(input),max=Math.max(1,...draft.activities.map(a=>draft.authoring.activities[a.id].a4.page));draft.authoring.a4={...(draft.authoring.a4||{}),pageCount:max+1};return draft;}
  function pageCount(input){const draft=normalize(input);return Math.max(Number(draft.authoring.a4?.pageCount)||1,...draft.activities.map(a=>draft.authoring.activities[a.id].a4.page));}
  return {SPANS,normalize,setLayout,pages,move,addPage,pageCount};
});
