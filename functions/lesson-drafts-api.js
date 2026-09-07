'use strict';
const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const {FieldValue, FieldPath} = require('firebase-admin/firestore');
const {randomUUID} = require('node:crypto');
const contract = require('./lesson-contract/lesson-authoring-core');
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const MAX_BYTES = 700000;
const error = (status, message) => Object.assign(new Error(message), {status});
const id = value => {if(typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,160}$/.test(value)) throw error(400,'Invalid ID');return value;};
function jsonSafe(value, depth=0) {
  if(depth>18) throw error(400,'Metadata too deeply nested');
  if(value===null || typeof value==='string' || typeof value==='boolean') return;
  if(typeof value==='number' && Number.isFinite(value)) return;
  if(!value || typeof value!=='object') throw error(400,'JSON data required');
  if(Array.isArray(value)){for(const item of value)jsonSafe(item,depth+1);return;}
  for(const [key,item] of Object.entries(value)){
    if(['__proto__','constructor','prototype'].includes(key)||key.length>160)throw error(400,'Invalid metadata key');
    jsonSafe(item,depth+1);
  }
}
function validate(content) {
  jsonSafe(content);
  if(Buffer.byteLength(JSON.stringify(content),'utf8')>MAX_BYTES)throw error(413,'Draft is too large');
  let result;
  try {result=contract.validate(content);} catch {throw error(400,'Invalid draft metadata');}
  if(!result.ok)throw error(400,result.errors.slice(0,5).join('; '));
  const keys=new Set(['schemaVersion','kind','id','title','activities','context','authoring','sourceLessonId']);
  if(Object.keys(content).some(k=>!keys.has(k)))throw error(400,'Unknown draft metadata');
  if(content.authoring){
    const ids=new Set(content.activities.map(a=>a.id));
    if(Object.keys(content.authoring.activities).some(k=>!ids.has(k)))throw error(400,'Orphan activity metadata');
  }
  return JSON.parse(JSON.stringify(content));
}
async function actorFor(req){
  const token=(req.get('Authorization')||'').match(/^Bearer (.+)$/i)?.[1];
  if(!token)throw error(401,'Sign in required');
  let tokenData;try{tokenData=await admin.auth().verifyIdToken(token,true);}catch{throw error(401,'Invalid token');}
  const profile=(await db.collection('users').doc(tokenData.uid).get()).data()||{};
  if(profile.disabled===true||profile.status==='disabled'||!['teacher','admin'].includes(profile.role))throw error(403,'Teacher or administrator required');
  return {uid:tokenData.uid,isAdmin:profile.role==='admin'};
}
function authorize(actor,record){if(record.ownerUid!==actor.uid&&!actor.isAdmin)throw error(403,'Outside your lesson library');}
function revision(body,record){if(!Number.isSafeInteger(body.revision)||body.revision!==record.revision)throw error(409,'Revision conflict. Reopen the cloud draft or save a separate copy.');}
function wire(v){if(v?.toDate)return v.toDate().toISOString();if(Array.isArray(v))return v.map(wire);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,wire(x)]));return v;}
async function execute(actor,body){
  const action=body.action;
  if(action==='list'){
    let query=db.collection('lessonDrafts').where('ownerUid','==',actor.uid).orderBy(FieldPath.documentId()).limit(50);
    if(body.cursor)query=query.startAfter(id(body.cursor));
    const snap=await query.get();
    return {drafts:snap.docs.map(doc=>{const {content,...meta}=doc.data();return {...meta,id:doc.id,title:content.title};}),nextCursor:snap.size===50?snap.docs.at(-1).id:null};
  }
  if(action==='create'){
    const content=validate(body.content),draftId='draft-'+randomUUID(),lessonId='lesson-'+randomUUID();content.id=draftId;
    const now=FieldValue.serverTimestamp();
    const record={schemaVersion:1,lessonId,ownerUid:actor.uid,createdBy:actor.uid,updatedBy:actor.uid,createdAt:now,updatedAt:now,revision:1,status:'active',versionNumber:0,content};
    const ref=db.collection('lessonDrafts').doc(draftId);await ref.create(record);
    return {draft:{id:draftId,...(await ref.get()).data()}};
  }
  const ref=db.collection('lessonDrafts').doc(id(body.draftId));
  if(['get','history','version'].includes(action)){
    const snap=await ref.get();if(!snap.exists)throw error(404,'Draft not found');const record=snap.data();authorize(actor,record);
    if(action==='get')return {draft:{id:snap.id,...record}};
    if(action==='version'){
      const version=await db.collection('lessonVersions').doc(id(body.lessonVersionId)).get();
      if(!version.exists||version.data().lessonId!==record.lessonId)throw error(404,'Version not found');
      return {version:{id:version.id,...version.data()}};
    }
    let query=db.collection('lessonVersions').where('lessonId','==',record.lessonId).orderBy(FieldPath.documentId()).limit(50);
    if(body.cursor)query=query.startAfter(id(body.cursor));
    const versions=await query.get();
    return {versions:versions.docs.map(d=>{const {content,...meta}=d.data();return {id:d.id,...meta};}),nextCursor:versions.size===50?versions.docs.at(-1).id:null};
  }
  if(!['save','duplicate','archive','publish'].includes(action))throw error(400,'Unknown action');
  const content=action==='save'?validate(body.content):null;
  const newId='draft-'+randomUUID(),newLessonId='lesson-'+randomUUID();
  return db.runTransaction(async tx=>{
    const snap=await tx.get(ref);if(!snap.exists)throw error(404,'Draft not found');const record=snap.data();authorize(actor,record);revision(body,record);
    if(record.status!=='active')throw error(409,'Draft is archived');
    const now=FieldValue.serverTimestamp();
    if(action==='duplicate'){
      const copy=validate(record.content);copy.id=newId;
      const next={...record,lessonId:newLessonId,ownerUid:actor.uid,createdBy:actor.uid,updatedBy:actor.uid,createdAt:now,updatedAt:now,revision:1,versionNumber:0,content:copy};
      delete next.lastPublishedVersionId;
      tx.create(db.collection('lessonDrafts').doc(newId),next);
      return {id:newId,revision:1};
    }
    const update={revision:record.revision+1,updatedBy:actor.uid,updatedAt:now};
    if(action==='save'){
      if(content.id!==snap.id)throw error(400,'Draft identity cannot change');update.content=content;
    }
    if(action==='archive')update.status='archived';
    let publication;
    if(action==='publish'){
      const frozen=validate(record.content),versionNumber=record.versionNumber+1;
      const lessonVersionId=record.lessonId+'_v'+String(versionNumber).padStart(6,'0');
      publication={lessonId:record.lessonId,lessonVersionId,versionNumber};
      tx.create(db.collection('lessonVersions').doc(lessonVersionId),{schemaVersion:1,...publication,ownerUid:record.ownerUid,createdBy:actor.uid,createdAt:now,sourceRevision:record.revision,content:frozen});
      tx.set(db.collection('publishedLessons').doc(record.lessonId),{schemaVersion:1,...publication,ownerUid:record.ownerUid,title:frozen.title,updatedBy:actor.uid,updatedAt:now});
      update.versionNumber=versionNumber;update.lastPublishedVersionId=lessonVersionId;
    }
    tx.update(ref,update);
    return {id:snap.id,revision:update.revision,...(publication?{publication}:{}),status:update.status||record.status};
  });
}
const origins=new Set(['https://crm.epkoolitus.ee','https://epkoolitus.ee','https://www.epkoolitus.ee','https://keelesepp.vercel.app']);
function allowedOrigin(origin){return origins.has(origin)||/^https:\/\/keelesepp-[a-z0-9-]+-zakutailopavel-cybers-projects\.vercel\.app$/.test(origin)||(process.env.FUNCTIONS_EMULATOR==='true'&&/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin));}
async function handler(req,res){
  const origin=req.get('Origin');
  res.set('Vary','Origin');res.set('Cache-Control','no-store');res.set('X-Content-Type-Options','nosniff');
  if(origin&&!allowedOrigin(origin))return res.status(403).json({error:'Origin not allowed'});
  if(origin)res.set('Access-Control-Allow-Origin',origin);
  res.set('Access-Control-Allow-Methods','POST, OPTIONS');res.set('Access-Control-Allow-Headers','Authorization, Content-Type');
  if(req.method==='OPTIONS')return res.status(204).send('');
  if(req.method!=='POST')return res.status(405).json({error:'POST required'});
  try{
    if(!req.body||typeof req.body!=='object'||Array.isArray(req.body))throw error(400,'JSON object required');
    if(Buffer.byteLength(JSON.stringify(req.body),'utf8')>MAX_BYTES+4000)throw error(413,'Request too large');
    const actor=await actorFor(req);res.json(wire(await execute(actor,req.body)));
  }catch(e){if(!e.status)console.error('lessonDraftsApi',e);res.status(e.status||500).json({error:e.status?e.message:'Internal error'});}
}
exports.lessonDraftsApi=functions.runWith({timeoutSeconds:30,memory:'256MB'}).https.onRequest(handler);
exports._test={validate,allowedOrigin};
