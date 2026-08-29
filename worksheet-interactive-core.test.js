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
