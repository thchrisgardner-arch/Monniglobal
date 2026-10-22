// Monni Home V2 — sistema de motion cinemático (excepción aprobada para esta página).
(function(){
  "use strict";
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Navbar ----------
  var header = document.querySelector('header[data-nav]');
  function onNavScroll(){ if (header) header.classList.toggle('scrolled', window.scrollY > 40); }
  onNavScroll();
  window.addEventListener('scroll', onNavScroll, { passive:true });

  var burger = document.getElementById('burgerBtn');
  var drawer = document.getElementById('drawer');
  if (burger && drawer){
    burger.addEventListener('click', function(){ drawer.classList.toggle('open'); });
  }

  // ---------- Generic reveal-on-enter ----------
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold:.15 });
  document.querySelectorAll('.reveal, .personas, .seguridad, .negocios').forEach(function(el){ io.observe(el); });

  // ---------- 07 Personas — click cambia a una foto real por momento ----------
  var moments = document.querySelectorAll('.personas-moment');
  var personasPhoto = document.querySelector('.personas-photo');
  var personasImg = document.querySelector('.personas-photo img');
  var momentImages = {
    viajar:   { src:'assets/img/hero-main.png',        alt:'Persona viajando con Monni' },
    comprar:  { src:'assets/img/personas-comprar.png', alt:'Persona pagando con Monni en una tienda' },
    trabajar: { src:'assets/img/personas-lifestyle.png', alt:'Persona trabajando desde casa con Monni' }
  };
  function selectMoment(m){
    moments.forEach(function(o){ o.classList.remove('active'); });
    m.classList.add('active');
    var key = m.getAttribute('data-moment');
    var data = momentImages[key];
    if (!data || !personasImg) return;
    if (personasImg.getAttribute('src') === data.src) return;
    if (personasPhoto) personasPhoto.classList.add('swapping');
    setTimeout(function(){
      personasImg.setAttribute('src', data.src);
      personasImg.setAttribute('alt', data.alt);
      if (personasPhoto) personasPhoto.classList.remove('swapping');
    }, 220);
  }
  moments.forEach(function(m){
    m.addEventListener('click', function(){ selectMoment(m); });
    m.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); selectMoment(m); }
    });
  });

  // ---------- Scroll-linked sections (rAF loop) ----------
  var heroScroll = document.querySelector('.hero-scroll');
  var heroSticky = document.querySelector('.hero-sticky');
  var heroPhoneWrap = document.querySelector('.hero-phone-wrap');
  var heroStates = document.querySelectorAll('.hero-phone-wrap .phone-state');
  var heroScene1L = document.querySelector('.hero-copy.scene1-left');
  var heroScene1R = document.querySelector('.hero-copy.scene1-right');
  var heroScene2L = document.querySelector('.hero-copy.scene2-left');
  var heroScene2R = document.querySelector('.hero-copy.scene2-right');
  var heroScene3 = document.querySelector('.hero-copy.scene3');
  var heroChips = document.querySelectorAll('.hero-chip');
  var heroCue = document.querySelector('.hero-scroll-cue');

  var cardScroll = document.querySelector('.card-scroll');
  var cardVisual = document.querySelector('.card-visual-big');
  var cardActions = document.querySelector('.card-actions');

  var globalScroll = document.querySelector('.global-scroll');
  var globalPhotos = document.querySelectorAll('.global-photo');
  var globalCities = document.querySelectorAll('.global-city');

  var brandExp = document.querySelector('.brand-exp');
  var floatEls = document.querySelectorAll('.float-el');

  var finalCta = document.querySelector('.final-cta');
  var finalWord = document.querySelector('.final-word');

  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t){ return a + (b - a) * t; }
  function remap(v, inA, inB, outA, outB){ var t = clamp((v - inA) / (inB - inA), 0, 1); return outA + (outB - outA) * t; }
  function smooth(t){ t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function hexToRgb(hex){ var n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function lerpColor(c1, c2, t){
    var r1 = hexToRgb(c1), r2 = hexToRgb(c2);
    var r = Math.round(lerp(r1[0], r2[0], t)), g = Math.round(lerp(r1[1], r2[1], t)), b = Math.round(lerp(r1[2], r2[2], t));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function sectionProgress(section){
    var rect = section.getBoundingClientRect();
    var vh = window.innerHeight;
    var total = rect.height - vh;
    if (total <= 0) return rect.top <= 0 ? 1 : 0;
    return clamp((0 - rect.top) / total, 0, 1);
  }

  // ---------- 01 Hero — secuencia única con pin ----------
  var LIMA = '#C2FB17', WHITE = '#FFFFFF', INK = '#000000';
  var heroChipOffsets = [
    { x: -220, y: -120 }, { x: 210, y: -90 }, { x: -190, y: 120 }, { x: 210, y: 130 }
  ];
  function updateHero(){
    if (!heroScroll || !heroSticky || reduced) return;
    var rect = heroScroll.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    var p = sectionProgress(heroScroll);

    // Fondo: lima -> blanco (0.10-0.24) -> blanco -> ink (0.82-1.0)
    var bg;
    if (p < 0.10) bg = LIMA;
    else if (p < 0.24) bg = lerpColor(LIMA, WHITE, smooth(remap(p, 0.10, 0.24, 0, 1)));
    else if (p < 0.82) bg = WHITE;
    else bg = lerpColor(WHITE, INK, smooth(remap(p, 0.82, 1.0, 0, 1)));
    heroSticky.style.background = bg;

    // Escena 1 — titular inicial
    var s1 = 1 - smooth(remap(p, 0.10, 0.18, 0, 1));
    if (heroScene1L){ heroScene1L.style.opacity = s1; heroScene1L.style.transform = 'translate(' + (-18*(1-s1)) + 'px,-50%)'; }
    if (heroScene1R){ heroScene1R.style.opacity = s1; heroScene1R.style.transform = 'translate(' + (18*(1-s1)) + 'px,-50%)'; }

    // Escena 2 — recibe/paga/mueve, flanqueando el teléfono
    var s2 = smooth(remap(p, 0.16, 0.24, 0, 1)) * (1 - smooth(remap(p, 0.52, 0.58, 0, 1)));
    if (heroScene2L){ heroScene2L.style.opacity = s2; heroScene2L.style.transform = 'translate(' + (-18*(1-s2)) + 'px,-50%)'; }
    if (heroScene2R){ heroScene2R.style.opacity = s2; heroScene2R.style.transform = 'translate(' + (18*(1-s2)) + 'px,-50%)'; }

    // Estados del teléfono durante el hold de escena 2 (Recibir / Pagar / Transferir)
    if (heroStates.length){
      var holdT = remap(p, 0.24, 0.52, 0, heroStates.length);
      var idx = clamp(Math.floor(holdT), 0, heroStates.length - 1);
      heroStates.forEach(function(el, i){ el.classList.toggle('active', i === idx); });
    }

    // Escena 3 — una cuenta, muchas monedas
    var s3 = smooth(remap(p, 0.56, 0.64, 0, 1)) * (1 - smooth(remap(p, 0.82, 0.90, 0, 1)));
    if (heroScene3){ heroScene3.style.opacity = s3; heroScene3.style.transform = 'translate(-50%,' + (-16*(1-s3)) + 'px)'; }

    // Monedas convergiendo hacia el teléfono
    var chipsOp = smooth(remap(p, 0.56, 0.70, 0, 1)) * (1 - smooth(remap(p, 0.82, 0.90, 0, 1)));
    var converge = smooth(remap(p, 0.56, 0.74, 0, 1));
    heroChips.forEach(function(chip, i){
      var off = heroChipOffsets[i % heroChipOffsets.length];
      var x = lerp(off.x, off.x * 0.42, converge);
      var y = lerp(off.y, off.y * 0.42, converge);
      chip.style.opacity = chipsOp;
      chip.style.transform = 'translate(calc(-50% + ' + x + 'px), calc(-50% + ' + y + 'px))';
    });

    // El teléfono: escala y salida
    var scale;
    if (p < 0.24) scale = lerp(1, 0.84, smooth(remap(p, 0.10, 0.24, 0, 1)));
    else if (p < 0.82) scale = 0.84;
    else scale = lerp(0.84, 0.5, smooth(remap(p, 0.82, 1.0, 0, 1)));
    var phoneOpacity = 1 - smooth(remap(p, 0.90, 1.0, 0, 1));
    if (heroPhoneWrap){
      heroPhoneWrap.style.transform = 'translate(-50%,-50%) scale(' + scale + ')';
      heroPhoneWrap.style.opacity = phoneOpacity;
    }

    if (heroCue) heroCue.style.opacity = 1 - smooth(remap(p, 0.0, 0.08, 0, 1));
  }

  function updateCard(){
    if (!cardScroll || !cardVisual) return;
    var rect = cardScroll.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    var p = sectionProgress(cardScroll);
    if (reduced){ cardVisual.style.transform = 'none'; cardActions && cardActions.classList.add('show'); return; }
    var scale = 0.62 + p * 0.48;
    var rotateY = (1 - p) * -14;
    var rotateX = (1 - p) * 4;
    var ty = (1 - p) * 24;
    cardVisual.style.transform = 'translateY(' + ty + 'px) scale(' + scale + ') rotateY(' + rotateY + 'deg) rotateX(' + rotateX + 'deg)';
    if (cardActions) cardActions.classList.toggle('show', p > 0.62);
  }

  function updateGlobal(){
    if (!globalScroll || globalPhotos.length === 0) return;
    var rect = globalScroll.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    var p = sectionProgress(globalScroll);
    var idx = clamp(Math.floor(p * globalPhotos.length), 0, globalPhotos.length - 1);
    globalPhotos.forEach(function(el, i){ el.classList.toggle('active', i === idx); });
    globalCities.forEach(function(el, i){ el.classList.toggle('active', i === idx); });
  }

  function updateBrandExp(){
    if (!brandExp || reduced) return;
    var rect = brandExp.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    var center = rect.top + rect.height / 2 - window.innerHeight / 2;
    floatEls.forEach(function(el, i){
      var factor = 0.02 + (i % 3) * 0.015;
      var offset = clamp(-center * factor, -30, 30);
      el.style.setProperty('--parallax', offset + 'px');
    });
  }

  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      updateHero(); updateCard(); updateGlobal(); updateBrandExp();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  // ---------- CTA final — parallax de mouse en "MONNI" ----------
  if (finalCta && finalWord && !reduced){
    finalCta.addEventListener('mousemove', function(e){
      var rect = finalCta.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = (e.clientX - cx) / rect.width;
      var dy = (e.clientY - cy) / rect.height;
      finalWord.style.transform = 'translate(calc(-50% + ' + (dx * 22) + 'px), calc(-50% + ' + (dy * 14) + 'px))';
    });
    finalCta.addEventListener('mouseleave', function(){
      finalWord.style.transform = 'translate(-50%,-50%)';
    });
  }
})();
