const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('./worksheet-interactive-core');

test('visual worksheet answers are scored without exposing unrelated blocks',()=>{
  const blocks=[
    {id:'connect',type:'connect',pairs:[{l:'koer',r:'dog'},{l:'kass',r:'cat'}]},
    {id:'image',type:'image_label',items:[{answer:'pea'},{answer:'käsi'}]},
    {id:'diagram',type:'diagram',nodes:[{text:'Algus',blank:false},{text:'Tulemus',blank:true}]},
    {id:'text',type:'text',content:'Info'}
  ];
  const scored=core.scoreWorksheet(blocks,{'connect_0':0,'connect_1':0,image_label_0:'PEA',image_label_1:'jalg',diagram_node_1:'tulemus'});
  assert.deepEqual({correct:scored.correct,total:scored.total},{correct:3,total:5});
  assert.equal(scored.errors.length,2);
});

test('comic completion scores only selected speech bubbles',()=>{
  const block={id:'comic',type:'comic',taskMode:'complete',panels:[{text:'Tere!',blank:false},{text:'Kuidas läheb?',blank:true}]};
  assert.deepEqual(core.scoreBlock(block,{comic_panel_1:' kuidas läheb? '}),{correct:1,total:1,errors:[]});
});

test('comic order starts shuffled and becomes fully correct in canonical order',()=>{
  const block={id:'comic',type:'comic',taskMode:'order',panels:[{text:'1'},{text:'2'},{text:'3'}]};
  assert.deepEqual(core.initialComicOrder(block),[2,1,0]);
  assert.equal(core.scoreBlock(block,{}).correct,1);
  assert.deepEqual(core.scoreBlock(block,{comic_order:[0,1,2]}),{correct:3,total:3,errors:[]});
});

test('true or false and multiple select require exact answers',()=>{
  const blocks=[
    {id:'tf',type:'true_false',statements:[{text:'Tallinn on Eesti pealinn.',correct:true},{text:'Tartu asub Soomes.',correct:false}]},
    {id:'multi',type:'multi_select',questions:[{q:'Vali linnad.',opts:['Tallinn','Läänemeri','Tartu'],correct:[0,2]}]}
  ];
  const scored=core.scoreWorksheet(blocks,{tf_tf_0:true,tf_tf_1:true,multi_multi_0:[2,0]});
  assert.deepEqual({correct:scored.correct,total:scored.total},{correct:2,total:3});
  assert.equal(scored.errors[0].type,'true_false');
});

test('dictation ignores punctuation and repeated whitespace but not words',()=>{
  const block={id:'dict',type:'dictation',sentences:[{text:'Tere hommikust!'},{text:'Ma elan Tallinnas.'}]};
  const scored=core.scoreBlock(block,{dict_dictation_0:' tere,   hommikust ',dict_dictation_1:'Ma elan Tartus'});
  assert.deepEqual({correct:scored.correct,total:scored.total},{correct:1,total:2});
  assert.equal(scored.errors[0].correct,'Ma elan Tallinnas.');
});

test('audio and video questions use the shared media answer keys',()=>{
  const blocks=[
    {id:'audio',type:'audio',questions:[{q:'Kes räägib?',opts:['Mari','Jüri'],correct:0}]},
    {id:'video',type:'video',questions:[{q:'Kus?',opts:['Koolis','Kodus'],correct:1}]},
    {id:'voice',type:'voice_recording',prompt:'Räägi endast.'}
  ];
  const scored=core.scoreWorksheet(blocks,{audio_media_0:0,video_media_0:0,voice_voice:{url:'https://example.test/voice.webm'}});
  assert.deepEqual({correct:scored.correct,total:scored.total},{correct:1,total:2});
  assert.equal(scored.errors[0].type,'video');
});
