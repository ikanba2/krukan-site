'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
const dir=__dirname,ctx={window:{},console};
vm.createContext(ctx);
for(const file of ['p3-data.js','p3-activity.js','p3-grid.js'])vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),ctx);
const D=ctx.window.P3DATA,Q=ctx.window.P3Q,M=ctx.window.P3M,M2=ctx.window.P3M2,B=ctx.window.P3B;
if(D.units.length!==9||D.stageCount!==126)throw Error('Unit or stage count is wrong');
for(const u of D.units){
  const n=u.number;
  if(u.stages.length!==14||u.stages.reduce((a,s)=>a+s.scoreMax,0)!==100)throw Error('Scoring wrong in unit '+n);
  if(Q[n].length!==5)throw Error('Five parallel quiz items required in unit '+n);
  for(const q of Q[n])if(q.length<4||q[3]<0||q[3]>=q[2].length||(q[4]!==undefined&&(q[4]<0||q[4]>=q[2].length)))throw Error('Quiz answer out of bounds in unit '+n);
  if(n===2||n===7)continue;
  for(const [name,bank] of [['A',M[n]],['B',M2[n]],['Boss',B[n]]]){
    if(bank.length!==3)throw Error('Three mission rounds required: '+n+' '+name);
    for(const item of bank)if(item.length!==4||item[2]<0||item[2]>=item[1].length)throw Error('Answer out of bounds: '+n+' '+name);
  }
}
const solutions={
  2:{5:['F','F','F','F'],6:['F','F','F'],8:['IFB','F'],9:['IFB','F'],10:['F','F','R','F','F'],13:['IFB','F','F']},
  7:{5:['R4'],6:['R2'],8:['RP3'],9:['RP3','L','R2'],10:['R2','R','R2'],13:['RP3','L','R2']}
};
for(const [n,levels] of Object.entries(solutions))for(const [s,program] of Object.entries(levels)){
  const level=vm.runInContext(`GLEVEL[${n}][${s}]`,ctx);
  if(program.length>level.max||program.some(x=>!level.allow.includes(x)))throw Error('Illegal program: '+n+'/'+s);
  for(const map of level.maps){
    const result=vm.runInContext(`gRun(${JSON.stringify(map)},${JSON.stringify(program)})`,ctx);
    if(!result.success)throw Error('Unsolvable reference route: '+n+'/'+s+' '+result.error);
  }
}
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'assets','manifest.json'),'utf8'));
for(const name of Object.values(manifest))if(!fs.existsSync(path.join(dir,'assets',name)))throw Error('Missing image '+name);
for(const u of D.units)if(!fs.existsSync(path.join(dir,'assets',u.background.replace('.png','.webp'))))throw Error('Missing unit art '+u.number);
console.log('Verified 9 units, 126 stages, 900 possible points, quizzes, mission banks, 12 grid stages and 24 assets.');
