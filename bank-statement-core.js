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

  const delimitedCells=(line,delimiter)=>{
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
      }else if(char===delimiter&&!quoted){
        cells.push(value);
        value='';
      }else{
        value+=char;
      }
    }
    cells.push(value);
    return cells;
  };

  const delimiterCount=(line,delimiter)=>{
    let count=0;
    let quoted=false;
    for(let index=0;index<line.length;index++){
      const char=line[index];
      if(char==='"'&&quoted&&line[index+1]==='"'){
        index++;
      }else if(char==='"'){
        quoted=!quoted;
      }else if(char===delimiter&&!quoted){
        count++;
      }
    }
    return count;
  };

  const statementDelimiter=line=>{
    const candidates=['\t',';',',']
      .map(delimiter=>({delimiter,count:delimiterCount(line,delimiter)}))
      .sort((left,right)=>right.count-left.count);
    return candidates[0]?.count?candidates[0].delimiter:',';
  };

  const splitLine=(line,delimiter)=>delimitedCells(line,delimiter);

  const headerKey=value=>String(value||'')
    .toLocaleLowerCase('et-EE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,' ')
    .trim();

  const HEADER_ALIASES={
    date:['kuupaev','date','booking date','transaction date'],
    payer:['saaja maksja nimi','maksja nimi','maksja','payer name','counterparty name','name'],
    amount:['summa','amount'],
    description:['selgitus','description','details','payment details'],
    reference:['viitenumber','reference number','payment reference','reference'],
    direction:['deebet kreedit d c','debit credit d c','debit credit','direction'],
    currency:['valuuta','currency'],
    archiveId:['arhiveerimistunnus','archive id'],
    entryReference:['kande viide','entry reference','transaction id'],
    providerReference:['konto teenusepakkuja viide','provider reference'],
    documentNumber:['dokumendi number','document number'],
    counterpartyAccount:['saaja maksja konto','counterparty account']
  };

  const headerIndex=(keys,aliases)=>{
    const accepted=new Set(aliases);
    return keys.findIndex(key=>accepted.has(key));
  };

  const bankSchema=cells=>{
    const keys=cells.map(headerKey);
    const schema=Object.fromEntries(
      Object.entries(HEADER_ALIASES).map(([field,aliases])=>[field,headerIndex(keys,aliases)])
    );
    if(schema.date<0||schema.payer<0||schema.amount<0) return null;
    return {
      ...schema,
      columnCount:cells.length,
      format:keys.includes('arhiveerimistunnus')&&keys.includes('konto teenusepakkuja viide')
        ?'swedbank_csv'
        :'bank_csv',
      formatLabel:keys.includes('arhiveerimistunnus')&&keys.includes('konto teenusepakkuja viide')
        ?'Swedbank CSV'
        :'Panga CSV'
    };
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
    const firstSourceLine=sourceLines.find(line=>line.trim())||'';
    const delimiter=statementDelimiter(firstSourceLine);
    const firstCells=splitLine(firstSourceLine.trim(),delimiter)
      .map(part=>String(part||'').trim().replace(/^"|"$/g,''));
    const schema=bankSchema(firstCells);
    let outgoingLines=0;
    let unsupportedCurrencyLines=0;
    sourceLines.forEach((sourceLine,index)=>{
      const line=sourceLine.trim();
      if(!line) return;
      const parts=splitLine(line,statementDelimiter(line)).map(part=>String(part||'').trim().replace(/^"|"$/g,''));
      if(schema&&index===sourceLines.indexOf(firstSourceLine)) return;
      if(!schema&&parts.length!==4){
        skipped.push({line:index+1,reason:'expected_four_columns'});
        return;
      }
      if(schema&&parts.length<schema.columnCount){
        skipped.push({line:index+1,reason:'incomplete_bank_row'});
        return;
      }
      const field=name=>schema?.[name]>=0?parts[schema[name]]||'':'';
      const rawDate=schema?field('date'):parts[0];
      const payer=schema?field('payer'):parts[1];
      const bankDescription=schema?field('description'):parts[2];
      const bankReference=schema?field('reference'):'';
      const desc=[bankReference,bankDescription].map(value=>String(value||'').trim()).filter(Boolean).join(' · ');
      const rawAmount=schema?field('amount'):parts[3];
      const direction=headerKey(field('direction'));
      if(schema&&['d','debit','deebet'].includes(direction)){
        outgoingLines++;
        skipped.push({line:index+1,reason:'outgoing_payment'});
        return;
      }
      const currency=String(field('currency')||'EUR').trim().toUpperCase();
      if(schema&&currency&&currency!=='EUR'){
        unsupportedCurrencyLines++;
        skipped.push({line:index+1,reason:'unsupported_currency'});
        return;
      }
      const iso=isoDate(rawDate);
      if(!iso){
        skipped.push({line:index+1,reason:'invalid_date'});
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
      const sourceId=schema
        ?[field('archiveId'),field('entryReference'),field('providerReference'),field('documentNumber')]
          .map(value=>String(value||'').trim()).find(Boolean)||''
        :'';
      const baseId='p'+Math.abs(hash(sourceId
        ?`${schema.format}|${sourceId}|${amount}`
        :`${iso}|${payer}|${desc}|${amount}`)).toString(36);
      duplicateCounts[baseId]=(duplicateCounts[baseId]||0)+1;
      const id=duplicateCounts[baseId]===1?baseId:`${baseId}_${duplicateCounts[baseId]}`;
      rows.push({
        id,
        iso,
        date:`${iso.slice(8,10)}.${iso.slice(5,7)}.${iso.slice(0,4)}`,
        month:iso.slice(5,7),
        payer,
        desc,
        amount,
        currency,
        sourceId,
        sourceFormat:schema?.format||'four_column',
        counterpartyAccount:schema?field('counterpartyAccount'):'',
        lineNumber:index+1
      });
    });
    return {
      rows,
      totalLines:sourceLines.filter(line=>line.trim()).length,
      skippedLines:skipped.length,
      skipped,
      outgoingLines,
      unsupportedCurrencyLines,
      format:schema?.format||'four_column',
      formatLabel:schema?.formatLabel||'4 veergu',
      delimiter:delimiter==='\t'?'tab':delimiter===';'?'semicolon':'comma'
    };
  };

  const parseStatement=text=>parseStatementDetailed(text).rows;

  return {
    parseStatement,
    parseStatementDetailed
  };
});
