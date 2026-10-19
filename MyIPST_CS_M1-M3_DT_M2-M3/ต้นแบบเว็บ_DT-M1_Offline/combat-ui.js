/* GameAudio · ระบบเสียงสังเคราะห์ Web Audio API เบา สบายหู ไร้ไฟล์ภายนอก ทำงานออฟไลน์ 100% */
const GameAudio=(()=>{
  let ctx=null,lastClickTime=0,installed=false;
  const isEnabled=()=>{
    try{
      if(typeof state!=='undefined'&&state&&state.soundOff!==undefined)return !state.soundOff;
      if(typeof S!=='undefined'&&S&&S.sound!==undefined)return !!S.sound;
      if(typeof GameFeel!=='undefined'&&typeof GameFeel.soundEnabled==='function')return GameFeel.soundEnabled();
    }catch(e){}
    return true;
  };
  const getCtx=()=>{
    if(!ctx){
      const AC=window.AudioContext||window.webkitAudioContext;
      if(AC)ctx=new AC();
    }
    if(ctx&&ctx.state==='suspended'){ctx.resume().catch(()=>{})}
    return ctx;
  };
  const sounds={
    click(ac){
      const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();
      o.type='sine';
      o.frequency.setValueAtTime(780,t);
      o.frequency.exponentialRampToValueAtTime(240,t+.032);
      g.gain.setValueAtTime(.065,t);
      g.gain.exponentialRampToValueAtTime(.0001,t+.034);
      o.connect(g);g.connect(ac.destination);
      o.start(t);o.stop(t+.036);
    },
    tab(ac){
      const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();
      o.type='triangle';
      o.frequency.setValueAtTime(540,t);
      o.frequency.exponentialRampToValueAtTime(860,t+.045);
      g.gain.setValueAtTime(.05,t);
      g.gain.exponentialRampToValueAtTime(.0001,t+.048);
      o.connect(g);g.connect(ac.destination);
      o.start(t);o.stop(t+.052);
    },
    select(ac){
      const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();
      o.type='sine';
      o.frequency.setValueAtTime(460,t);
      o.frequency.exponentialRampToValueAtTime(680,t+.055);
      g.gain.setValueAtTime(.06,t);
      g.gain.exponentialRampToValueAtTime(.0001,t+.06);
      o.connect(g);g.connect(ac.destination);
      o.start(t);o.stop(t+.065);
    },
    laser(ac){
      const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();
      o.type='sawtooth';
      o.frequency.setValueAtTime(960,t);
      o.frequency.exponentialRampToValueAtTime(160,t+.11);
      g.gain.setValueAtTime(.075,t);
      g.gain.exponentialRampToValueAtTime(.0001,t+.115);
      o.connect(g);g.connect(ac.destination);
      o.start(t);o.stop(t+.12);
    },
    bossShot(ac){
      const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();
      o.type='sawtooth';
      o.frequency.setValueAtTime(240,t);
      o.frequency.exponentialRampToValueAtTime(60,t+.22);
      g.gain.setValueAtTime(.09,t);
      g.gain.exponentialRampToValueAtTime(.0001,t+.23);
      o.connect(g);g.connect(ac.destination);
      o.start(t);o.stop(t+.24);
    },
    shield(ac){
      const t=ac.currentTime;
      [1280,1920].forEach(f=>{
        const o=ac.createOscillator(),g=ac.createGain();
        o.type='sine';
        o.frequency.setValueAtTime(f,t);
        o.frequency.exponentialRampToValueAtTime(f*1.12,t+.14);
        g.gain.setValueAtTime(.05,t);
        g.gain.exponentialRampToValueAtTime(.0001,t+.15);
        o.connect(g);g.connect(ac.destination);
        o.start(t);o.stop(t+.16);
      });
    },
    impact(ac){
      const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();
      o.type='triangle';
      o.frequency.setValueAtTime(170,t);
      o.frequency.exponentialRampToValueAtTime(40,t+.12);
      g.gain.setValueAtTime(.11,t);
      g.gain.exponentialRampToValueAtTime(.0001,t+.13);
      o.connect(g);g.connect(ac.destination);
      o.start(t);o.stop(t+.14);
    },
    heroHurt(ac){
      const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();
      o.type='sine';
      o.frequency.setValueAtTime(130,t);
      o.frequency.exponentialRampToValueAtTime(45,t+.16);
      g.gain.setValueAtTime(.10,t);
      g.gain.exponentialRampToValueAtTime(.0001,t+.17);
      o.connect(g);g.connect(ac.destination);
      o.start(t);o.stop(t+.18);
    },
    charge(ac){
      const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();
      o.type='sine';
      o.frequency.setValueAtTime(180,t);
      o.frequency.exponentialRampToValueAtTime(540,t+.16);
      g.gain.setValueAtTime(.045,t);
      g.gain.exponentialRampToValueAtTime(.0001,t+.17);
      o.connect(g);g.connect(ac.destination);
      o.start(t);o.stop(t+.18);
    },
    victory(ac){
      [523.25,659.25,783.99,1046.50].forEach((f,i)=>{
        const t=ac.currentTime+i*.075,o=ac.createOscillator(),g=ac.createGain();
        o.type='triangle';
        o.frequency.setValueAtTime(f,t);
        g.gain.setValueAtTime(.07,t);
        g.gain.exponentialRampToValueAtTime(.0001,t+.22);
        o.connect(g);g.connect(ac.destination);
        o.start(t);o.stop(t+.24);
      });
    }
  };
  function play(name){
    if(!isEnabled())return;
    try{const ac=getCtx();if(ac&&sounds[name])sounds[name](ac)}catch(e){}
  }
  function onGlobalClick(e){
    const el=e.target?.closest?.(
      'button, .btn, .opt, .chipb, .ord-card, .jr-node, .role-card, .tbtn, [role="button"], input[type="radio"], input[type="checkbox"], a[role="tab"], .tab, .seg button'
    );
    if(!el)return;
    if(el.disabled||el.classList.contains('disabled'))return;
    const now=performance.now();
    if(now-lastClickTime<60)return;
    lastClickTime=now;
    if(el.classList.contains('opt')||el.type==='radio'||el.type==='checkbox'||el.classList.contains('chipb')){
      play('select');
    }else if(el.classList.contains('tbtn')||el.getAttribute('role')==='tab'||el.classList.contains('jr-node')||el.classList.contains('tab')){
      play('tab');
    }else{
      play('click');
    }
  }
  function install(){
    if(installed)return;
    installed=true;
    if(typeof document!=='undefined'){
      document.addEventListener('click',onGlobalClick,{capture:true,passive:true});
    }
  }
  return {play,install,sounds,isEnabled};
})();
if(typeof window!=='undefined'){window.GameAudio=GameAudio;GameAudio.install()}

