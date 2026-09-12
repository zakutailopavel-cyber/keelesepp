import { checkRateLimit, handleOptions, requireStaff, sendError, setCors } from './_auth.js';
import generationCore from '../activity-generation-core.js';

const MODEL='claude-haiku-4-5-20251001';
const {request:validateRequest,clean,PHASES,SKILLS,WORKSPACES,LAYOUTS}=generationCore;

export default async function handler(req,res){
  if(handleOptions(req,res))return;setCors(req,res);res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const apiKey=process.env.ANTHROPIC_API_KEY;if(!apiKey)return res.status(503).json({error:'AI generation is not configured'});
  try{
    const {decoded}=await requireStaff(req);checkRateLimit(`activity:${decoded.uid}`,10);
    const {topic,goal,cefr,responseMode}=validateRequest(req.body);
    const tool={name:'create_activity',description:'Create exactly one Estonian language learning activity.',input_schema:{type:'object',additionalProperties:false,required:['title','phaseId','skillId','workspaceType','layout','minutes','routes','expected','teacherInstruction','items'],properties:{title:{type:'string'},phaseId:{type:'string',enum:PHASES},skillId:{type:'string',enum:SKILLS},workspaceType:{type:'string',enum:WORKSPACES},layout:{type:'string',enum:LAYOUTS},minutes:{type:'integer',minimum:1,maximum:30},routes:{type:'object',additionalProperties:false,required:['support','core','advanced'],properties:{support:{type:'object',additionalProperties:false,required:['prompt'],properties:{prompt:{type:'string'}}},core:{type:'object',additionalProperties:false,required:['prompt'],properties:{prompt:{type:'string'}}},advanced:{type:'object',additionalProperties:false,required:['prompt'],properties:{prompt:{type:'string'}}}}},expected:{type:'string'},teacherInstruction:{type:'string'},items:{type:'array',maxItems:6,items:{type:'string'}}}}};
    const provider=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:MODEL,max_tokens:700,temperature:.3,system:'You create one practical Estonian-language exercise for KeeleSepp. Return only the requested tool call. Prompts are in Estonian, clear and ready for a student. Support, core and advanced are the same logical activity at three scaffolding levels. Keep text concise. Never include personal data.',messages:[{role:'user',content:`CEFR: ${cefr}\nTopic: ${topic}\nGoal: ${goal||'practical language use'}\nResponse mode: ${responseMode}\nFor choice modes provide 3-4 answer labels. For gaps provide one item label per ___ token and use ___ in every route. For text modes return an empty items array.`}],tools:[tool],tool_choice:{type:'tool',name:'create_activity'}})});
    const data=await provider.json().catch(()=>({}));if(!provider.ok)throw Object.assign(Error('AI provider unavailable'),{status:502});
    const call=data.content?.find(part=>part.type==='tool_use'&&part.name==='create_activity');if(!call)throw Object.assign(Error('AI did not return an activity'),{status:502});
    const activity=clean(call.input,responseMode,{topic,cefr});const usage=data.usage||{};console.log(`[activity-ai] uid:${decoded.uid} model:${MODEL} in:${usage.input_tokens||0} out:${usage.output_tokens||0}`);
    return res.status(200).json({activity,model:MODEL});
  }catch(error){if(!error.status)console.error('generate-activity',error);return sendError(res,error);}
}
