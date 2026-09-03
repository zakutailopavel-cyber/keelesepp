(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  root.KeeleSeppLearningProfileCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  const cleanText=(value,max=240)=>String(value??'').replace(/\s+/g,' ').trim().slice(0,max);
  const unique=values=>Array.from(new Set((Array.isArray(values)?values:[]).filter(Boolean)));

  const clampScore=value=>{
    if(value===null||value===undefined||value==='') return null;
    const number=Number(value);
    if(!Number.isFinite(number)) return null;
    return Math.max(0,Math.min(100,Math.round(number)));
  };

  const skillStatus=score=>{
    const value=clampScore(score);
    if(value===null) return 'untested';
    if(value<50) return 'focus';
    if(value<70) return 'caution';
    if(value>=80) return 'strong';
    return 'developing';
  };

  const humanizeSkillId=id=>{
    const raw=cleanText(id,80);
    if(!raw) return 'Tundmatu oskus';
    const withoutLevel=raw.replace(/^(A1|A2|B1|B2|C1)[_-]/i,'');
    return withoutLevel
      .toLowerCase()
      .split(/[_-]+/)
      .filter(Boolean)
      .map((part,index)=>index===0?part.charAt(0).toUpperCase()+part.slice(1):part)
      .join(' ');
  };

  const timestampMillis=value=>{
    if(!value) return 0;
    if(typeof value.toMillis==='function') return value.toMillis();
    if(typeof value.toDate==='function') return value.toDate().getTime();
    if(value.seconds!==undefined) return Number(value.seconds)*1000;
    const parsed=Date.parse(value);
    return Number.isFinite(parsed)?parsed:0;
  };

  const normalizeSummaryEvidence=room=>{
    if(!room||typeof room!=='object'||!room.lessonSummary) return null;
    const summary=room.lessonSummary||{};
    const skillIds=unique(summary.curriculumSkillIds).map(id=>cleanText(id,80)).filter(Boolean);
    const goalIds=unique(summary.curriculumGoalIds).map(id=>cleanText(id,100)).filter(Boolean);
    const goalLabels=unique(summary.curriculumGoalLabels?.length?summary.curriculumGoalLabels:summary.achievedGoals)
      .map(label=>cleanText(label,160)).filter(Boolean);
    const completedAt=room.endedAt||room.completedAt||room.updatedAt||room.createdAt||null;
    return {
      id:cleanText(room.id||room.roomId||'',100),
      source:'live_classroom_summary',
      title:cleanText(room.title||room.lessonTitle||'Lõpetatud tund',160),
      teacherName:cleanText(room.teacherName||room.teacher||'',120),
      completedAt,
      completedAtMillis:timestampMillis(completedAt),
      teacherComment:cleanText(summary.teacherComment||'',600),
      nextHomework:cleanText(summary.nextHomework||'',400),
      goalIds,
      goalLabels,
      skillIds,
      summaryVersion:Number(room.summaryVersion||1)||1
    };
  };

  const normalizeSkillMap=skillMap=>{
    if(!skillMap||typeof skillMap!=='object'||Array.isArray(skillMap)) return {};
    return Object.entries(skillMap).reduce((result,[id,value])=>{
      const cleanId=cleanText(id,80);
      const score=clampScore(value);
      if(cleanId&&score!==null) result[cleanId]=score;
      return result;
    },{});
  };

  const buildLearningProfile=({student={},rooms=[],skillLabels={},recentLimit=6}={})=>{
    const skillMap=normalizeSkillMap(student.skillMap);
    const skills=Object.entries(skillMap)
      .map(([id,score])=>({
        id,
        score,
        status:skillStatus(score),
        label:cleanText(skillLabels[id],160)||humanizeSkillId(id)
      }))
      .sort((a,b)=>a.score-b.score||a.label.localeCompare(b.label));

    const focusSkills=skills.filter(skill=>skill.status==='focus');
    const cautionSkills=skills.filter(skill=>skill.status==='caution');
    const strongSkills=skills.filter(skill=>skill.status==='strong').sort((a,b)=>b.score-a.score);
    const developingSkills=skills.filter(skill=>skill.status==='developing');

    const recentEvidence=(Array.isArray(rooms)?rooms:[])
      .filter(room=>!student.id||room?.studentId===student.id)
      .map(normalizeSummaryEvidence)
      .filter(Boolean)
      .sort((a,b)=>b.completedAtMillis-a.completedAtMillis)
      .slice(0,Math.max(1,Math.min(20,Number(recentLimit)||6)));

    const recentSkillIds=unique(recentEvidence.flatMap(item=>item.skillIds));
    const recentGoalIds=unique(recentEvidence.flatMap(item=>item.goalIds));
    const recentGoalLabels=unique(recentEvidence.flatMap(item=>item.goalLabels));

    const assessedCount=skills.length;
    const average=assessedCount?Math.round(skills.reduce((sum,skill)=>sum+skill.score,0)/assessedCount):null;
    const attention=[...focusSkills,...cautionSkills].slice(0,6);

    return {
      studentId:cleanText(student.id||student.studentId||'',100),
      studentName:cleanText(student.name||student.fullName||'Õpilane',160),
      currentLevel:cleanText(student.level||student.cefrLevel||'',20),
      subject:cleanText(student.subject||'Eesti keel',80),
      teacher:cleanText(student.teacher||'',120),
      skillMap,
      skills,
      summary:{
        assessedCount,
        average,
        focusCount:focusSkills.length,
        cautionCount:cautionSkills.length,
        strongCount:strongSkills.length,
        developingCount:developingSkills.length,
        evidenceCount:recentEvidence.length
      },
      focusSkills,
      cautionSkills,
      strongSkills,
      attention,
      recentEvidence,
      recommendations:{
        focusSkillIds:focusSkills.map(skill=>skill.id),
        cautionSkillIds:cautionSkills.map(skill=>skill.id),
        reviewVocabularyIds:[],
        nextGoalIds:[],
        recentGoalIds,
        recentGoalLabels,
        recentSkillIds
      }
    };
  };

  return {
    clampScore,
    skillStatus,
    humanizeSkillId,
    timestampMillis,
    normalizeSummaryEvidence,
    normalizeSkillMap,
    buildLearningProfile
  };
});
