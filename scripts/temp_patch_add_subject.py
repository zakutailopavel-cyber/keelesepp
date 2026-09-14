from pathlib import Path

p=Path('haldus-exercises/index.html')
s=p.read_text(encoding='utf-8')

old="""function CurriculumView({lessons,isTeacher,user,notify,onPreviewWorksheet,onConductLesson}){
  const[nav,setNav]=useState(null); // null | {subject} | {subject,level,topic}
  const[modal,setModal]=useState(null);

  const subject=nav?.subject?SUBJECTS.find(s=>s.key===nav.subject):null;
"""
new="""function CurriculumView({lessons,isTeacher,user,notify,onPreviewWorksheet,onConductLesson}){
  const[nav,setNav]=useState(null); // null | {subject} | {subject,level,topic}
  const[modal,setModal]=useState(null);

  const customSubjects=useMemo(()=>lessons.filter(l=>l.__subjectPlaceholder&&l.subject).map(l=>({
    key:l.subject,
    emoji:l.subjectEmoji||'📚',
    color:l.subjectColor||'#5B6B7A',
    grad:'linear-gradient(90deg,#5B6B7A,#8796A5)',
    cardBg:'#F2F0EB',cardBorder:'#D9D4C8',iconBg:'rgba(91,107,122,.12)',pillBg:'rgba(91,107,122,.1)',pillColor:'#5B6B7A',
    levels:Array.isArray(l.subjectLevels)&&l.subjectLevels.length?l.subjectLevels:['Üldine'],topics:[]
  })),[lessons]);
  const subjectDefs=useMemo(()=>[...SUBJECTS,...customSubjects.filter(c=>!SUBJECTS.some(s=>s.key===c.key))],[customSubjects]);
  const subject=nav?.subject?subjectDefs.find(s=>s.key===nav.subject):null;
"""
assert old in s, 'CurriculumView anchor missing'
s=s.replace(old,new,1)

old="""          {SUBJECTS.map(s=>{
            const cnt=lessons.filter(l=>l.subject===s.key).length;
"""
new="""          {subjectDefs.map(s=>{
            const cnt=lessons.filter(l=>l.subject===s.key&&!l.__subjectPlaceholder).length;
"""
assert old in s, 'Curriculum subject cards anchor missing'
s=s.replace(old,new,1)

old="""function LearningLibraryView({lessons,exercises,students,isTeacher,onOpenLesson,onOpenExercise,onAssign,onClassroom,onGoCurriculum,onGoExercises,onConductLesson}){
  const[query,setQuery]=useState('');
  const[type,setType]=useState('all');
  const[path,setPath]=useState(()=>libraryPathFromSearch(window.location.search));
  const items=useMemo(()=>buildLibraryItems(lessons,exercises),[lessons,exercises]);
"""
new="""function LearningLibraryView({lessons,exercises,students,isTeacher,onOpenLesson,onOpenExercise,onAssign,onClassroom,onGoCurriculum,onGoExercises,onConductLesson}){
  const[query,setQuery]=useState('');
  const[type,setType]=useState('all');
  const[path,setPath]=useState(()=>libraryPathFromSearch(window.location.search));
  const items=useMemo(()=>buildLibraryItems(lessons,exercises),[lessons,exercises]);
  const customSubjectMarkers=useMemo(()=>lessons.filter(l=>l.__subjectPlaceholder&&l.subject),[lessons]);
  const subjectDefs=useMemo(()=>[
    ...SUBJECTS,
    ...customSubjectMarkers
      .filter(marker=>!SUBJECTS.some(subject=>subject.key===marker.subject))
      .map(marker=>({key:marker.subject,emoji:marker.subjectEmoji||'📚',color:marker.subjectColor||'#5B6B7A',levels:Array.isArray(marker.subjectLevels)&&marker.subjectLevels.length?marker.subjectLevels:['Üldine']}))
  ],[customSubjectMarkers]);
"""
assert old in s, 'LearningLibraryView anchor missing'
s=s.replace(old,new,1)

old="""  useEffect(()=>{
    if(!items.length) return;
    const safePath=normalizeLibraryPath(items,path);
    if(safePath.subject===path.subject&&safePath.stage===path.stage&&safePath.topic===path.topic) return;
"""
new="""  useEffect(()=>{
    if(!items.length&&!customSubjectMarkers.length) return;
    const marker=customSubjectMarkers.find(item=>item.subject===path.subject);
    const markerLevels=Array.isArray(marker?.subjectLevels)&&marker.subjectLevels.length?marker.subjectLevels:['Üldine'];
    if(marker&&!path.topic&&(!path.stage||markerLevels.includes(path.stage))) return;
    const safePath=normalizeLibraryPath(items,path);
    if(safePath.subject===path.subject&&safePath.stage===path.stage&&safePath.topic===path.topic) return;
"""
assert old in s, 'Library normalization anchor missing'
s=s.replace(old,new,1)
assert "  },[items,path.subject,path.stage,path.topic]);" in s
s=s.replace("  },[items,path.subject,path.stage,path.topic]);","  },[items,customSubjectMarkers,path.subject,path.stage,path.topic]);",1)

