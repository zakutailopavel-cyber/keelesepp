const test=require('node:test');
const assert=require('node:assert/strict');
const curriculum=require('./haldus-curriculum-data');

test('curriculum source is extracted completely',()=>{
  assert.deepEqual(curriculum.stats,{
    levels:11,
    topics:79,
    lessons:158,
    vocabulary:632
  });
  assert.deepEqual(curriculum.languages.map(language=>language.id),['est','eng']);
});

test('every topic has stable identity, two lesson plans and vocabulary',()=>{
  const topicIds=new Set();
  curriculum.languages.forEach(language=>{
    language.levels.forEach(level=>{
      assert.match(level.code,/^[ABC][1-2]$/);
      assert.ok(level.name);
      assert.ok(level.description);
      level.topics.forEach(topic=>{
        assert.equal(topicIds.has(topic.id),false,`duplicate topic id: ${topic.id}`);
        topicIds.add(topic.id);
        assert.equal(topic.lessons.length,2,`${topic.id} lesson count`);
        assert.equal(topic.vocab.length,8,`${topic.id} vocabulary count`);
        topic.lessons.forEach(lesson=>{
          assert.ok(lesson.goal);
          assert.equal(lesson.steps.length,5,`${topic.id} step count`);
        });
      });
    });
  });
});

test('dictionary links are safe external HTTPS links',()=>{
  const vocabulary=curriculum.languages.flatMap(language=>
    language.levels.flatMap(level=>level.topics.flatMap(topic=>topic.vocab))
  );
  vocabulary.forEach(item=>{
    assert.ok(item.word);
    assert.ok(item.translation);
    assert.match(item.dictionaryUrl,/^https:\/\/(sonaveeb\.ee|dictionary\.cambridge\.org)\//);
  });
});
