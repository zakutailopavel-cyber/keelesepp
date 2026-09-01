(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.WorksheetInteractiveCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  const normalize=value=>String(value??'').trim().toLocaleLowerCase('et-EE');
  const equal=(value,expected)=>normalize(value)===normalize(expected);
  const normalizeDictation=value=>normalize(value)
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}\s]/gu,' ')
    .replace(/\s+/g,' ')
    .trim();
  const equalSet=(value,expected)=>{
    const actual=[...(Array.isArray(value)?value:[])].map(Number).filter(Number.isInteger).sort((a,b)=>a-b);
    const target=[...(Array.isArray(expected)?expected:[])].map(Number).filter(Number.isInteger).sort((a,b)=>a-b);
    return actual.length===target.length&&actual.every((item,index)=>item===target[index]);
  };
  const initialComicOrder=block=>Array.from({length:(block?.panels||[]).length},(_,index)=>index).reverse();
  const result=()=>({correct:0,total:0,errors:[]});
  const add=(state,ok,error)=>{state.total+=1;if(ok)state.correct+=1;else if(error)state.errors.push(error);};

  function scoreBlock(block={},answers={}){
    const state=result(),id=String(block.id||'');
    if(block.type==='connect'){
      (block.pairs||[]).forEach((pair,index)=>{
        const target=Number(answers[id+'_'+index]);
        add(state,target===index,{type:'connect',correct:pair?.r||'',given:Number.isInteger(target)?(block.pairs?.[target]?.r||'(vale vaste)'):'(ühendamata)'});
      });
    }else if(block.type==='image_label'){
      (block.items||[]).forEach((item,index)=>{const given=answers[id+'_label_'+index]||'';add(state,equal(given,item?.answer),{type:'image_label',correct:item?.answer||'',given:given||'(tühi)'});});
    }else if(block.type==='diagram'){
      (block.nodes||[]).forEach((node,index)=>{if(!node?.blank)return;const given=answers[id+'_node_'+index]||'';add(state,equal(given,node?.text),{type:'diagram',correct:node?.text||'',given:given||'(tühi)'});});
    }else if(block.type==='comic'&&block.taskMode==='complete'){
      (block.panels||[]).forEach((panel,index)=>{if(panel?.blank===false)return;const given=answers[id+'_panel_'+index]||'';add(state,equal(given,panel?.text),{type:'comic',correct:panel?.text||'',given:given||'(tühi)'});});
    }else if(block.type==='comic'&&block.taskMode==='order'){
      const order=answers[id+'_order']||initialComicOrder(block);
      (block.panels||[]).forEach((panel,index)=>add(state,Number(order[index])===index,{type:'comic_order',correct:String(index+1),given:String(Number(order[index])+1)}));
    }else if(block.type==='true_false'){
      (block.statements||[]).forEach((statement,index)=>{
        const key=id+'_tf_'+index,given=answers[key];
        add(state,typeof given==='boolean'&&given===Boolean(statement?.correct),{type:'true_false',question:statement?.text||'',correct:statement?.correct?'Tõene':'Väär',given:typeof given==='boolean'?(given?'Tõene':'Väär'):'(vastamata)'});
      });
    }else if(block.type==='multi_select'){
      (block.questions||[]).forEach((question,index)=>{
        const given=answers[id+'_multi_'+index]||[];
        add(state,equalSet(given,question?.correct),{type:'multi_select',question:question?.q||'',correct:(question?.correct||[]).map(option=>question?.opts?.[option]).filter(Boolean).join(', '),given:(Array.isArray(given)?given:[]).map(option=>question?.opts?.[option]).filter(Boolean).join(', ')||'(vastamata)'});
      });
    }else if(block.type==='dictation'){
      (block.sentences||[]).forEach((sentence,index)=>{
        const given=answers[id+'_dictation_'+index]||'';
        add(state,normalizeDictation(given)===normalizeDictation(sentence?.text),{type:'dictation',correct:sentence?.text||'',given:given||'(tühi)'});
      });
    }else if(block.type==='audio'||block.type==='video'){
      (block.questions||[]).forEach((question,index)=>{
        const given=answers[id+'_media_'+index];
        add(state,Number.isInteger(given)&&given===question?.correct,{type:block.type,question:question?.q||'',correct:question?.opts?.[question?.correct]||'',given:Number.isInteger(given)?(question?.opts?.[given]||'(vale vastus)'):'(vastamata)'});
      });
    }
    return state;
  }

  function scoreWorksheet(blocks=[],answers={}){
    return (Array.isArray(blocks)?blocks:[]).reduce((total,block)=>{const current=scoreBlock(block,answers);total.correct+=current.correct;total.total+=current.total;total.errors.push(...current.errors.map(error=>({...error,blockId:block.id||'',blockLabel:block.label||block.instruction||block.type||''})));return total;},result());
  }

  return {normalize,equal,normalizeDictation,equalSet,initialComicOrder,scoreBlock,scoreWorksheet};
});
