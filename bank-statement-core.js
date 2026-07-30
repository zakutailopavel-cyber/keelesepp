(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  root.BankStatementCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const hash=value=>{
    let result=0;
    const text=String(value||'');
    for(let index=0;index<text.length;index++) result=(Math.imul(31,result)+text.charCodeAt(index))|0;
    return result;
  };

  const csvCells=line=>{
    const cells=[];
    let value='';
    let quoted=false;
    for(let index=0;index<line.length;index++){
      const char=line[index];
      if(char==='"'&&quoted&&line[index+1]==='"'){
        value+='"';
        index++;
      }else if(char==='"'){
        quoted=!quoted;
      }else if(char===','&&!quoted){
        cells.push(value);
        value='';
      }else{
        value+=char;
      }
    }
    cells.push(value);
    return cells;
  };

  const splitLine=line=>{
    if(line.includes('\t')) return line.split('\t');
    if(line.includes(';')) return line.split(';');
    return csvCells(line);
  };

  const isoDate=value=>{
    const raw=String(value||'').trim().replace(/^"|"$/g,'');
    const local=raw.match(/^(\d{2})[./](\d{2})[./](\d{4})$/);
    const iso=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const normalized=local?`${local[3]}-${local[2]}-${local[1]}`:iso?raw:'';
    if(!normalized) return '';
    const parsed=new Date(`${normalized}T12:00:00.000Z`);
    return !Number.isNaN(parsed.getTime())&&parsed.toISOString().slice(0,10)===normalized
      ?normalized
      :'';
  };

  const amountValue=value=>{
    const normalized=String(value||'')
      .trim()
      .replace(/^"|"$/g,'')
      .replace(/[€\s]/g,'')
      .replace(',','.');
    const amount=Number(normalized);
    return Number.isFinite(amount)&&amount>0?amount:null;
  };

  const parseStatementDetailed=text=>{
    const sourceLines=String(text||'').split(/\r?\n/);
    const rows=[];
    const skipped=[];
    const duplicateCounts={};
    sourceLines.forEach((sourceLine,index)=>{
      const line=sourceLine.trim();
      if(!line) return;
      const parts=splitLine(line).map(part=>String(part||'').trim().replace(/^"|"$/g,''));
      if(parts.length!==4){
        skipped.push({line:index+1,reason:'expected_four_columns'});
        return;
      }
      const [rawDate,payer,desc,rawAmount]=parts;
      const iso=isoDate(rawDate);
      if(!iso){
        skipped.push({line:index+1,reason:index===0?'header_or_invalid_date':'invalid_date'});
        return;
      }
      if(!payer){
        skipped.push({line:index+1,reason:'missing_payer'});
        return;
      }
      const amount=amountValue(rawAmount);
      if(amount===null){
        skipped.push({line:index+1,reason:'invalid_amount'});
        return;
      }
      const baseId='p'+Math.abs(hash(`${iso}|${payer}|${desc}|${amount}`)).toString(36);
      duplicateCounts[baseId]=(duplicateCounts[baseId]||0)+1;
      const id=duplicateCounts[baseId]===1?baseId:`${baseId}_${duplicateCounts[baseId]}`;
      rows.push({
        id,
        iso,
        date:`${iso.slice(8,10)}.${iso.slice(5,7)}.${iso.slice(0,4)}`,
        month:iso.slice(5,7),
        payer,
        desc,
        amount
      });
    });
    return {
      rows,
      totalLines:sourceLines.filter(line=>line.trim()).length,
      skippedLines:skipped.length,
      skipped
    };
  };

  const parseStatement=text=>parseStatementDetailed(text).rows;

  return {
    parseStatement,
    parseStatementDetailed
  };
});
