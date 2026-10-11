/* ดาวสายฟ้าบนหน้าแผนที่: แสดงเหมือนหน้าเลือกวิชา ป.1 (ผิวดาวสร้างด้วยโค้ด + วงแหวน + มอนสเตอร์ Golden Parasite ขยับท่า) */
(function(){
  const PERIOD=6,TW=512,TH=256;
  function noise2(seed){
    let s=(seed*9301+49297)%233280;const rnd=()=>(s=(s*9301+49297)%233280)/233280;
    const p=Array.from({length:256},(_,i)=>i);
    for(let i=255;i>0;i--){const j=Math.floor(rnd()*(i+1));[p[i],p[j]]=[p[j],p[i]]}
    const perm=new Uint8Array(512);for(let i=0;i<512;i++)perm[i]=p[i&255];
    const val=Float32Array.from({length:256},rnd);
    const h=(a,b)=>val[perm[(perm[a&255]+(b&255))&511]];
    const fade=x=>x*x*(3-2*x);
    return (x,y,P)=>{
      const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;
      const x0=((xi%P)+P)%P,x1=(x0+1)%P,u=fade(xf),v=fade(yf);
      return (h(x0,yi)*(1-u)+h(x1,yi)*u)*(1-v)+(h(x0,yi+1)*(1-u)+h(x1,yi+1)*u)*v;
    };
  }
  const fbm=(n,x,y,P,oct=5)=>{let a=.5,f=1,sum=0,norm=0;for(let o=0;o<oct;o++){sum+=a*n(x*f,y*f,P*f);norm+=a;a*=.5;f*=2}return sum/norm};
  const mixc=(c1,c2,k)=>[c1[0]+(c2[0]-c1[0])*k,c1[1]+(c2[1]-c1[1])*k,c1[2]+(c2[2]-c1[2])*k];
  const grad=(stops,x)=>{
    if(x<=stops[0][0])return stops[0][1];
    for(let i=1;i<stops.length;i++)if(x<=stops[i][0])return mixc(stops[i-1][1],stops[i][1],(x-stops[i-1][0])/(stops[i][0]-stops[i-1][0]));
    return stops[stops.length-1][1];
  };
  // ผิวดาวธาตุสายฟ้า: แถบม่วง–ครีม + จุดพายุ (สูตรเดียวกับหน้าเลือกวิชา)
  const thunder=(n,m,x,y,u,v)=>{
    const w=fbm(n,x,y,PERIOD,4),t=v*16+w*5,b=(Math.sin(t)*.5+.5)*.75+(Math.sin(t*2.3+1)*.5+.5)*.25;
    let c=grad([[0,[38,12,86]],[.35,[92,58,196]],[.65,[188,168,248]],[1,[250,232,170]]],b);
    const d=((u-.3)/.09)**2+((v-.62)/.055)**2;
    if(d<1)c=mixc(c,mixc([255,214,130],[200,110,60],fbm(m,x*4,y*4,PERIOD*4,3)),(1-d)*.85);
    return c;
  };
  let cache=null;
  function texture(){
    if(cache)return cache;
    try{
      const cv=document.createElement('canvas');cv.width=TW;cv.height=TH;
      const ctx=cv.getContext('2d');if(!ctx)return null;
      const img=ctx.createImageData(TW,TH),d=img.data,seed=98,n=noise2(seed),m=noise2(seed+77);
      for(let j=0;j<TH;j++)for(let i=0;i<TW;i++){
        const u=i/TW,v=j/TH,c=thunder(n,m,u*PERIOD,v*PERIOD/2,u,v),k=(j*TW+i)*4;
        d[k]=c[0];d[k+1]=c[1];d[k+2]=c[2];d[k+3]=255;
      }
      ctx.putImageData(img,0,0);
      cache=cv.toDataURL('image/png');
    }catch(e){cache=null}
    return cache;
  }
  const BOLT='<svg viewBox="0 0 24 48" aria-hidden="true"><path d="M15 0 3 27h8L7 48l15-30h-8l5-18z"/></svg>';
  const POSE_LOOP=[0,0,3,3,0,0,4,0,0,1,0,3];
  let timer=0;
  function frame(el,f){el.style.backgroundPosition=(f%3)*50+'% '+Math.floor(f/3)*50+'%'}
  window.kkHeroPlanet=function(){
    const hw=document.querySelector('.hero-world');if(!hw)return;
    const old=hw.querySelector('.shared-solar,.kk-solar');if(old)old.remove();
    const el=document.createElement('div');el.className='kk-solar';el.setAttribute('aria-hidden','true');
    el.innerHTML='<span class="ks-halo"></span><span class="ks-aura"></span><span class="ks-ring"></span>'+
      '<span class="ks-planet"><span class="ks-surface"></span></span><span class="ks-ring front"></span>'+
      BOLT.replace('<svg','<svg class="ks-bolt b1"')+BOLT.replace('<svg','<svg class="ks-bolt b2"')+
      '<span class="ks-moon-orbit"><span class="ks-moon"></span></span><span class="ks-monster"></span>';
    hw.prepend(el);
    const tex=texture(),surf=el.querySelector('.ks-surface'),mon=el.querySelector('.ks-monster');
    if(tex)surf.style.backgroundImage='url('+tex+')';
    if(typeof ASSETS!=='undefined'&&ASSETS.boss){mon.style.backgroundImage='url("'+ASSETS.boss+'")';frame(mon,0)}
    clearInterval(timer);let tick=0;
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches)
      timer=setInterval(()=>{if(!mon.isConnected){clearInterval(timer);return}if(document.hidden)return;tick++;frame(mon,POSE_LOOP[tick%POSE_LOOP.length])},650);
  };
  const prev=renderMap;
  renderMap=function(){const r=prev.apply(this,arguments);try{kkHeroPlanet()}catch(e){}return r};
})();