/* Shared side-view battle assets; hero faces right, boss is mirrored to face left. */
const CombatUI={
  bossFrames:{idle:[3,1],attack:[4,6,7],hurt:5,defeated:8},
  climates:['thunder','water','nature','fire','ice','rock'],
  install(){
    GameAudio.install();
    if(typeof ASSETS==='undefined')return;
    const root=document.documentElement;
    for(const [name,key] of [['--combat-arena','combat-arena'],['--combat-hero','combat-hero'],['--combat-hero-fx','combat-hero-fx'],['--combat-boss-fx','combat-boss-fx']])
      if(ASSETS[key])root.style.setProperty(name,`url("${ASSETS[key]}")`)
  },
  frame(index,rows=2){return `${(index%3)*50}% ${Math.floor(index/3)*100/(rows-1)}%`},
  bossFrame(index){return this.frame(index,3)},
  hero(arena,index){const el=arena?.querySelector('.combat-hero');if(el)el.style.backgroundPosition=this.frame(index)},
  decorate(arena,climate){
    if(!arena)return;climate=this.climates.includes(climate)?climate:'thunder';arena.dataset.combatClimate=climate;
    if(arena.querySelector('.combat-weather'))return;
    const weather=document.createElement('div');weather.className='combat-weather';weather.setAttribute('aria-hidden','true');
    for(let i=0;i<24;i++){
      const p=document.createElement('i');p.style.setProperty('--x',((i*43+17)%97)+'%');p.style.setProperty('--y',((i*71+11)%89)+'%');
      p.style.setProperty('--delay',(-((i*7)%31)/4)+'s');p.style.setProperty('--dur',(3.2+(i%7)*.57)+'s');
      p.style.setProperty('--size',(3+i%4*2)+'px');weather.appendChild(p)
    }
    arena.prepend(weather)
  },
  pulse(arena,target){
    if(!arena)return;const flash=document.createElement('span');flash.className='combat-pulse '+target;flash.setAttribute('aria-hidden','true');arena.appendChild(flash);
    flash.addEventListener('animationend',()=>flash.remove(),{once:true});setTimeout(()=>flash.remove(),850);
    if(target==='boss-impact'||target==='hero-impact'){arena.classList.remove('combat-shake');void arena.offsetWidth;arena.classList.add('combat-shake');setTimeout(()=>arena.classList.remove('combat-shake'),420)}
    if(target==='boss-impact')GameAudio.play('impact');
    else if(target==='hero-impact')GameAudio.play('heroHurt');
    else if(target==='hero-shield')GameAudio.play('shield');
    else if(target==='hero-charge'||target==='boss-charge')GameAudio.play('charge');
  },
  say(arena,message,ms=2700){const el=arena?.querySelector('.say,.bsay');if(!el)return;
    el.textContent=message||'';el.hidden=!message;el.classList.remove('combat-speaking');
    if(!message)return;el.style.setProperty('--combat-say-ms',ms+'ms');void el.offsetWidth;el.classList.add('combat-speaking');
    const token=String((Number(el.dataset.sayToken)||0)+1);el.dataset.sayToken=token;
    setTimeout(()=>{if(el.isConnected&&el.dataset.sayToken===token){el.hidden=true;el.classList.remove('combat-speaking')}},ms)},
  fx(arena,kind,index=0){if(!arena)return;const el=document.createElement('span');el.className='combat-fx '+kind;
    if(kind==='boss-shot'&&!arena.dataset.combatClimate)this.decorate(arena,this.climates[index]||'thunder');
    if(kind==='hero-shot'||kind==='boss-shot')el.style.setProperty('--combat-travel',Math.max(130,arena.clientWidth*.65)+'px');
    if(kind==='boss-shot')el.style.backgroundPosition=this.frame(index);
    else if(kind==='hero-shot')el.style.backgroundPosition='0 0';
    if(kind==='hero-shot'){GameAudio.play('laser');const hero=arena.querySelector('.combat-hero,.craft');if(hero){hero.classList.remove('is-striking');void hero.offsetWidth;hero.classList.add('is-striking');setTimeout(()=>hero.classList.remove('is-striking'),550)}this.pulse(arena,'hero-charge')}
    if(kind==='boss-shot'){GameAudio.play('bossShot');this.pulse(arena,'boss-charge');setTimeout(()=>{if(arena.isConnected){this.pulse(arena,'hero-impact');const hero=arena.querySelector('.combat-hero,.craft');if(hero){hero.classList.add('is-recoiling');setTimeout(()=>hero.classList.remove('is-recoiling'),450)}}},500)}
    if(kind==='impact'){GameAudio.play('impact');this.pulse(arena,'boss-impact')}
    if(kind==='shield'){GameAudio.play('shield');this.pulse(arena,'hero-shield')}
    arena.appendChild(el);el.addEventListener('animationend',()=>el.remove(),{once:true});setTimeout(()=>el.remove(),1000);return el}
};
CombatUI.install();
if(typeof document!=='undefined'&&document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>CombatUI.install());
}

