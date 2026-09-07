const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
test('interactive response validator deployed copy matches browser core',()=>assert.equal(fs.readFileSync(path.join(__dirname,'lesson-contract/interactive-lesson-core.js'),'utf8'),fs.readFileSync(path.join(__dirname,'../interactive-lesson-core.js'),'utf8')));