old="""  const folderSource=useMemo(()=>type==='all'?scoped:scoped.filter(item=>item.type===type),[scoped,type]);
  const folders=useMemo(()=>folderDimension&&!query?groupLibraryItems(folderSource,folderDimension):[],[folderSource,folderDimension,query]);
"""
new="""  const folderSource=useMemo(()=>type==='all'?scoped:scoped.filter(item=>item.type===type),[scoped,type]);
  const groupedFolders=useMemo(()=>folderDimension&&!query?groupLibraryItems(folderSource,folderDimension):[],[folderSource,folderDimension,query]);
  const folders=useMemo(()=>{
    if(query||type!=='all') return groupedFolders;
    const extra=[];
    if(folderDimension==='subject'){
      const existing=new Set(groupedFolders.map(folder=>folder.key));
      subjectDefs.forEach(subject=>{if(!existing.has(subject.key)&&customSubjectMarkers.some(marker=>marker.subject===subject.key))extra.push({key:subject.key,label:subject.key,count:0,items:[],typeCounts:{}});});
    }
    if(folderDimension==='stage'){
      const marker=customSubjectMarkers.find(item=>item.subject===path.subject);
      const levels=Array.isArray(marker?.subjectLevels)&&marker.subjectLevels.length?marker.subjectLevels:['Üldine'];
      const existing=new Set(groupedFolders.map(folder=>folder.key));
      levels.forEach(stage=>{if(!existing.has(stage))extra.push({key:stage,label:stage,count:0,items:[],typeCounts:{}});});
    }
    return [...groupedFolders,...extra].sort((a,b)=>a.label.localeCompare(b.label,'et',{numeric:true,sensitivity:'base'}));
  },[groupedFolders,folderDimension,query,type,subjectDefs,customSubjectMarkers,path.subject]);
"""
assert old in s, 'Library folders anchor missing'
s=s.replace(old,new,1)

assert "  const subjectDefinition=SUBJECTS.find(candidate=>candidate.key===path.subject);" in s
s=s.replace("  const subjectDefinition=SUBJECTS.find(candidate=>candidate.key===path.subject);","  const subjectDefinition=subjectDefs.find(candidate=>candidate.key===path.subject);",1)
assert "?(SUBJECTS.find(candidate=>candidate.key===folder.key)?.color||'#2F5D50')" in s
s=s.replace("?(SUBJECTS.find(candidate=>candidate.key===folder.key)?.color||'#2F5D50')","?(subjectDefs.find(candidate=>candidate.key===folder.key)?.color||'#2F5D50')",1)
assert "          const subjectIcon=SUBJECTS.find(candidate=>candidate.key===folder.key)?.emoji;" in s
s=s.replace("          const subjectIcon=SUBJECTS.find(candidate=>candidate.key===folder.key)?.emoji;","          const subjectIcon=subjectDefs.find(candidate=>candidate.key===folder.key)?.emoji;",1)

anchor="""  const openFolder=folder=>{
    setQuery('');
    if(folderDimension==='subject') navigatePath({subject:folder.key,stage:'',topic:''});
    if(folderDimension==='stage') navigatePath({...path,stage:folder.key,topic:''});
    if(folderDimension==='topic') navigatePath({...path,topic:folder.key});
  };
"""
insert=anchor+"""  const addSubject=async()=>{
    const rawName=window.prompt('Uue aine nimi');
    const name=String(rawName||'').trim().slice(0,80);
    if(!name)return;
    if(subjectDefs.some(subject=>subject.key.toLocaleLowerCase('et-EE')===name.toLocaleLowerCase('et-EE'))){window.alert('See aine on juba olemas.');return;}
    const rawLevels=window.prompt('Tasemed või klassid komadega (nt A1, A2, B1, B2, C1 või 1. klass, 2. klass). Jäta tühjaks, et kasutada taset “Üldine”.','');
    const levels=String(rawLevels||'').split(',').map(value=>value.trim()).filter(Boolean).slice(0,20);
    const currentUser=auth.currentUser;
    try{
      await db.collection('curriculumLessons').add({
        type:'material',title:'—',description:'',subject:name,level:'',topic:'',
        __placeholder:true,__subjectPlaceholder:true,
        subjectLevels:levels.length?levels:['Üldine'],subjectEmoji:'📚',
        authorUid:currentUser?.uid||'',authorName:currentUser?.displayName||currentUser?.email||'',
        createdAt:today(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      });
    }catch(error){console.error('Add subject:',error);window.alert('Aine lisamine ebaõnnestus: '+error.message);}
  };
"""
assert anchor in s, 'openFolder anchor missing'
s=s.replace(anchor,insert,1)

old="""        {isTeacher&&<div className=\"library-actions\">
          <button onClick={onGoCurriculum} className=\"btn btn-ghost\"><i className=\"fa-solid fa-plus\"/> Lisa materjal</button>
"""
new="""        {isTeacher&&<div className=\"library-actions\">
          {depth===0&&<button onClick={addSubject} className=\"btn btn-ghost\"><i className=\"fa-solid fa-folder-plus\"/> Lisa aine</button>}
          <button onClick={onGoCurriculum} className=\"btn btn-ghost\"><i className=\"fa-solid fa-plus\"/> Lisa materjal</button>
"""
assert old in s, 'Library actions anchor missing'
s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')
print('patched')
