(function(){
  "use strict";
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));};
  var hdr=document.getElementById('hdr'), burger=document.getElementById('burger'), drawer=document.getElementById('drawer');
  function sc(){ hdr.classList.toggle('scrolled',window.scrollY>40); } sc(); window.addEventListener('scroll',sc,{passive:true});
  burger.addEventListener('click',function(){ drawer.classList.toggle('open'); });
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Reveals */
  if('IntersectionObserver' in window){
    var ro=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); ro.unobserve(e.target); } }); },{threshold:.12});
    $$('.reveal').forEach(function(el){ ro.observe(el); });
  } else { $$('.reveal').forEach(function(el){ el.classList.add('in'); }); }

  /* Showcase: imágenes + línea de tiempo (autoplay al ser visible, pausa en hover/foco, clic para saltar) */
  $$('.show').forEach(function(box){
    var slides=$$('.sl',box), bars=$$('.tl-b',box), tl=box.querySelector('.tl'), cap=box.querySelector('.tl-cap'), stage=box.querySelector('.stage'), cur=0, visible=false;
    function go(i){
      cur=(i+slides.length)%slides.length;
      slides.forEach(function(s,k){ s.classList.toggle('on',k===cur); });
      bars.forEach(function(b,k){ b.classList.remove('on'); b.classList.toggle('done',k<cur); b.setAttribute('aria-current',k===cur?'true':'false'); });
      if(cap) cap.textContent=bars[cur].getAttribute('data-cap')||'';
      if(!reduce && visible){ void bars[cur].offsetWidth; bars[cur].classList.add('on'); } else if(reduce){ bars[cur].classList.add('done'); }
    }
    bars.forEach(function(b,k){
      b.addEventListener('click',function(){ go(k); });
      b.addEventListener('animationend',function(){ go(cur+1); });
    });
    ['mouseenter','focusin','touchstart'].forEach(function(ev){ stage.addEventListener(ev,function(){ tl.classList.add('paused'); },{passive:true}); });
    ['mouseleave','focusout','touchend'].forEach(function(ev){ stage.addEventListener(ev,function(){ tl.classList.remove('paused'); },{passive:true}); });
    go(0);
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ var v=es[0].isIntersecting; if(v&&!visible){ visible=true; go(cur); } visible=v; tl.classList.toggle('paused',!v); },{threshold:.35}).observe(box);
    } else { visible=true; go(0); }
  });
})();
