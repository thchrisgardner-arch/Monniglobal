/* Monni V2 — sistema de movimiento (GSAP + ScrollTrigger).
   Principios: un solo recorrido continuo; el fondo cambia de tono entre capítulos;
   desplazamientos cortos y opacidad; parallax solo en hero, transferencias y tarjeta; sin pin ni scroll hijacking. */
(function(){
  "use strict";
  var root=document.documentElement;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce || !window.gsap || !window.ScrollTrigger){ root.classList.remove('js-motion'); return; }

  var $=function(s,c){return (c||document).querySelector(s);}, $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));};
  gsap.registerPlugin(ScrollTrigger);
  var EASE='power3.out';
  var syncHeader=window.MonniHeaderSync||function(){};

  /* 1 · Transiciones cromáticas
     Mientras una sección entra, ella y la anterior comparten el mismo fondo interpolado
     (no hay borde visible) y ambas cambian de tono de texto en el punto medio, así el contraste se mantiene.
     Todo se recalcula desde el progreso de cada transición: reversible y sin depender del orden de eventos. */
  var TONE={ ink:'#000000', gris:'#F7F8FB', white:'#FFFFFF', lima:'#C2FB17' };
  var toned=$$('main > section[data-tone], footer[data-tone]'); // section.credit entra en la secuencia pero su fondo es fijo (CSS)
  toned.forEach(function(s){ s.setAttribute('data-tone-base',s.getAttribute('data-tone')); });
  var shifts=[];
  toned.forEach(function(sec,i){
    if(!i) return;
    var a=toned[i-1].getAttribute('data-tone-base'), b=sec.getAttribute('data-tone-base');
    if(a===b) return;
    // data-tone-hex permite a una sección con fondo fotográfico fijar su color exacto (p. ej. el lima de la foto de crédito)
    var hexA=toned[i-1].getAttribute("data-tone-hex")||TONE[a], hexB=sec.getAttribute("data-tone-hex")||TONE[b];
    shifts.push({ prev:toned[i-1], cur:sec, a:a, b:b, mix:gsap.utils.interpolate(hexA,hexB), p:0 });
  });
  // Progreso desde la geometría real (entre 'top 92%' y 'top 38%' del viewport): inmune a cambios de layout
  var START=.92, END=.38, queued=false;
  function paintAll(){
    queued=false;
    var vh=window.innerHeight;
    shifts.forEach(function(t){ t.p=gsap.utils.clamp(0,1,(START*vh-t.cur.getBoundingClientRect().top)/((START-END)*vh)); });
    toned.forEach(function(s){
      var base=s.getAttribute('data-tone-base'), bg=TONE[base], tone=base, out=null, inn=null;
      shifts.forEach(function(t){ if(t.prev===s) out=t; if(t.cur===s) inn=t; });
      if(out && out.p>0){ bg=out.mix(out.p); tone=out.p<.5?out.a:out.b; }
      else if(inn && inn.p<1){ bg=inn.mix(inn.p); tone=inn.p<.5?inn.a:inn.b; }
      s.style.setProperty('--paint',bg);
      s.style.setProperty('--out',out?out.p:0); // progreso de salida, para apagar escenas fotográficas
      if(s.getAttribute('data-tone')!==tone) s.setAttribute('data-tone',tone);
    });
    syncHeader();
  }
  function queuePaint(){ if(!queued){ queued=true; requestAnimationFrame(paintAll); } }
  window.addEventListener('scroll',queuePaint,{passive:true});
  window.addEventListener('resize',queuePaint);
  window.addEventListener('load',queuePaint);
  window.MonniPaint=paintAll;
  paintAll();

  /* 2 · Hero: entrada con máscara de línea, luego producto */
  // Los .from() renderizan su estado inicial en el acto, así que el ocultamiento CSS ya no hace falta
  root.classList.remove('js-motion');
  var hero=gsap.timeline({ defaults:{ ease:EASE } });
  hero.from('[data-hero-line]',{ yPercent:110, duration:1, stagger:.12 })
      .from('[data-hero]',{ y:20, opacity:0, duration:.7, stagger:.08 },'-=.55')
      .from('.hero-phone .device',{ y:60, opacity:0, duration:1 },'-=.9')
      // La tarjeta solo anima variables CSS: su transform 3D vive en v2.css y no se sobrescribe
      .fromTo('.hero-card .card-3d',{ opacity:0, '--lift':'90px', '--ry':'-46deg', '--rx':'28deg' },{ opacity:1, '--lift':'0px', '--ry':'-20deg', '--rx':'14deg', duration:1.3 },'-=.8')
      .from('.hero-card .card-shadow',{ opacity:0, duration:1 },'<.3')
      .from('.hero-chips li',{ y:16, opacity:0, duration:.5, stagger:.08 },'-=.7');

  // Parallax moderado por capas (velocidad según data-depth)
  $$('.hero [data-depth]').forEach(function(el){
    var d=parseFloat(el.getAttribute('data-depth'))||.4;
    gsap.to(el,{ y:-140*d, ease:'none', scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:true } });
  });

  /* 3 · Propuesta: las palabras emergen de su máscara */
  gsap.from('[data-vw]',{ yPercent:105, duration:1, ease:EASE, stagger:.14, scrollTrigger:{ trigger:'.value-words', start:'top 72%', once:true } });

  /* Reveal genérico (bloques editoriales) */
  $$('[data-reveal]').forEach(function(el){
    gsap.from(el,{ y:32, opacity:0, duration:.8, ease:EASE, scrollTrigger:{ trigger:el, start:'top 86%', once:true } });
  });

  /* 4 · Cuenta: el teléfono acompaña la secuencia (estado en v2-ui.js); aquí solo su llegada */
  gsap.from('.account-sticky .device',{ y:80, opacity:0, duration:1, ease:EASE, scrollTrigger:{ trigger:'#cuenta', start:'top 70%', once:true } });

  /* 5 · Transferencias: escenas escalonadas con parallax interno */
  $$('[data-scene]').forEach(function(sc,i){
    gsap.from(sc,{ y:56, opacity:0, duration:.9, delay:i*.08, ease:EASE, scrollTrigger:{ trigger:'.move-cards', start:'top 80%', once:true } });
    gsap.from($('.float-ui',sc),{ y:18, opacity:0, duration:.6, delay:.35+i*.08, ease:EASE, scrollTrigger:{ trigger:'.move-cards', start:'top 80%', once:true } });
    gsap.fromTo($('.scene-img img',sc),{ yPercent:-4 },{ yPercent:4, ease:'none', scrollTrigger:{ trigger:sc, start:'top bottom', end:'bottom top', scrub:true } });
  });
  gsap.from('.facts > li',{ y:20, opacity:0, duration:.6, stagger:.08, ease:EASE, scrollTrigger:{ trigger:'.facts', start:'top 90%', once:true } });

  /* 6 · Tarjeta débito: encabezado, foto de marca y lista de beneficios */
  gsap.from('.card-head > *',{ y:28, opacity:0, duration:.8, stagger:.08, ease:EASE, scrollTrigger:{ trigger:'.card-head', start:'top 70%', once:true } });
  // Foto: parallax interno moderado; la lista entra escalonada
  gsap.fromTo('.card-figure img',{ yPercent:-4 },{ yPercent:4, ease:'none', scrollTrigger:{ trigger:'.card-figure', start:'top bottom', end:'bottom top', scrub:true } });
  gsap.from('.feat-list li, .card-feats .btn',{ y:24, opacity:0, duration:.6, stagger:.1, ease:EASE, scrollTrigger:{ trigger:'.card-feats', start:'top 75%', once:true } });

  /* 7 · Control: el interruptor cambia de estado una vez (muestra el gesto, no un dato) */
  var sw=$('#freezeSwitch');
  if(sw) ScrollTrigger.create({ trigger:'.b-freeze', start:'top 60%', once:true, onEnter:function(){ gsap.delayedCall(.6,function(){ sw.classList.add('is-on'); $('#freezeUi').classList.add('is-frozen'); }); } });

  // Crédito: la foto se asienta con el scroll (escala sutil, sin mover el texto)
  gsap.fromTo('.credit-photo',{ scale:1.08 },{ scale:1, ease:'none', scrollTrigger:{ trigger:'.credit', start:'top bottom', end:'center center', scrub:true } });

  /* 8 · Planes / 9 · Confianza */
  gsap.from('[data-plan]',{ y:40, opacity:0, duration:.8, stagger:.1, ease:EASE, scrollTrigger:{ trigger:'.plan-grid', start:'top 82%', once:true } });
  gsap.from('[data-layer]',{ x:-20, opacity:0, duration:.6, stagger:.1, ease:EASE, scrollTrigger:{ trigger:'.layers-list', start:'top 80%', once:true } });

  /* 11 · Cierre: las tarjetas suben desde el borde inferior */
  gsap.from('.final-card-ink',{ y:200, rotation:22, ease:'none', scrollTrigger:{ trigger:'.final', start:'top 90%', end:'top 25%', scrub:.6 } });
  gsap.from('.final-card:not(.final-card-ink)',{ y:260, rotation:-22, ease:'none', scrollTrigger:{ trigger:'.final', start:'top 85%', end:'top 15%', scrub:.6 } });

  window.addEventListener('load',function(){ ScrollTrigger.refresh(); });
})();
