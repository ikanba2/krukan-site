'use strict';
/* Loaded in both editions. In the offline edition this bridge stays inactive. */
window.P3Bridge=(()=>{
  const active=!!(window.google&&google.script&&google.script.run);
  const call=(name,...args)=>new Promise((resolve,reject)=>{
    if(!active){reject(new Error('GAS ยังไม่เชื่อม'));return}
    google.script.run.withSuccessHandler(resolve).withFailureHandler(e=>reject(new Error(e&&e.message||String(e))))[name](...args);
  });
  return {active,call,getPublicConfig:()=>call('getPublicConfig'),loginStudent:(code,pin)=>call('loginStudent',code,pin),saveProgress:(token,state)=>call('saveProgress',token,state),loginStaff:(name,pin)=>call('loginStaff',name,pin),getTeacherReport:(token,year)=>call('getTeacherReport',token,year),saveStudent:(token,year,code,name,active)=>call('saveStudent',token,year,code,name,active),saveRoster:(token,year,rows)=>call('saveRoster',token,year,rows),addAcademicYear:(token,year,className,pin)=>call('addAcademicYear',token,year,className,pin),addTeacher:(token,username,name,password)=>call('addTeacher',token,username,name,password),setDisplayYear:(token,year)=>call('setDisplayYear',token,year),confirmProduct:(token,year,code,unit)=>call('confirmProduct',token,year,code,unit)};
})();
