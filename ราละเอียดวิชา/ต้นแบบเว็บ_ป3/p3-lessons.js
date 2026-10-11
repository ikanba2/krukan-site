'use strict';
/* Each learning stage uses both authored pages from course-plan.json. */
function renderLearningDetail(n,s,pageIndex=0){
  const u=unit(n),st=stage(n,s),pages=st.pages||[],k=st.kind,page=pages[pageIndex]||pages[0],label=k==='story'?'เปิดเรื่อง':k==='lesson'?'บทเรียน':'ตัวอย่าง',art=u.background.replace('.png','.webp'),saved=(us(n).reflections||{})[s]||'';
  const prompt=k==='story'?'เทคโนจะต้องทำอะไรในบทนี้':k==='lesson'?'เราเข้าใจแนวคิดนี้อย่างไร':'ถ้าข้อมูลเปลี่ยน เราจะตรวจคำตอบอย่างไร';
  stageShell(n,s,`<span class="pill">${label} · หน้า ${pageIndex+1}/${pages.length}</span><h2>${esc(page?.role||label)}</h2><div class="lesson-columns"><div><p class="lesson-body">${esc(page?.content||'')}</p>${pageIndex===0?`<div class="call">เป้าหมายบทนี้: ${esc(u.goal)}</div>`:`<div class="reflection"><label for="reflection"><strong>ลองคิดด้วยตัวเอง</strong><span>${esc(prompt)}</span></label><textarea id="reflection" class="field" rows="3" placeholder="เขียนสั้น ๆ ด้วยคำของเรา">${esc(saved)}</textarea><p class="small-note">ไม่มีคำตอบเดียว ครูจะอ่านเหตุผลของเราได้จากข้อมูลผลเรียน</p></div>`}<div class="stage-actions">${pageIndex>0?'<button class="btn alt" id="prevlesson">← ย้อนหน้า</button>':''}<button class="btn" id="lessonaction">${pageIndex===0?'อ่านหน้าต่อไป':'บันทึกสิ่งที่คิด'}</button>${done(n,s)?nextBtn(n,s):''}</div></div>${img(art,u.academic,'lesson-art')}</div>`);
  const back=$('#prevlesson');if(back)back.onclick=()=>renderLearningDetail(n,s,pageIndex-1);
  $('#lessonaction').onclick=()=>{if(pageIndex===0){renderLearningDetail(n,s,1);return}const value=$('#reflection').value.trim();if(value.length<6){toast('ลองเขียนเหตุผลสั้น ๆ อีกนิดนะ');return}us(n).reflections??={};us(n).reflections[s]=value;award(n,s,0,'บันทึกสิ่งที่คิดแล้ว');renderLearningDetail(n,s,1)};
  bindNext(n,s);
}
