/* ความหลากหลายของท่า MaskRider Techno
   ภาพ Techno ทุกจุดในแอป (มาสคอต หัวข้อด่าน หน้าล็อกอิน หน้าสรุป ฯลฯ) จะถูกสลับเป็นท่าอื่นในกลุ่ม "อารมณ์" เดียวกัน
   ตามด่าน/ช่วงเรียน/ลำดับภาพ จึงไม่ซ้ำกันทุกหน้า · ท่าเริ่มต้นเปลี่ยนไปในแต่ละครั้งที่เปิดเว็บ */
(function(){
  const L=LEARNING_ASSETS;
  // กลุ่มท่า ตามอารมณ์/บทบาท (ชื่อ = คีย์ใน LEARNING_ASSETS)
  const MOODS={
    welcome:['techno-welcome','techno-ship-ufo','techno-thumbs','techno-map','techno-shot-ready'],
    present:['techno-present','techno-ship-pointer','techno-shot-ready','techno-map','techno-welcome','techno-ship-scooter'],
    read:['techno-read','techno-ship-hover','techno-think','techno-ship-astro'],
    think:['techno-think','techno-ship-astro','techno-shot-dodge','techno-read','techno-ship-hover'],
    reward:['techno-reward','techno-thumbs','techno-shot-victory','techno-ship-jetpack','techno-ship-fighter'],
    mouse:['techno-mouse','techno-ship-scooter','techno-shot-shoot'],
    keys:['techno-keys','techno-ship-surf','techno-shot-shield'],
    map:['techno-map','techno-ship-rocket','techno-present','techno-ship-fighter']
  };
  const MOOD_OF={'techno-welcome':'welcome','techno-present':'present','techno-read':'read','techno-think':'think','techno-reward':'reward',
    'techno-mouse':'mouse','techno-keys':'keys','techno-map':'map','techno-thumbs':'welcome'};
  L['techno-thumbs']=ASSETS.portrait; // ท่าชูนิ้วโป้ง (ภาพเดิมของ portrait)
  // ภาพต้นฉบับ -> อารมณ์ (ไว้ตรวจว่า <img> ใดเป็น Techno)
  const SRC={};
  Object.keys(L).filter(k=>k.startsWith('techno-')).forEach(k=>{SRC[L[k]]=MOOD_OF[k]||'present'});
  SRC[ASSETS.portrait]='welcome';
  if(ASSETS.techno)SRC[ASSETS.techno]='present';
  const SEED=Math.floor(Math.random()*997);
  const PH={pre:0,content:1,brief:2,activity:3};
  function phaseNo(){try{return PH[stageRecord().phase]||0}catch(e){return 0}}
  function pick(mood,idx){
    const pool=(MOODS[mood]||MOODS.present).filter(k=>L[k]);
    return pool[((idx%pool.length)+pool.length)%pool.length];
  }
  let busy=false;
  function refresh(){
    busy=false;
    const app=document.getElementById('app'),root=document.getElementById('modal-root');
    const scope=[app,root].filter(Boolean);
    let dom=0;
    const st=(typeof step==='number'?step:0),ph=phaseNo();
    scope.forEach(sc=>sc.querySelectorAll('img').forEach(img=>{
      const src=img.dataset.kkOrig||img.getAttribute('src');
      const mood=SRC[src];
      if(!mood)return;
      if(!img.dataset.kkOrig)img.dataset.kkOrig=src;
      const key=pick(mood,SEED+st*5+ph*2+dom*3);
      dom++;
      if(img.dataset.kkPose!==key){img.src=L[key];img.dataset.kkPose=key}
    }));
  }
  function schedule(){if(!busy){busy=true;setTimeout(refresh,20)}}
  const mo=new MutationObserver(schedule);
  mo.observe(document.body,{childList:true,subtree:true});
  schedule();
})();
