/* บอส Golden Parasite โผล่มุมซ้ายล่างบ่อย ๆ: โผล่ทักตอนเปลี่ยนหน้า / ตอนตอบ / ทุก ๆ ไม่กี่วินาที
   ไม่บังปุ่ม (pointer-events:none, ชิดขอบซ้าย) และซ่อนเมื่อจอแคบกว่า 1200px */
(function(){
  const FR={stand:0,pose:3,punch:4,orb:6,claw:7,hurt:8};
  const HELLO=['ฮ่า ๆ ข้ามาแล้ว!','ข้าคือ Golden Parasite!','คิดให้ดีนะ เด็กน้อย','ข้าจะขวางทางเอง!','ใครจะช่วย Techno ได้?','ข้าแอบดูอยู่นะ…'];
  const GOOD=['โอ๊ย! เก่งจังเลย!','ไม่นะ! ถูกอีกแล้ว!','ข้าแพ้แล้ว… ยังไม่ยอม!','เก่งมาก ข้าสั่นเลย!'];
  const BAD=['ฮ่า ๆ ลองใหม่สิ!','ใกล้แล้ว แต่ยังไม่ใช่!','ข้าชนะรอบนี้!','ค่อย ๆ คิดนะ ข้ารอได้'];
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  let el,bubble,timer=0,hideT=0,lastSig='',lastFb='';
  function make(){
    if(el||typeof ASSETS==='undefined'||!ASSETS.boss)return;
    el=document.createElement('div');el.className='kk-boss';el.setAttribute('aria-hidden','true');
    el.innerHTML='<div class="kk-boss-say"></div><div class="kk-boss-body"></div>';
    el.querySelector('.kk-boss-body').style.backgroundImage='url("'+ASSETS.boss+'")';
    bubble=el.querySelector('.kk-boss-say');document.body.append(el);
  }
  function show(frame,text,ms){
    make();if(!el)return;
    const body=el.querySelector('.kk-boss-body');
    body.style.backgroundPosition=(frame%3)*50+'% '+Math.floor(frame/3)*50+'%';
    bubble.textContent=text||'';bubble.style.display=text?'block':'none';
    el.classList.remove('in');void el.offsetWidth;el.classList.add('in','on');
    clearTimeout(hideT);hideT=setTimeout(()=>el.classList.remove('on'),ms||4200);
  }
  window.kkBossShow=show;
  function inLesson(){return !!document.querySelector('#app .lesson-top,#app .u6-top,#app .compact-hero')&&!document.querySelector('#app.battle-mode,.modal')}
  function tick(){
    if(inLesson())show(pick([FR.pose,FR.orb,FR.claw,FR.stand]),pick(HELLO));
    timer=setTimeout(tick,16000+Math.random()*9000);
  }
  function signature(){const h=document.querySelector('#app h1,#app h2');return h?h.textContent.trim():''}
  function fbText(){const e=document.querySelector('#app .u6-feedback:not(.is-empty),#app .feedback,#app .cq-msg');return e?e.textContent.trim():''}
  function onChange(){
    const sig=signature();
    if(sig&&sig!==lastSig){lastSig=sig;lastFb='';if(inLesson()&&Math.random()<.45)show(pick([FR.pose,FR.stand,FR.claw]),pick(HELLO),3600)}
    const fb=fbText();
    if(fb&&fb!==lastFb){lastFb=fb;
      if(/ถูก|เก่ง|ผ่าน|สำเร็จ|ดีมาก|ตรงแล้ว|ได้พลัง|ครบ|ชนะ/.test(fb))show(FR.hurt,pick(GOOD),3200);
      else if(/ยัง|ลอง|ไม่|ผิด|ใกล้|ชน|ตก/.test(fb))show(FR.punch,pick(BAD),3200);
    }
  }
  function start(){
    const app=document.getElementById('app');if(!app)return;
    let q=0;new MutationObserver(()=>{clearTimeout(q);q=setTimeout(onChange,120)}).observe(app,{childList:true,subtree:true,characterData:true});
    setTimeout(()=>{if(inLesson())show(FR.pose,'ฮ่า ๆ ข้ามาแล้ว!')},2500);
    timer=setTimeout(tick,9000);
  }
  if(document.readyState==='complete')start();else window.addEventListener('load',start);
})();
