const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('./curriculum-document-core');
test('curriculum documents accept safe teaching formats below 20 MB',()=>{for(const name of ['worksheet.pdf','lesson.docx','slides.pptx','photo.png','notes.txt'])assert.equal(core.validate({name,size:1024,type:''}).ok,true,name);});
test('curriculum documents reject empty, oversized and executable files',()=>{assert.equal(core.validate({name:'empty.pdf',size:0,type:'application/pdf'}).ok,false);assert.match(core.validate({name:'large.pdf',size:20*1024*1024,type:'application/pdf'}).message,/20 MB/);assert.equal(core.validate({name:'run.html',size:120,type:'text/html'}).ok,false);});
test('preview mode and storage names are deterministic and safe',()=>{assert.equal(core.previewKind({name:'sheet.PDF'}),'pdf');assert.equal(core.previewKind({name:'picture.jpeg'}),'image');assert.equal(core.previewKind({name:'lesson.docx'}),'download');assert.equal(core.storagePath({name:'Minu tööleht (1).pdf'},42),'curriculum/42_Minu-tooleht-1-.pdf');assert.equal(core.formatBytes(1536),'1.5 KB');});
