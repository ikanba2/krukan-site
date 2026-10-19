/* เน้นคำสำคัญ: นำคำศัพท์ในกล่อง "ศัพท์สำคัญ" ไปไฮไลต์ในเนื้อหาของหัวข้อเดียวกัน */
(function(){
  function esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
  function mark(root){
    root.querySelectorAll('.lesson:not([data-kw])').forEach(function(sec){
      sec.setAttribute('data-kw','1');
      var terms=[].map.call(sec.querySelectorAll('.glossary dt'),function(d){return d.textContent.trim()}).filter(function(t){return t.length>=2}).sort(function(a,b){return b.length-a.length});
      if(!terms.length)return;
      var re=new RegExp('('+terms.map(esc).join('|')+')','g');
      sec.querySelectorAll('p:not(.intro):not(.muted), .steps li').forEach(function(el){
        if(el.closest('.glossary,.callout,.self-check'))return;
        var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),list=[],n;
        while((n=w.nextNode()))list.push(n);
        list.forEach(function(t){
          if(!re.test(t.nodeValue)){re.lastIndex=0;return}
          re.lastIndex=0;
          var span=document.createElement('span');
          span.innerHTML=t.nodeValue.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(re,'<mark class="kw">$1</mark>');
          t.replaceWith.apply(t,span.childNodes);
        });
      });
    });
  }
  var main=document.getElementById('main');
  if(!main)return;
  new MutationObserver(function(){mark(main)}).observe(main,{childList:true,subtree:true});
  mark(main);
})();
