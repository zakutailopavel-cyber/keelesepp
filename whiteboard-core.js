(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.WhiteboardCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const finite=value=>Number.isFinite(Number(value))?Number(value):0;

  function toInternalPoints(points){
    if(!Array.isArray(points)) return [];
    if(points.length&&typeof points[0]==='number'){
      const result=[];
      for(let index=0;index+1<points.length;index+=2){
        result.push([finite(points[index]),finite(points[index+1])]);
      }
      return result;
    }
    return points.map(point=>{
      if(Array.isArray(point)) return [finite(point[0]),finite(point[1])];
      return [finite(point?.x),finite(point?.y)];
    });
  }

  function toFirestorePoints(points){
    return toInternalPoints(points).map(([x,y])=>({x,y}));
  }

  function hydrateElement(fields){
    const hydrated={...(fields||{})};
    if(hydrated.type==='stroke') hydrated.points=toInternalPoints(hydrated.points);
    return hydrated;
  }

  function persistElement(fields){
    const persisted={...(fields||{})};
    if(persisted.type==='stroke') persisted.points=toFirestorePoints(persisted.points);
    return persisted;
  }

  return {toInternalPoints,toFirestorePoints,hydrateElement,persistElement};
});
