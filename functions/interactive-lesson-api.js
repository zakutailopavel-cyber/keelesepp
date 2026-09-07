'use strict';
const functions=require('firebase-functions/v1'),admin=require('firebase-admin');
const {randomUUID}=require('node:crypto');
const {FieldValue,FieldPath}=require('firebase-admin/firestore');
const core=require('./lesson-contract/interactive-lesson-core');
const {allowedOrigin,validate}=require('./lesson-drafts-api')._test;
if(!admin.apps.length)admin.initializeApp();const db=admin.firestore();
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const id=x=>{if(typeof x!=='string'||!/^[A-Za-z0-9_-]{1,160}$/.test(x))fail(400,'Invalid ID');return x;};
const wire=x=>x?.toDate?x.toDate().toISOString():Array.isArray(x)?x.map(wire):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,wire(v)])):x;
async function actor(req){const token=(req.get('Authorization')||'').match(/^Bearer (.+)$/i)?.[1];if(!token)fail(401,'Sign in required');let decoded;try{decoded=await admin.auth().verifyIdToken(token,true);}catch{fail(401,'Invalid token');}const p=(await db.doc('users/'+decoded.uid).get()).data();if(!p||p.disabled===true||p.status==='disabled'||!['teacher','admin','student'].includes(p.role))fail(403,'Account not allowed');return{uid:decoded.uid,role:p.role};}
const teacher=a=>a.role==='teacher'||a.role==='admin';
function access(a,r){if(a.role==='admin')return;if(teacher(a)&&r.teacherUid===a.uid)return;if(a.role==='student'&&r.studentUid===a.uid)return;fail(403,'Assignment not accessible');}
function checked(fn){try{return fn();}catch(e){fail(400,e.message);}}
async function execute(a,b){
  if(b.action==='students'){
    if(!teacher(a))fail(403,'Teacher required');
    let q=db.collection('students');if(a.role!=='admin')q=q.where('teacherUid','==',a.uid);q=q.orderBy(FieldPath.documentId()).limit(50);if(b.cursor)q=q.startAfter(id(b.cursor));const snap=await q.get();return{students:snap.docs.map(d=>({id:d.id,name:d.data().name||d.data().displayName||d.id})),nextCursor:snap.size===50?snap.docs.at(-1).id:null};
  }
  if(b.action==='list'){
    let q=db.collection('interactiveAssignments').where(teacher(a)?'teacherUid':'studentUid','==',a.uid).orderBy(FieldPath.documentId()).limit(50);if(b.cursor)q=q.startAfter(id(b.cursor));
    const snap=await q.get();return{role:a.role,assignments:snap.docs.map(d=>{const r=d.data();return{id:d.id,title:r.title,status:r.status,revision:r.revision,studentId:r.studentId,lessonVersionId:r.lessonVersionId};}),nextCursor:snap.size===50?snap.docs.at(-1).id:null};
  }
  if(b.action==='assign'){
    if(!teacher(a))fail(403,'Teacher required');
    const versionId=id(b.lessonVersionId),studentId=id(b.studentId),route=b.route||'core';
    const ref=db.collection('interactiveAssignments').doc(randomUUID());
    await db.runTransaction(async tx=>{
      const vs=await tx.get(db.doc('lessonVersions/'+versionId)),ss=await tx.get(db.doc('students/'+studentId));
      if(!vs.exists||!ss.exists)fail(404,'Lesson version or student missing');const v=vs.data(),s=ss.data();
      if(a.role!=='admin'&&(v.ownerUid!==a.uid||s.teacherUid!==a.uid))fail(403,'Lesson or student outside teacher scope');
      const uid=s.studentUid||s.linkedUserId||(Array.isArray(s.linkedUserIds)&&s.linkedUserIds.length===1?s.linkedUserIds[0]:studentId);
      if(!core.studentOwns(uid,studentId,s))fail(400,'Student account not linked');
      const us=await tx.get(db.doc('users/'+id(uid)));if(!us.exists||us.data().role!=='student'||us.data().disabled===true||us.data().status==='disabled')fail(400,'Active linked student account required');
      checked(()=>validate(v.content));const projected=checked(()=>core.project(v.content,route));if(!projected.activities.some(x=>x.response))fail(400,'Add a fillable activity before assignment');
      tx.create(ref,{schemaVersion:1,teacherUid:a.uid,studentUid:uid,studentId,lessonId:v.lessonId,lessonVersionId:versionId,route,title:v.content.title,status:'active',revision:1,answers:{},currentActivityId:projected.activities[0].id,createdBy:a.uid,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});
    });return{id:ref.id,revision:1};
  }
  const ref=db.doc('interactiveAssignments/'+id(b.assignmentId));
  return db.runTransaction(async tx=>{
    const snap=await tx.get(ref);if(!snap.exists)fail(404,'Assignment missing');const r=snap.data();access(a,r);
    if(a.role==='student'){const ss=await tx.get(db.doc('students/'+id(r.studentId)));if(!ss.exists||!core.studentOwns(a.uid,r.studentId,ss.data()))fail(403,'Student account link changed');}
    const version=await tx.get(db.doc('lessonVersions/'+id(r.lessonVersionId)));if(!version.exists)fail(404,'Pinned lesson version missing');
    const lesson=version.data().content;
    if(b.action==='get')return{id:ref.id,...r,lesson:core.project(lesson,r.route),...(teacher(a)?{teacherContent:lesson}:{})};
    if(!Number.isSafeInteger(b.revision)||b.revision!==r.revision)fail(409,'Assignment changed. Reload before saving.');
    let patch;
    if(b.action==='save'||b.action==='submit'){
      if(a.role!=='student'||a.uid!==r.studentUid)fail(403,'Assigned student required');if(r.status!=='active')fail(409,'Submitted answers are read-only');
      const answers=checked(()=>core.validateAnswers(lesson,b.answers,{submit:b.action==='submit',route:r.route}));
      const current=b.currentActivityId||r.currentActivityId;if(!lesson.activities.some(x=>x.id===current))fail(400,'Unknown activity');
      patch={answers,currentActivityId:current,...(b.action==='submit'?{status:'submitted',submittedAt:FieldValue.serverTimestamp()}: {})};
    }else if(b.action==='review'){
      if(!teacher(a))fail(403,'Teacher required');if(r.status!=='submitted')fail(409,'Only submitted answers can be reviewed');
      if(typeof b.feedback!=='string'||!b.feedback.trim()||b.feedback.length>10000)fail(400,'Feedback required, maximum 10000 characters');
      patch={status:'reviewed',feedback:b.feedback,reviewedBy:a.uid,reviewedAt:FieldValue.serverTimestamp()};
    }else fail(400,'Unknown action');
    tx.update(ref,{...patch,revision:r.revision+1,updatedBy:a.uid,updatedAt:FieldValue.serverTimestamp()});return{id:ref.id,revision:r.revision+1,status:patch.status||r.status};
  });
}
exports.interactiveLessonApi=functions.runWith({timeoutSeconds:30,memory:'256MB'}).https.onRequest(async(req,res)=>{
  const origin=req.get('Origin');res.set('Cache-Control','no-store');res.set('Vary','Origin');res.set('X-Content-Type-Options','nosniff');if(origin&&!allowedOrigin(origin))return res.status(403).json({error:'Origin denied'});if(origin)res.set('Access-Control-Allow-Origin',origin);res.set('Access-Control-Allow-Methods','POST, OPTIONS');res.set('Access-Control-Allow-Headers','Authorization, Content-Type');if(req.method==='OPTIONS')return res.status(204).send('');if(req.method!=='POST')return res.status(405).json({error:'POST required'});
  try{if(!req.body||typeof req.body!=='object'||Array.isArray(req.body))fail(400,'JSON required');if(Buffer.byteLength(JSON.stringify(req.body))>150000)fail(413,'Request too large');res.json(wire(await execute(await actor(req),req.body)));}catch(e){if(!e.status)console.error('interactiveLessonApi',e);res.status(e.status||500).json({error:e.status?e.message:'Internal error'});}
});
