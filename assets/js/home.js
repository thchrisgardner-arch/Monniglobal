(function(){
  "use strict";
  var $=function(s,c){return (c||document).querySelector(s);}, $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));};
  var hdr=$('#hdr'), burger=$('#burger'), drawer=$('#drawer');
  window.addEventListener('scroll',function(){ hdr.classList.toggle('scrolled',window.scrollY>40); },{passive:true});
  burger.addEventListener('click',function(){ drawer.classList.toggle('open'); });
  $$('#drawer a').forEach(function(a){ a.addEventListener('click',function(){ drawer.classList.remove('open'); }); });

  /* TODO TU DINERO — pantallas de la app (datos ilustrativos). Un solo origen para el teléfono fijo y los teléfonos apilados. */
  var story=$('#cuenta'), IC=function(n,c){ return '<img class="'+(c||'ic')+'" src="assets/icons3d/'+n+'.webp" alt="" width="34" height="34" decoding="async">'; };
  var SCREENS=[
    '<div class="lbl">Saldo en USD</div><div class="amt xl">$640,00</div><div class="cchips"><span class="on">USD</span><span>COP</span><span>EUR</span></div><div class="qa"><div>'+IC('avion')+'Enviar</div><div>'+IC('cambio')+'Cambiar</div><div>'+IC('billetera')+'Recibir</div></div><div class="day">Hoy</div><div class="tx">'+IC('monedas')+'<div>Pago recibido<small>Ahora</small></div><b class="pos">+US$250</b></div>',
    '<div class="lbl">Tus monedas</div><div class="row"><span class="cur"><i class="dotc">CO</i>Pesos</span><b>$2.500.000</b></div><div class="row"><span class="cur"><i class="dotc">US</i>Dólares</span><b>$640</b></div><div class="row"><span class="cur"><i class="dotc">EU</i>Euros</span><b>€210</b></div>',
    '<div class="lbl">Movimientos</div><div class="day">Hoy</div><div class="tx">'+IC('monedas')+'<div>Pago recibido<small>Ahora</small></div><b class="pos">+US$250</b></div><div class="tx">'+IC('tarjeta')+'<div>Compra con tarjeta<small>10:24</small></div><b>−$38.000</b></div><div class="day">Ayer</div><div class="tx">'+IC('cambio')+'<div>Cambio de moneda<small>USD → EUR</small></div><b>€120</b></div>',
    '<div class="lbl">Cambiar moneda</div><div class="fld"><small>De · USD</small><b>US$ 100</b></div><div class="swap">'+IC('cambio')+'</div><div class="fld res"><small>A · EUR</small><b>Verás el importe exacto antes de confirmar</b></div><div class="pill">Continuar →</div>',
    '<div class="lbl">Enviar a</div><div class="amt" style="font-size:22px">María Fernández</div><div class="row"><span>Moneda</span><b>USD</b></div><div class="row"><span>Monto</span><b>$250,00</b></div><div class="row col"><span>Comisión</span><b>La verás antes de enviar</b></div><div class="pill">Confirmar →</div>',
    '<div class="lockt">9:41</div><div class="lockd">Hoy</div><div class="ntf">'+IC('campana','')+'<div><b>Pago recibido</b><span>Monni · ahora</span></div><em>+US$250</em></div>'
  ];
  var sBox=$('#storyScreen'), sEls=[];
  if(story && sBox){
    sEls=SCREENS.map(function(h,k){ var d=document.createElement('div'); d.className='scr'+(k===0?' on':''); d.innerHTML=h; sBox.appendChild(d); return d; });
    // teléfonos apilados (móvil / movimiento reducido): una pantalla por momento
    $$('.mo',story).forEach(function(mo){ var n=+mo.getAttribute('data-i'); if(!n) return; var w=document.createElement('div'); w.className='mo-phone'; w.setAttribute('aria-hidden','true'); w.innerHTML='<div class="phone"><div class="screen"><div class="scr on">'+SCREENS[n-1]+'</div></div></div>'; mo.insertBefore(w,mo.firstChild); });
  }

  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce || !window.gsap){ return; }
  gsap.registerPlugin(ScrollTrigger);
  var mobile=window.innerWidth<900, pinLen=mobile?1500:2600;

  /* HERO — entrada cinematográfica */
  var tl=gsap.timeline({defaults:{ease:'power3.out'}});
  tl.from('#top',{opacity:0,duration:.6})
    .from('[data-h]',{y:34,opacity:0,duration:.9,stagger:.14},'-=.2')
    .from('#heroCard',{y:120,opacity:0,rotationY:-30,duration:1.4},'-=.5')
    .to('#heroCard',{rotationY:-10,rotationX:4,duration:1.6,ease:'power2.inOut'},'-=.6')
    .from('#heroPhone',{y:90,opacity:0,duration:1.1},'-=.9');
  if(!mobile){
    gsap.to('#heroCard',{y:-70,scrollTrigger:{trigger:'#top',start:'top top',end:'bottom top',scrub:true}});
    gsap.to('#heroPhone',{y:-130,scrollTrigger:{trigger:'#top',start:'top top',end:'bottom top',scrub:true}});
  }

  /* Reveal genérico */
  $$('[data-r]').forEach(function(el){ gsap.from(el,{y:44,opacity:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}}); });
  gsap.from('[data-b]',{y:30,opacity:0,duration:.8,stagger:.15,scrollTrigger:{trigger:'.benefits',start:'top 80%',once:true}});
  gsap.from('[data-b] .fi',{scale:.95,opacity:0,duration:.7,stagger:.15,scrollTrigger:{trigger:'.benefits',start:'top 80%',once:true}});
  gsap.from('[data-s]',{y:30,opacity:0,duration:.7,stagger:.14,scrollTrigger:{trigger:'#seguridad .sec-g',start:'top 85%',once:true}});
  gsap.to('#shield',{rotationY:360,duration:20,ease:'none',repeat:-1,transformPerspective:900});

  /* Estados con pin (idempotente: sirve en scroll hacia atrás) */
  function pinStates(trigger,steps,screens,apply){
    var cur=-1, n=steps.length;
    ScrollTrigger.create({trigger:trigger,start:'top top',end:'+='+pinLen,pin:true,anticipatePin:1,onUpdate:function(s){
      var i=Math.min(n-1,Math.floor(s.progress*n)); if(i===cur) return; cur=i;
      steps.forEach(function(li,k){ li.classList.toggle('on',k===i); });
      if(screens) screens.forEach(function(sc,k){ gsap.to(sc,{opacity:k===i?1:0,duration:.35,overwrite:true}); });
      if(apply) apply(i);
    }});
  }
  /* TODO TU DINERO — scrollytelling: teléfono fijo y 7 estados (intro + 6 momentos) con la posición real del scroll */
  if(story && sEls.length){
    var mm=gsap.matchMedia();
    mm.add('(min-width:900px)',function(){
      var mos=$$('.mo',story), ticks=$$('#storyProg i'), phoneBox=$('#storyPhone'), cur=-1, N=mos.length, PER=520;
      story.classList.add('is-pinned');
      // Un solo componente: el fondo de ESTA sección cambia con el estado activo (blanco → negro → verde → blanco)
      var W={bg:'rgb(255,255,255)',fg:'rgb(0,0,0)'}, K={bg:'rgb(0,0,0)',fg:'rgb(255,255,255)'}, G={bg:'rgb(194,251,23)',fg:'rgb(0,0,0)'};
      var BGS=[W,W,K,K,G,G,W], themeTw=null;
      function themeTo(t){
        var fb=story.style.getPropertyValue('--bg')||W.bg, ff=story.style.getPropertyValue('--fg')||W.fg, o={p:0};
        if(themeTw) themeTw.kill();
        themeTw=gsap.to(o,{p:1,duration:.7,ease:'power2.inOut',onUpdate:function(){ story.style.setProperty('--bg',gsap.utils.interpolate(fb,t.bg,o.p)); story.style.setProperty('--fg',o.p<.5?ff:t.fg); }});
      }
      gsap.set(mos,{opacity:0,yPercent:-50}); gsap.set(mos[0],{opacity:1});
      function apply(i){
        var dir=i>cur?1:-1, prev=cur; cur=i; themeTo(BGS[i]);
        mos.forEach(function(m,k){
          m.classList.toggle('on',k===i);
          if(k===i){ gsap.fromTo(m,{opacity:0,y:prev<0?0:dir*18,yPercent:-50},{opacity:1,y:0,yPercent:-50,duration:.55,delay:prev<0?0:.15,ease:'power3.out',overwrite:true}); }
          else if(k===prev){ gsap.to(m,{opacity:0,y:-dir*18,yPercent:-50,duration:.35,ease:'power2.in',overwrite:true}); }
          else { gsap.set(m,{opacity:0}); }
        });
        var si=Math.max(0,i-1);
        sEls.forEach(function(s,k){ s.classList.toggle('on',k===si); gsap.to(s,{opacity:k===si?1:0,scale:k===si?1:.985,duration:.45,ease:'power2.out',overwrite:true}); });
        if(i>0 && prev!==i){ var rows=$$('.row,.tx,.qa div,.fld,.ntf,.cchips',sEls[si]); gsap.fromTo(rows,{y:12,opacity:0},{y:0,opacity:1,duration:.5,stagger:.06,delay:.12,ease:'power2.out',overwrite:true}); }
        ticks.forEach(function(t,k){ t.classList.toggle('on',k<i); });
      }
      var st=ScrollTrigger.create({trigger:story,start:'top top',end:'+='+(N*PER),pin:true,anticipatePin:1,onUpdate:function(s){ var i=Math.min(N-1,Math.floor(s.progress*N)); if(i!==cur) apply(i); }});
      apply(0);
      return function(){ if(themeTw) themeTw.kill(); story.style.removeProperty('--bg'); story.style.removeProperty('--fg'); story.classList.remove('is-pinned'); gsap.set(mos,{clearProps:'all'}); gsap.set(phoneBox,{clearProps:'all'}); sEls.forEach(function(s,k){ gsap.set(s,{clearProps:'all'}); s.classList.toggle('on',k===0); }); cur=-1; };
    });
  }


  /* Multimoneda — capas que se separan */
  gsap.from('#layers .l1',{y:120,scrollTrigger:{trigger:'#layers',start:'top 85%',end:'top 35%',scrub:true}});
  gsap.from('#layers .l3',{y:-120,scrollTrigger:{trigger:'#layers',start:'top 85%',end:'top 35%',scrub:true}});
  gsap.from('#layers .flow',{scaleY:0,transformOrigin:'top',scrollTrigger:{trigger:'#layers',start:'top 80%',end:'bottom 60%',scrub:true}});

  /* Tarjeta 3D */
  var ct=gsap.timeline({scrollTrigger:{trigger:'#cardStage',start:'top 85%',end:'bottom 25%',scrub:.6}});
  ct.from('#flip',{y:220,opacity:0,rotationY:-25,duration:1})
    .to('#flip',{rotationY:180,duration:1.2})
    .to('#flip',{rotationY:360,duration:1.2})
    .fromTo('#virt',{opacity:0,y:40},{opacity:1,y:0,duration:.8},'-=1.4')
    .to('.tag',{opacity:1,duration:.6,stagger:.2},'-=.8');

  /* Final */
  gsap.from('#finalStage .phone',{y:120,opacity:0,duration:1.4,ease:'power3.out',scrollTrigger:{trigger:'#finalStage',start:'top 90%',once:true}});
  gsap.from('#finalStage .fc',{y:140,opacity:0,rotation:-25,duration:1.4,delay:.2,ease:'power3.out',scrollTrigger:{trigger:'#finalStage',start:'top 90%',once:true}});

  /* Transiciones cromáticas: cada sección parte del tema de la anterior y se transforma al entrar (vinculado al scroll, reversible) */
  var TH={dark:['rgb(0,0,0)','rgb(255,255,255)'],light:['rgb(255,255,255)','rgb(0,0,0)'],lima:['rgb(194,251,23)','rgb(0,0,0)']};
  var themed=$$('section[data-theme]');
  themed.forEach(function(sec,n){
    if(!n || sec.id==='cuenta') return; var a=TH[themed[n-1].getAttribute('data-theme')], b=TH[sec.getAttribute('data-theme')];
    if(a[0]===b[0]&&a[1]===b[1]) return;
    // el fondo se mezcla de forma continua; el color de texto cambia en el punto medio (evita el cruce gris sobre gris)
    function paint(p){ sec.style.setProperty('--bg',gsap.utils.interpolate(a[0],b[0],p)); sec.style.setProperty('--fg',p<.5?a[1]:b[1]); }
    paint(0);
    ScrollTrigger.create({trigger:sec,start:'top 92%',end:'top 40%',invalidateOnRefresh:true,onUpdate:function(s){ paint(s.progress); },onRefresh:function(s){ paint(s.progress); }});
  });

  window.addEventListener('load',function(){ ScrollTrigger.refresh(); });
})();
