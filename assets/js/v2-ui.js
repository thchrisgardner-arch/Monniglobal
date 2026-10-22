/* Monni V2 — comportamiento de interfaz (funciona sin GSAP y con movimiento reducido). */
(function(){
  "use strict";
  var $=function(s,c){return (c||document).querySelector(s);}, $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));};

  /* Header: adopta el tono de la sección que tiene debajo y se vuelve sólido al desplazarse */
  var hdr=$('#hdr'), toned=$$('main > section[data-tone], footer[data-tone]'), ticking=false;
  function syncHeader(){
    ticking=false;
    var y=hdr.offsetHeight/2, cur=toned[0];
    for(var i=0;i<toned.length;i++){ var r=toned[i].getBoundingClientRect(); if(r.top<=y && r.bottom>y){ cur=toned[i]; break; } }
    if(hdr.getAttribute('data-tone')!==cur.getAttribute('data-tone')) hdr.setAttribute('data-tone',cur.getAttribute('data-tone'));
    hdr.style.setProperty('--hbg',getComputedStyle(cur).backgroundColor);
    hdr.classList.toggle('is-solid',window.scrollY>8);
  }
  function onScroll(){ if(!ticking){ ticking=true; requestAnimationFrame(syncHeader); } }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll);
  window.MonniHeaderSync=syncHeader; // v2-motion.js lo llama cuando pinta fondos
  syncHeader();

  /* Cuenta global: el paso centrado en pantalla define la pantalla del teléfono */
  var steps=$$('#cuenta .step'), screens=$$('#accScreen .scr'), dots=$$('#accDots i');
  function setStep(n){
    steps.forEach(function(s,k){ s.classList.toggle('is-on',k===n); });
    screens.forEach(function(s,k){ s.classList.toggle('is-on',k===n); });
    dots.forEach(function(d,k){ d.classList.toggle('is-on',k===n); });
  }
  if('IntersectionObserver' in window && steps.length){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting) setStep(+e.target.getAttribute('data-step')); });
    },{rootMargin:'-45% 0px -45% 0px'});
    steps.forEach(function(s){ io.observe(s); });
  }

  /* Preguntas frecuentes: acordeón accesible (botón + región) */
  $$('#faqList .acc-item').forEach(function(item){
    var btn=$('button',item);
    btn.addEventListener('click',function(){
      var open=btn.getAttribute('aria-expanded')!=='true';
      btn.setAttribute('aria-expanded',String(open));
      item.classList.toggle('is-open',open);
    });
  });
})();
