const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const library=require('./worksheet-visual-library');

test('visual library exposes unique editable presets across every interactive type',()=>{
  assert.equal(library.PRESETS.length,10);
  assert.equal(new Set(library.PRESETS.map(item=>item.id)).size,10);
  assert.deepEqual(new Set(library.PRESETS.map(item=>item.type)),new Set(['image_label','diagram','comic','connect']));
  library.PRESETS.forEach(item=>{
    assert.ok(item.titleEt&&item.titleEn);
    assert.ok(item.subjects.length&&item.levels.length&&item.ages.length);
  });
});

test('visual library filters by language, level, age, type and search text',()=>{
  const adultB2Comics=library.filterPresets({subject:'Eesti keel',level:'B2',age:'adult',type:'comic'});
  assert.deepEqual(adultB2Comics.map(item=>item.id),['job-interview']);
  const bodySearch=library.filterPresets({subject:'Inglise keel',level:'A1',age:'child',type:'image_label',query:'body'});
  assert.deepEqual(bodySearch.map(item=>item.id),['body-parts']);
  assert.equal(library.filterPresets({level:'C2',type:'comic'}).length,0);
});

test('visual preset creates the selected language without sharing mutable catalog state',()=>{
  const english=library.buildPreset('body-parts',{subject:'Inglise keel',level:'A1'});
  const estonian=library.buildPreset('body-parts',{subject:'Eesti keel',level:'A1'});
  assert.equal(english.block.type,'image_label');
  assert.deepEqual(english.block.items.map(item=>item.answer),['head','hand','leg','foot']);
  assert.deepEqual(estonian.block.items.map(item=>item.answer),['pea','käsi','jalg','labajalg']);
  english.block.items[0].answer='changed';
  assert.equal(library.buildPreset('body-parts',{subject:'Inglise keel'}).block.items[0].answer,'head');
});

test('every preset builds a quality-checkable visual block',()=>{
  library.PRESETS.forEach(preset=>{
    const built=library.buildPreset(preset.id,{subject:'Eesti keel',level:preset.levels[0]});
    assert.equal(built.block.type,preset.type);
    assert.equal(built.block.visualPresetId,preset.id);
    if(preset.type==='image_label')assert.ok(built.block.imageUrl&&built.block.items.length>=3);
    if(preset.type==='diagram')assert.ok(built.block.nodes.some(node=>node.blank));
    if(preset.type==='comic')assert.ok(['complete','order'].includes(built.block.taskMode));
    if(preset.type==='connect')assert.ok(built.block.pairs.length>=4);
  });
});

test('all bundled illustration URLs resolve to committed local assets',()=>{
  const urls=[];
  library.PRESETS.forEach(preset=>{
    const block=library.buildPreset(preset.id,{subject:'Eesti keel',level:preset.levels[0]}).block;
    if(block.imageUrl)urls.push(block.imageUrl);
    (block.panels||[]).forEach(panel=>{if(panel.imageUrl)urls.push(panel.imageUrl);});
  });
  assert.ok(urls.length>=4);
  urls.forEach(url=>assert.equal(fs.existsSync('.'+url),true,url));
});
