/* Transferencias — carrusel de escenas. Manual (puntos, teclado, deslizar); sin autoplay. */
(function(){
  "use strict";
  var $=function(s,c){return (c||document).querySelector(s);}, $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));};
  var car=$('#xfCar'); if(!car) return;
  var track=$('#xfTrack'), dotsBox=$('#xfDots'), cards=$$('.xf-card',track);
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches, g=window.gsap&&!reduce?window.gsap:null;
  var pv=3, page=0, pages=1, gap=22, busy=false;

  function perView(){ var w=window.innerWidth; return w<=760?1:(w<=1000?2:3); }
  function layout(){
    pv=perView(); track.style.setProperty('--pv',pv); gap=parseFloat(getComputedStyle(track).columnGap)||22;
    pages=Math.ceil(cards.length/pv); if(page>=pages) page=pages-1;
    dotsBox.innerHTML='';
    for(var i=0;i<pages;i++){ (function(i){ var b=document.createElement('button'); b.type='button'; b.setAttribute('aria-label','Ir al grupo '+(i+1)+' de '+pages); b.addEventListener('click',function(){ go(i); }); dotsBox.appendChild(b); })(i); }
    setX(false); paint();
  }
  function xFor(p){ var first=cards[Math.min(cards.length-1,p*pv)]; var last=Math.min(cards.length,(p+1)*pv); var x=first.offsetLeft; var maxX=track.scrollWidth-track.parentNode.clientWidth; return -Math.min(x,maxX<0?0:maxX); }
  function setX(anim){ var x=xFor(page); if(g&&anim){ g.to(track,{x:x,duration:.7,ease:'power3.inOut',overwrite:true}); } else if(g){ g.set(track,{x:x}); } else { track.style.transform='translate3d('+x+'px,0,0)'; } }
  function paint(){
    $$('button',dotsBox).forEach(function(b,i){ b.setAttribute('aria-current',i===page?'true':'false'); });
    cards.forEach(function(c,i){ var vis=i>=page*pv&&i<(page+1)*pv; c.setAttribute('aria-hidden',vis?'false':'true'); $$('a,button',c).forEach(function(el){ el.tabIndex=vis?0:-1; }); c.style.visibility=vis||busy?'visible':'hidden'; });
  }
  function go(p){
    p=Math.max(0,Math.min(pages-1,p)); if(p===page) return;
    var dir=p>page?1:-1, out=cards.filter(function(c,i){ return i>=page*pv&&i<(page+1)*pv; }), inn=cards.filter(function(c,i){ return i>=p*pv&&i<(p+1)*pv; });
    page=p; busy=true; cards.forEach(function(c){ c.style.visibility='visible'; });
    setX(true); paint();
    if(g){
      g.to(out,{opacity:0,duration:.35,ease:'power2.in',overwrite:true});
      g.fromTo(inn,{opacity:0,x:dir*40},{opacity:1,x:0,duration:.6,stagger:.08,delay:.2,ease:'power3.out',overwrite:true,onComplete:function(){ busy=false; paint(); g.set(cards,{clearProps:'x'}); }});
      g.delayedCall(.9,function(){ busy=false; paint(); });
    } else { busy=false; paint(); }
  }
  // teclado
  car.addEventListener('keydown',function(e){ if(e.key==='ArrowRight'){ go(page+1); e.preventDefault(); } else if(e.key==='ArrowLeft'){ go(page-1); e.preventDefault(); } else if(e.key==='Home'){ go(0); } else if(e.key==='End'){ go(pages-1); } });
  // deslizar (táctil / ratón) sin bloquear el scroll vertical
  var sx=0, sy=0, drag=false;
  track.addEventListener('pointerdown',function(e){ sx=e.clientX; sy=e.clientY; drag=true; });
  window.addEventListener('pointerup',function(e){ if(!drag) return; drag=false; var dx=e.clientX-sx, dy=e.clientY-sy; if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)*1.4){ go(page+(dx<0?1:-1)); } });
  var rt; window.addEventListener('resize',function(){ clearTimeout(rt); rt=setTimeout(layout,150); });

  layout();

  // Entrada escalonada (una sola vez)
  if(g && window.ScrollTrigger){
    g.registerPlugin(window.ScrollTrigger);
    var vis=cards.slice(0,pv), head=$$('[data-x="head"]'), caps=[], imgs=vis.map(function(c){ return $('.xf-img img',c); }), ui=vis.map(function(c){ return $('.xf-ui',c); });
    vis.forEach(function(c){ $$('[data-x="cap"]',c).forEach(function(el){ caps.push(el); }); });
    g.set(head,{opacity:0,y:28}); g.set(vis,{opacity:0,y:36}); g.set(imgs,{scale:1.12}); g.set(ui,{opacity:0,y:16}); g.set(caps,{opacity:0,y:14}); g.set(dotsBox,{opacity:0});
    var tl=g.timeline({paused:true,defaults:{ease:'power3.out'}});
    tl.to(head,{opacity:1,y:0,duration:.7,stagger:.1})
      .to(vis,{opacity:1,y:0,duration:.7,stagger:.12},'-=.35')
      .to(imgs,{scale:1,duration:1.1,stagger:.12,ease:'power2.out'},'<')
      .to(ui,{opacity:1,y:0,duration:.55,stagger:.1},'-=.7')
      .to(caps,{opacity:1,y:0,duration:.5,stagger:.04},'-=.6')
      .to(dotsBox,{opacity:1,duration:.5},'-=.2');
    window.ScrollTrigger.create({trigger:car,start:'top 82%',once:true,onEnter:function(){ tl.play(); }});
  }
})();
