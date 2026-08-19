(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.StudentExportCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  const clean=value=>String(value??'').trim();
  const normalize=value=>clean(value).toLowerCase();
  const unique=values=>[...new Set(values.map(clean).filter(Boolean))];
  const escapeHtml=value=>clean(value)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
  const isoDate=value=>/^\d{4}-\d{2}-\d{2}/.test(clean(value))?clean(value).slice(0,10):'';
  const formatDate=value=>{
    const date=isoDate(value);
    if(!date) return '';
    const [year,month,day]=date.split('-');
    return `${day}.${month}.${year}`;
  };
  const numberValue=value=>Number.isFinite(Number(value))?Number(value):0;
  const lessonDate=lesson=>isoDate(lesson?.date||lesson?.lessonDate||lesson?.startDate||lesson?.createdAt);
  const lessonBelongsToStudent=(lesson,student)=>{
    const studentId=clean(student?.id);
    const lessonStudentId=clean(lesson?.studentId);
    if(studentId&&lessonStudentId) return studentId===lessonStudentId;
    return !lessonStudentId&&normalize(lesson?.studentName||lesson?.name)===normalize(student?.name);
  };
  const studentLessons=(student,lessons=[])=>lessons.filter(lesson=>lessonBelongsToStudent(lesson,student));
  const isCancelled=lesson=>['tühistatud','cancelled','canceled'].includes(normalize(lesson?.status));
  const isCompleted=lesson=>['toimunud','completed','complete'].includes(normalize(lesson?.status));
  const fallbackPackageSummary=student=>{
    const total=Math.max(0,numberValue(student?.packageTotal));
    const used=Math.max(0,numberValue(student?.packageUsed));
    return {total,used,remaining:Math.max(0,total-used)};
  };
  const buildStudentExportRows=({students=[],lessons=[],packageSummary}={})=>students.map((student,index)=>{
    const related=studentLessons(student,lessons);
    const counted=related.filter(lesson=>!isCancelled(lesson));
    const completed=related.filter(isCompleted);
    const latestDate=counted.map(lessonDate).filter(Boolean).sort().at(-1)||'';
    const packageData=typeof packageSummary==='function'?packageSummary(student):fallbackPackageSummary(student);
    const packageTotal=Math.max(0,numberValue(packageData?.total));
    const packageUsed=Math.max(0,numberValue(packageData?.used));
    const packageRemaining=Math.max(0,numberValue(packageData?.remaining));
    return {
      index:index+1,
      id:clean(student.id),
      name:clean(student.name)||'Nimeta õpilane',
      status:student.active===false?'Arhiveeritud':'Aktiivne',
      subject:clean(student.subject),
      level:clean(student.level),
      targetLevel:clean(student.targetLevel),
      levelPath:unique([student.level,student.targetLevel]).join(' → '),
      grade:clean(student.grade),
      group:clean(student.group),
      teacher:clean(student.teacher),
      email:clean(student.email||student.contactEmail),
      phone:clean(student.phone),
      parentName:clean(student.parentName||student.guardianName),
      parentEmail:clean(student.parentEmail||student.guardianEmail),
      totalLessons:counted.length,
      completedLessons:completed.length,
      lastLessonDate:latestDate,
      lastLessonLabel:formatDate(latestDate),
      packageTotal,
      packageUsed,
      packageRemaining,
      packageLabel:packageTotal>0?`${packageRemaining} / ${packageTotal}`:'—',
      createdAt:isoDate(student.createdAt),
      createdAtLabel:formatDate(student.createdAt),
      contactStatus:clean(student.contactStatus||student.profileStatus),
    };
  });

  const reportColumns=[
    {key:'index',label:'Nr'},
    {key:'name',label:'Nimi'},
    {key:'status',label:'Staatus'},
    {key:'subject',label:'Õppeaine'},
    {key:'levelPath',label:'Tase'},
    {key:'grade',label:'Klass'},
    {key:'group',label:'Grupp'},
    {key:'teacher',label:'Õpetaja'},
    {key:'email',label:'E-post'},
    {key:'phone',label:'Telefon'},
    {key:'parentName',label:'Lapsevanem'},
    {key:'parentEmail',label:'Lapsevanema e-post'},
    {key:'completedLessons',label:'Tunde'},
    {key:'lastLessonLabel',label:'Viimane tund'},
    {key:'packageLabel',label:'Pakett alles'},
  ];
  const excelColumns=[
    {key:'index',label:'Nr',width:7},
    {key:'name',label:'Nimi',width:26},
    {key:'status',label:'Staatus',width:15},
    {key:'subject',label:'Õppeaine',width:18},
    {key:'level',label:'Praegune tase',width:15},
    {key:'targetLevel',label:'Eesmärk',width:12},
    {key:'grade',label:'Klass',width:14},
    {key:'group',label:'Grupp',width:22},
    {key:'teacher',label:'Õpetaja',width:24},
    {key:'email',label:'E-post',width:30},
    {key:'phone',label:'Telefon',width:18},
    {key:'parentName',label:'Lapsevanem',width:25},
    {key:'parentEmail',label:'Lapsevanema e-post',width:30},
    {key:'totalLessons',label:'Tunde kokku',width:14},
    {key:'completedLessons',label:'Toimunud tunde',width:16},
    {key:'lastLessonDate',label:'Viimane tund',width:15},
    {key:'packageTotal',label:'Pakett kokku',width:14},
    {key:'packageUsed',label:'Pakett kasutatud',width:17},
    {key:'packageRemaining',label:'Pakett alles',width:14},
    {key:'createdAt',label:'Loodud',width:14},
  ];
  const metaLines=metadata=>[
    `Koostatud: ${clean(metadata?.generatedAtLabel)||formatDate(new Date().toISOString())}`,
    `Koostaja: ${clean(metadata?.generatedBy)||'KeeleSepp'}`,
    `Õpilasi: ${numberValue(metadata?.count)}`,
    `Filtrid: ${clean(metadata?.filterSummary)||'Kõik'}`,
  ];
  const exportBaseName=metadata=>{
    const date=isoDate(metadata?.generatedAt||new Date().toISOString())||'valjavote';
    return `keelesepp-opilased-${date}`;
  };
  const buildWordDocument=(rows,metadata={})=>{
    const headers=reportColumns.map(column=>`<th>${escapeHtml(column.label)}</th>`).join('');
    const body=rows.map(row=>`<tr>${reportColumns.map(column=>`<td>${escapeHtml(row[column.key])}</td>`).join('')}</tr>`).join('');
    const details=metaLines({...metadata,count:rows.length}).map(line=>`<span>${escapeHtml(line)}</span>`).join('');
    return `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="et"><head><meta charset="UTF-8"><title>Õpilaste väljavõte</title><style>@page{size:A4 landscape;margin:12mm}body{font-family:Arial,sans-serif;color:#172033;font-size:8pt}h1{font-size:18pt;margin:0 0 5pt;color:#13213a}.meta{display:flex;gap:12pt;flex-wrap:wrap;color:#56657d;margin:0 0 10pt}table{width:100%;border-collapse:collapse;table-layout:fixed}thead{display:table-header-group}th{background:#17324d;color:#fff;font-weight:700}th,td{border:1px solid #cfd7e3;padding:4pt 3pt;vertical-align:middle;word-wrap:break-word}tbody tr:nth-child(even){background:#f3f7fa}</style></head><body><h1>Õpilaste väljavõte</h1><div class="meta">${details}</div><table><thead><tr>${headers}</tr></thead><tbody>${body}</tbody></table></body></html>`;
  };
  const buildPdfDefinition=(rows,metadata={})=>({
    pageSize:'A4',pageOrientation:'landscape',pageMargins:[24,28,24,28],
    info:{title:'KeeleSepp õpilaste väljavõte',author:clean(metadata.generatedBy)||'KeeleSepp'},
    defaultStyle:{font:'Roboto',fontSize:6.5,color:'#172033'},
    styles:{title:{fontSize:16,bold:true,color:'#13213a',margin:[0,0,0,4]},meta:{fontSize:7.5,color:'#56657d',margin:[0,0,0,10]},tableHeader:{bold:true,color:'#ffffff',fillColor:'#17324d',fontSize:6.5}},
    content:[
      {text:'Õpilaste väljavõte',style:'title'},
      {text:metaLines({...metadata,count:rows.length}).join('   ·   '),style:'meta'},
      {table:{headerRows:1,dontBreakRows:true,widths:[16,70,36,42,34,36,38,56,66,44,54,62,26,35,32],body:[
        reportColumns.map(column=>({text:column.label,style:'tableHeader'})),
        ...rows.map(row=>reportColumns.map(column=>clean(row[column.key])||'—')),
      ]},layout:{fillColor:rowIndex=>rowIndex>0&&rowIndex%2===0?'#f3f7fa':null,hLineColor:'#cfd7e3',vLineColor:'#cfd7e3',paddingLeft:()=>3,paddingRight:()=>3,paddingTop:()=>3,paddingBottom:()=>3}},
    ],
    footer:(currentPage,pageCount)=>({text:`KeeleSepp · ${currentPage}/${pageCount}`,alignment:'center',fontSize:7,color:'#718096',margin:[0,8,0,0]}),
  });
  const excelTableRows=rows=>rows.map(row=>excelColumns.map(column=>{
    if(['index','totalLessons','completedLessons','packageTotal','packageUsed','packageRemaining'].includes(column.key)) return numberValue(row[column.key]);
    if(['lastLessonDate','createdAt'].includes(column.key)&&isoDate(row[column.key])) return new Date(`${isoDate(row[column.key])}T00:00:00`);
    return clean(row[column.key]);
  }));
  const downloadBlob=(blob,fileName)=>{
    if(typeof document==='undefined'||typeof URL==='undefined') throw new Error('Faili allalaadimine pole selles keskkonnas saadaval');
    const url=URL.createObjectURL(blob);const link=document.createElement('a');
    link.href=url;link.download=fileName;document.body.appendChild(link);link.click();link.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),1500);
  };
  const scriptPromises=new Map();
  const loadScript=(src,globalName,force=false)=>{
    if(typeof window==='undefined') return Promise.reject(new Error('Brauser pole saadaval'));
    if(!force&&window[globalName]) return Promise.resolve(window[globalName]);
    if(scriptPromises.has(src)) return scriptPromises.get(src);
    const promise=new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src=src;script.async=true;
      const timer=window.setTimeout(()=>reject(new Error(`Teeki ${globalName} ei õnnestunud laadida`)),20000);
      script.onload=()=>{window.clearTimeout(timer);window[globalName]?resolve(window[globalName]):reject(new Error(`Teek ${globalName} ei käivitunud`));};
      script.onerror=()=>{window.clearTimeout(timer);reject(new Error(`Teeki ${globalName} ei õnnestunud laadida`));};
      document.head.appendChild(script);
    });
    scriptPromises.set(src,promise);return promise;
  };
  const ensurePdfMake=async()=>{
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js','pdfMake');
    if(!window.pdfMake?.vfs) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/vfs_fonts.js','pdfMake',true);
    return window.pdfMake;
  };
  const ensureExcelJs=()=>loadScript('https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js','ExcelJS');
  const downloadWord=(rows,metadata={})=>{
    const html=buildWordDocument(rows,metadata);
    downloadBlob(new Blob(['\ufeff',html],{type:'application/msword;charset=utf-8'}),`${exportBaseName(metadata)}.doc`);
  };
  const downloadPdf=async(rows,metadata={})=>{
    const pdfMake=await ensurePdfMake();
    pdfMake.createPdf(buildPdfDefinition(rows,metadata)).download(`${exportBaseName(metadata)}.pdf`);
  };
  const downloadExcel=async(rows,metadata={})=>{
    const ExcelJS=await ensureExcelJs();const workbook=new ExcelJS.Workbook();
    workbook.creator=clean(metadata.generatedBy)||'KeeleSepp';workbook.created=new Date(metadata.generatedAt||Date.now());
    const sheet=workbook.addWorksheet('Õpilased',{views:[{state:'frozen',ySplit:6}]});
    sheet.mergeCells(1,1,1,excelColumns.length);const title=sheet.getCell(1,1);title.value='KeeleSepp · Õpilaste väljavõte';title.font={bold:true,size:18,color:{argb:'FF13213A'}};title.alignment={vertical:'middle'};sheet.getRow(1).height=28;
    metaLines({...metadata,count:rows.length}).forEach((line,index)=>{sheet.mergeCells(2+index,1,2+index,excelColumns.length);const cell=sheet.getCell(2+index,1);cell.value=line;cell.font={size:10,color:{argb:'FF56657D'}};});
    const tableStart=6;
    sheet.addTable({name:'OpilasteValjavote',ref:`A${tableStart}`,headerRow:true,totalsRow:false,style:{theme:'TableStyleMedium2',showRowStripes:true},columns:excelColumns.map(column=>({name:column.label})),rows:excelTableRows(rows)});
    excelColumns.forEach((column,index)=>{sheet.getColumn(index+1).width=column.width;});
    sheet.getRow(tableStart).height=24;sheet.getRow(tableStart).font={bold:true,color:{argb:'FFFFFFFF'}};
    ['P','T'].forEach(column=>{sheet.getColumn(column).numFmt='yyyy-mm-dd';});
    sheet.autoFilter={from:{row:tableStart,column:1},to:{row:tableStart+rows.length,column:excelColumns.length}};
    const buffer=await workbook.xlsx.writeBuffer();
    downloadBlob(new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),`${exportBaseName(metadata)}.xlsx`);
  };
  return {buildPdfDefinition,buildStudentExportRows,buildWordDocument,downloadExcel,downloadPdf,downloadWord,excelColumns,excelTableRows,exportBaseName,formatDate,reportColumns,studentLessons};
});
