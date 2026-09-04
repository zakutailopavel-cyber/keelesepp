const test=require('node:test');
const assert=require('node:assert/strict');
const {create}=require('./learning-profile-evidence-store.js');

test('profile evidence client authenticates and posts a bounded student request',async()=>{
  const calls=[];
  const auth={currentUser:{getIdToken:async()=> 'token-123'}};
  const fetchImpl=async(url,options)=>{
    calls.push({url,options});
    return {ok:true,status:200,json:async()=>({student:{id:'student-1'},evidence:[{id:'ev-1'}],sessions:[{id:'s-1'}]})};
  };
  const store=create({auth,apiUrl:'http://localhost/profile-evidence',fetchImpl});
  const result=await store.load('student-1',{limit:40});
  assert.equal(calls.length,1);
  assert.equal(calls[0].url,'http://localhost/profile-evidence');
  assert.equal(calls[0].options.headers.Authorization,'Bearer token-123');
  assert.deepEqual(JSON.parse(calls[0].options.body),{studentId:'student-1',limit:40});
  assert.equal(result.evidence[0].id,'ev-1');
  assert.equal(result.sessions[0].id,'s-1');
});

test('profile evidence client does not call the API without a student id',async()=>{
  let calls=0;
  const auth={currentUser:{getIdToken:async()=> 'token-123'}};
  const store=create({auth,fetchImpl:async()=>{calls+=1;throw new Error('should not run');}});
  const result=await store.load('');
  assert.equal(calls,0);
  assert.deepEqual(result,{student:null,evidence:[],sessions:[]});
});

test('profile evidence client surfaces trusted API errors',async()=>{
  const auth={currentUser:{getIdToken:async()=> 'token-123'}};
  const store=create({auth,fetchImpl:async()=>({ok:false,status:403,json:async()=>({error:'Student is outside teacher scope'})})});
  await assert.rejects(()=>store.load('student-1'),/outside teacher scope/);
});
