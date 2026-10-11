/* ตัวโหลดกลาง: kkLoading.show('ข้อความ') / kkLoading.hide() · แสดงหลังหน่วง 120 ms เพื่อไม่ให้กะพริบ */
const kkLoading=(function(){
  let el=null,textEl=null,count=0,timer=0;
  function ensure(){
    if(el&&el.isConnected)return;
    el=document.createElement('div');el.className='kk-loading';el.setAttribute('role','status');el.setAttribute('aria-live','polite');
    el.innerHTML='<div class="kk-loading-card"><div class="kk-orbit" aria-hidden="true"><i class="kk-orbit-star"></i><b></b><b></b><b></b></div><p class="kk-loading-text"></p><div class="kk-loading-bar" aria-hidden="true"><i></i></div></div>';
    document.body.append(el);textEl=el.querySelector('.kk-loading-text');
  }
  return {
    show(msg){count++;clearTimeout(timer);timer=setTimeout(()=>{ensure();textEl.textContent=msg||'กำลังโหลด…';el.classList.add('on')},120)},
    hide(){count=Math.max(0,count-1);if(count)return;clearTimeout(timer);if(el)el.classList.remove('on')},
    async run(msg,fn){this.show(msg);try{return await fn()}finally{this.hide()}}
  };
})();

/* ลูกศร → ← ในข้อความทั้งเว็บ: เปลี่ยนเป็นลูกศรหนาแบบวาด (SVG) ให้ชัดเหมือนกันทุกจุด */
(function(){
  const RE=/[→←ϟ√✓]/,MAP={'ϟ':'⚡','√':'✔','✓':'✔'};
  const SKIP=new Set(['SCRIPT','STYLE','TEXTAREA','INPUT','TITLE','OPTION','CANVAS']);
  function fix(root){
    if(!root||!root.nodeType)return;
    if(root.nodeType===3){fixText(root);return}
    if(root.nodeType!==1||SKIP.has(root.tagName))return;
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){return RE.test(n.nodeValue)&&!SKIP.has(n.parentNode.tagName)?1:2}}),list=[];
    while(w.nextNode())list.push(w.currentNode);
    list.forEach(fixText);
  }
  function fixText(n){
    const p=n.parentNode;if(!p||SKIP.has(p.tagName)||!RE.test(n.nodeValue))return;
    const frag=document.createDocumentFragment();
    n.nodeValue.split(/([→←ϟ√✓])/).forEach(s=>{
      if(s==='→'||s==='←'){const i=document.createElement('i');i.className='kk-arr'+(s==='←'?' kk-arr-l':'');i.setAttribute('aria-hidden','true');frag.append(i)}
      else if(s)frag.append(MAP[s]||s);
    });
    p.replaceChild(frag,n);
  }
  function start(){
    fix(document.body);
    new MutationObserver(ms=>{for(const m of ms){m.addedNodes.forEach(fix);if(m.type==='characterData')fixText(m.target)}}).observe(document.body,{childList:true,subtree:true,characterData:true});
  }
  if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
})();
