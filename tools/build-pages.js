// Genera las páginas internas de Monni y sincroniza el footer compartido (partials/footer.html) en todas, incluida la home.
// Uso: node tools/build-pages.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const IMG = { hero:'assets/img/hero-main.png', bog:'assets/img/city-bogota.png', cdmx:'assets/img/city-cdmx.png', mad:'assets/img/city-madrid.png', nyc:'assets/img/city-nyc.png', life:'assets/img/personas-lifestyle.png', buy:'assets/img/personas-comprar.png', card:'assets/img/cards/web/debito-verde.webp' };

const NAV = [['personas.html','Personas'],['empresas.html','Empresas'],['cuenta.html','Cuenta'],['tarjeta.html','Tarjeta'],['pagos.html','Pagos'],['ayuda.html','Recursos']];
// Iconos 3D oficiales de Monni (assets/icons3d). null = ICONO PENDIENTE (no inventar).
const ICON = { globe:'globo', send:'avion', card:'tarjeta', shield:'escudo', list:'reloj', swap:'cambio', code:null, bolt:'telefono', lock:'escudo', users:'usuarios', bell:'campana', coin:'monedas', bank:'banco', wallet:'billetera', chart:'barras', chat:'chat', pct:'porcentaje', doc:'documento-check', scan:'scan', gear:'engranaje', cardplus:'tarjeta-mas' };
const i3 = (n, c='') => n ? `<img class="i3 ${c}" src="assets/icons3d/${n}.webp" alt="" width="64" height="64" loading="lazy" decoding="async">` :'<div class="i3-pend" title="Icono pendiente">ICONO<br>PENDIENTE</div>';

// ---------- helpers de slides ----------
const photo = (img, big, smol, chip, foot=[]) => `<div class="sl"><img class="bgi" src="${IMG[img]}" alt="" loading="lazy" decoding="async"><span class="chip-t">${chip}</span><b class="big">${big}</b><span class="smol">${smol}</span>${foot.length?`<div class="foot">${foot.map(f=>`<span>${f}</span>`).join('')}</div>`:''}</div>`;
const lima = (big, smol) => `<div class="sl sl-lima"><b class="big">${big}</b><span class="smol">${smol}</span></div>`;
const cardS = (big, smol) => `<div class="sl sl-card"><img class="cv" src="${IMG.card}" alt="Tarjeta Monni" loading="lazy" decoding="async"><span class="smol" style="margin-top:26px">${smol}</span></div>`;
const ui = (rows, title='Saldo total', amt='$3.450', pill='Enviar →') => `<div class="sl sl-ui"><div class="phone"><div class="screen"><div class="scr on"><div class="lbl">${title}</div><div class="amt">${amt}</div>${rows.map(r=>`<div class="row"><span class="cur">${r[0]}</span><b>${r[1]}</b></div>`).join('')}<div class="pill">${pill}</div></div></div></div></div>`;
const cur = (c, t) => c.startsWith('@') ? `<i class="dotc di"><img src="assets/icons3d/${c.slice(1)}.webp" alt="" width="22" height="22"></i>${t}` : `<i class="dotc">${c}</i>${t}`;
const MULTI = [[cur('CO','COP'),'$2.500.000'],[cur('US','USD'),'$640'],[cur('EU','EUR'),'€210']];

// Showcase: slides = [{html, cap}]
function showcase({ theme, rev, pill, h2, p, ctas, slides, id }) {
  return `<section class="${theme}" ${id?`id="${id}"`:''}><div class="wrap show${rev?' rev':''}">
  <div class="show-t reveal"><h2>${h2}</h2><p class="sub">${p}</p><div class="hero-cta">${ctas}</div></div>
  <div class="reveal"><div class="stage" role="group" aria-roledescription="carrusel" aria-label="${pill}">${slides.map(s=>s.html).join('')}</div>
  <div class="tl" role="tablist" style="--d:5.5s">${slides.map((s,i)=>`<button class="tl-b" aria-label="Ver imagen ${i+1}: ${s.cap}" data-cap="${s.cap}"><i></i></button>`).join('')}</div><div class="tl-cap" aria-live="off"></div></div>
  </div></section>`;
}
const feats = (theme, h2, sub, items) => `<section class="${theme}"><div class="wrap"><div class="reveal"><h2>${h2}</h2>${sub?`<p class="sub">${sub}</p>`:''}</div><div class="feat">${items.map(it=>`<div class="ft reveal"><div class="fi">${i3(ICON[it[0]])}</div><h3>${it[1]}</h3><p>${it[2]}</p></div>`).join('')}</div></div></section>`;
const steps = (theme, h2, items) => `<section class="${theme}"><div class="wrap"><h2 class="reveal">${h2}</h2><div class="stp">${items.map(i=>`<div class="sp reveal"><h3>${i[0]}</h3><p>${i[1]}</p></div>`).join('')}</div></div></section>`;
const faq = (items) => `<section class="light"><div class="wrap"><h2>Lo que más nos preguntan.</h2><div class="faq">${items.map(i=>`<details><summary>${i[0]}<i>+</i></summary><p>${i[1]}</p></details>`).join('')}</div></div></section>`;
const next = (items) => `<section class="dark"><div class="wrap"><div class="next">${items.map(i=>`<a class="nx" href="${i[0]}"><small>${i[1]}</small><b>${i[2]}</b><p>${i[3]}</p><span>Ver más →</span></a>`).join('')}</div></div></section>`;

const G = { cta1:'<a class="btn btn-ink" href="index.html#lista">Unirme a la lista</a>', cta2:'<a class="btn btn-line" href="ayuda.html">Ver preguntas</a>', ctaD:'<a class="btn btn-lima" href="index.html#lista">Unirme a la lista</a>' };
const ctaL = '<a class="btn btn-lima" href="index.html#lista">Unirme a la lista</a>';
const SOON = 'Monni está en lista de espera. Únete y te avisamos cuando tu acceso esté disponible.';

// ---------- páginas ----------
const pages = [
{ file:'cuenta.html', nav:'cuenta.html', title:'Cuenta multimoneda', eyebrow:'Cuenta', h1:'Una cuenta para todo tu dinero.', sub:'Recibe, guarda y administra pesos, dólares y euros desde una sola cuenta Monni.', desc:'Cuenta multimoneda de Monni: COP, USD y EUR en un solo lugar.',
  tabs:[['#recibe','Recibe'],['#controla','Controla']],
  body:[
    showcase({ id:'recibe', theme:'light', pill:'Cuenta', h2:'Tu dinero en la moneda que lo necesitas', p:'Mantén COP, USD y EUR en la misma cuenta y mira todo tu saldo de un vistazo. Los montos de las imágenes son ejemplos.', ctas:G.cta1+G.cta2, slides:[
      { cap:'Un saldo total', html:ui(MULTI) },
      { cap:'Recibe pagos del exterior', html:photo('nyc','+ US$ 640','Pago recibido · ejemplo','Recibir',['USD','Notificación al instante']) },
      { cap:'Muévete entre monedas', html:photo('mad','€210','Saldo en euros · ejemplo','Euros',['EUR','Tipo de cambio real del momento']) },
      { cap:'Pesos cuando los necesites', html:photo('bog','$2.500.000','Saldo en pesos · ejemplo','Pesos',['COP']) } ]}),
    feats('off','Hecha para moverse contigo','',[['globe','Tres monedas','COP, USD y EUR en una sola cuenta.'],['swap','Cambio claro','Cambia entre monedas al tipo de cambio real del momento.'],['list','Movimientos ordenados','Consulta cada movimiento con detalle desde la app.'],['bell','Avisos al instante','Recibe notificaciones cuando tu dinero llega.']]),
    showcase({ id:'controla', theme:'dark', rev:true, pill:'Control', h2:'Todo bajo tu control', p:'Revisa tus saldos, tus movimientos y tus tarjetas desde la app, en cualquier momento.', ctas:ctaL, slides:[
      { cap:'Tus movimientos', html:ui([[cur('US','Pago recibido'),'+$640'],[cur('CO','Compra'),'−$38.000'],[cur('EU','Cambio'),'€120']],'Movimientos','Hoy','Ver todo') },
      { cap:'Tu tarjeta', html:cardS('','Controla tu tarjeta desde la app') },
      { cap:'Para viajar', html:photo('cdmx','Sin fronteras','Tu cuenta viaja contigo','Viajar') } ]}),
    steps('light','Cómo empezar',[['Únete a la lista','Déjanos tus datos para entrar a la lista de espera.'],['Te avisamos','Cuando tu acceso esté disponible, te escribimos.'],['Abre tu cuenta','Descarga la app y configura tu cuenta.'],['Úsala','Recibe, cambia y paga desde un solo lugar.']]),
    faq([['¿Qué monedas puedo tener?','Pesos colombianos (COP), dólares (USD) y euros (EUR).'],['¿Ya puedo abrir mi cuenta?',SOON],['¿Cómo veo mis saldos?','Desde la app Monni verás todos tus saldos y movimientos.']]),
    next([['tarjeta.html','Tarjeta','Tarjeta Monni','Paga con tu saldo en Colombia y el exterior.'],['transferencias.html','Transferencias','Mueve tu dinero','Envía y recibe entre países y monedas.'],['seguridad.html','Seguridad','Seguridad inteligente','Controla tarjetas, límites y movimientos.']])
  ]},
{ file:'tarjeta.html', nav:'tarjeta.html', title:'Tarjeta Monni', eyebrow:'Tarjeta', h1:'Paga con tu saldo, aquí y allá.', sub:'La tarjeta Monni te deja usar tu dinero en Colombia y en el exterior.', desc:'Tarjeta Monni: paga con tu saldo en Colombia y el exterior.',
  tabs:[['#paga','Paga'],['#virtual','Virtual']],
  body:[
    showcase({ id:'paga', theme:'light', pill:'Tarjeta', h2:'Paga en la moneda que quieras', p:'Usa tu saldo para comprar en tiendas físicas y en línea. Tú decides con qué moneda pagar.', ctas:G.cta1+G.cta2, slides:[
      { cap:'Tu tarjeta Monni', html:cardS('','Tarjeta física Monni') },
      { cap:'En tu día a día', html:photo('buy','Paga fácil','Compra en tiendas y en línea','Comprar',['Con tu saldo']) },
      { cap:'Cuando viajas', html:photo('life','Viaja ligero','Usa tu tarjeta en el exterior','Viajar',['Colombia y exterior']) },
      { cap:'Eliges la moneda', html:lima('COP · USD · EUR','Paga con el saldo que prefieras') } ]}),
    feats('off','Una tarjeta, muchas formas de pagar','',[['card','Física y virtual','Úsala en tienda o en línea.'],['globe','Para el mundo','Úsala en Colombia y en el exterior.'],['lock','Tú la controlas','Gestiona límites y bloqueo desde la app.'],['bolt','Sin cambiar de app','Tu saldo y tu tarjeta, en el mismo lugar.']]),
    showcase({ id:'virtual', theme:'dark', rev:true, pill:'Virtual', h2:'Tu tarjeta virtual, lista para comprar en línea', p:'Úsala para tus compras digitales y suscripciones. Las imágenes son ilustrativas.', ctas:ctaL, slides:[
      { cap:'Compras en línea', html:photo('hero','En línea','Paga tus compras digitales','Virtual') },
      { cap:'Controla desde la app', html:ui([[cur('@tarjeta','Tarjeta virtual'),'Activa'],[cur('@escudo','Bloquear'),'Un toque'],[cur('@barras','Límites'),'Tú eliges']],'Tarjeta','•••• 0000','Gestionar') } ]}),
    steps('light','Así se usa',[['Únete a la lista','Entra a la lista de espera de Monni.'],['Solicita tu tarjeta','Cuando tengas acceso, pídela desde la app.'],['Actívala','Actívala y define tus límites.'],['Paga','Úsala con tu saldo en Colombia y el exterior.']]),
    faq([['¿La tarjeta es física o virtual?','Monni contempla ambas experiencias de pago.'],['¿Puedo usarla en el exterior?','Sí, la tarjeta Monni está pensada para pagar en Colombia y en el exterior.'],['¿Cuándo estará disponible?',SOON]]),
    next([['cuenta.html','Cuenta','Cuenta multimoneda','COP, USD y EUR en un solo lugar.'],['pagos.html','Pagos','Elige cómo pagar','Tarjeta, pagos digitales y más.'],['seguridad.html','Seguridad','Seguridad inteligente','Controla límites y movimientos.']])
  ]},
{ file:'transferencias.html', nav:'', title:'Transferencias globales', eyebrow:'Transferencias', h1:'Mueve tu dinero sin fronteras.', sub:'Envía y recibe dinero entre países y monedas con el tipo de cambio real del momento.', desc:'Transferencias globales con Monni.',
  tabs:[['#mover','Mover dinero']],
  body:[
    showcase({ id:'mover', theme:'light', pill:'Transferencias', h2:'Mueve dinero con libertad', p:'Conecta tu cuenta y mueve dinero entre países y monedas al tipo de cambio real. Los costos, si los hay, se muestran antes de confirmar.', ctas:G.cta1+'<a class="btn btn-line" href="ayuda.html">Ver costos</a>', slides:[
      { cap:'Elige cuánto', html:photo('nyc','$1.000','Monto de ejemplo','Enviar',['USD','Demostración']) },
      { cap:'Elige el destino', html:photo('mad','→ EUR','Moneda destino','Destino',['Tipo de cambio real del momento']) },
      { cap:'Revisa y confirma', html:ui([[cur('US','Envías'),'$1.000'],[cur('EU','Reciben'),'ver al confirmar'],[cur('@porcentaje','Costos'),'Siempre claros']],'Resumen','Listo','Confirmar') },
      { cap:'Listo', html:lima(i3('documento-check','xl'),'Enviado · te avisamos cuando llegue') } ]}),
    feats('off','Claro de principio a fin','',[['swap','Tipo de cambio real','Sin sorpresas: ves el cambio antes de confirmar.'],['list','Costos por adelantado','Si hay costos, los ves antes de enviar.'],['globe','Entre países','Pensado para moverse entre monedas y fronteras.'],['bell','Seguimiento','Recibe avisos del estado de tu transferencia.']]),
    steps('dark','Cómo funciona',[['Elige el monto','Indica cuánto quieres enviar.'],['Selecciona la moneda','Pesos, dólares o euros.'],['Confirma','Revisa el resumen y confirma.'],['Recibe el aviso','Te notificamos cuando se complete.']]),
    faq([['¿Cuál es el tipo de cambio?','El real del momento. Lo ves antes de confirmar.'],['¿Hay costos?','Los costos, si existen, se muestran por adelantado.'],['¿Cuándo está disponible?',SOON]]),
    next([['stablecoins.html','Stablecoins','USDC y EURC','Activos virtuales respaldados en dólares y euros.'],['cuenta.html','Cuenta','Cuenta multimoneda','Todo tu dinero en un solo lugar.'],['empresas.html','Empresas','Para empresas','Cuentas globales, pagos y API.']])
  ]},
{ file:'stablecoins.html', nav:'', title:'Stablecoins', eyebrow:'Stablecoins', h1:'USDC y EURC, sin complicaciones.', sub:'Las stablecoins son activos virtuales con valor referenciado a una moneda fiat. No son dinero fiat.', desc:'Stablecoins en Monni: USDC y EURC.',
  tabs:[['#que','Qué son']],
  body:[
    showcase({ id:'que', theme:'light', pill:'Stablecoins', h2:'Dólares y euros digitales', p:'USDC y EURC son stablecoins de dólar y euro. Son activos virtuales y no constituyen dinero fiat ni depósitos.', ctas:G.cta1, slides:[
      { cap:'USDC', html:lima('USDC','Stablecoin referenciada al dólar') },
      { cap:'EURC', html:lima('EURC','Stablecoin referenciada al euro') },
      { cap:'Del fiat al digital', html:ui([[cur('@monedas','Fiat'),'USD · EUR'],[cur('@cambio','Conversión'),'En la app'],[cur('@globo','Digital'),'USDC · EURC']],'Flujo','Fiat y digital','Ver detalle') } ]}),
    feats('off','Lo que debes saber','',[['coin','Activo virtual','No es dinero fiat y su valor puede variar.'],['swap','Referenciada','Su valor se refiere a una moneda fiat.'],['shield','Con claridad','Te mostramos la información antes de operar.'],['list','Tu decisión','Tú decides si usarlas y cuándo.']]),
    faq([['¿Las stablecoins son dinero?','No. Son activos virtuales, no dinero fiat.'],['¿Cuáles ofrece Monni?','USDC y EURC.'],['¿Ya están disponibles?',SOON]]),
    next([['transferencias.html','Transferencias','Mueve tu dinero','Entre países y monedas.'],['pagos.html','Pagos','Elige cómo pagar','Tarjeta y pagos digitales.'],['seguridad.html','Seguridad','Seguridad inteligente','Controla tus movimientos.']])
  ]},
{ file:'personas.html', nav:'personas.html', title:'Monni para personas', eyebrow:'Personas', h1:'Para viajar, comprar y trabajar sin fronteras.', sub:'Una sola cuenta para tu vida en varias monedas.', desc:'Monni para personas: viajar, comprar y trabajar.',
  tabs:[['#viajar','Viajar']],
  body:[
    showcase({ id:'viajar', theme:'light', pill:'Personas', h2:'Tu dinero, donde estés', p:'Viaja, compra en línea y recibe pagos del exterior con la misma cuenta.', ctas:G.cta1, slides:[
      { cap:'Viajar', html:photo('life','Viaja ligero','Paga en el exterior con tu tarjeta','Viajar') },
      { cap:'Comprar', html:photo('buy','Compra en línea','Elige con qué moneda pagar','Comprar') },
      { cap:'Trabajar', html:photo('hero','Recibe pagos','Cobra por tu trabajo desde el exterior','Trabajar') },
      { cap:'Tu ciudad', html:photo('bog','Bogotá','Tu cuenta en pesos','Colombia') } ]}),
    feats('off','Hecha para tu día a día','',[['globe','Multimoneda','COP, USD y EUR.'],['card','Tarjeta','Paga con tu saldo.'],['send','Transferencias','Mueve dinero entre países.'],['shield','Seguridad','Controla límites y movimientos.']]),
    faq([['¿Para quién es Monni?','Para personas que reciben, pagan o se mueven entre monedas.'],['¿Cómo me uno?',SOON]]),
    next([['cuenta.html','Cuenta','Cuenta multimoneda','Tu saldo en un solo lugar.'],['tarjeta.html','Tarjeta','Tarjeta Monni','Paga aquí y allá.'],['transferencias.html','Transferencias','Mueve tu dinero','Entre monedas.']])
  ]},
{ file:'empresas.html', nav:'empresas.html', title:'Monni para empresas', eyebrow:'Empresas', h1:'Cuentas globales y pagos para tu empresa.', sub:'Cuentas, pagos, tesorería y API para operar entre países.', desc:'Monni para empresas: cuentas globales, pagos, tesorería y API.', purple:true,
  tabs:[['#cuentas','Cuentas globales'],['pagos.html','Pagos y API']],
  body:[
    showcase({ id:'cuentas', theme:'light', pill:'Empresas', h2:'Cuentas globales para tu equipo', p:'Recibe y administra dinero en varias monedas, con control para tu operación. Imágenes ilustrativas.', ctas:'<a class="btn btn-ink" href="index.html#lista">Hablar con Monni</a>'+'<a class="btn btn-line" href="pagos.html">Ver API</a>', slides:[
      { cap:'Cuentas globales', html:ui(MULTI,'Saldo empresa','$3.450','Pagar →') },
      { cap:'Pagos a proveedores', html:photo('nyc','Paga global','Envía pagos a otros países','Pagos',['Proveedores','Equipos']) },
      { cap:'Equipos distribuidos', html:photo('mad','Tu equipo','Pagos a personas en distintos países','Equipos') } ]}),
    feats('off','Para operar entre países','',[['globe','Cuentas globales','Recibe en varias monedas.'],['send','Pagos','Paga a proveedores y equipos.'],['list','Tesorería','Visibilidad de tus saldos.'],['code','API','Integra Monni a tu producto.']]),
    faq([['¿Monni ofrece API?','Sí, hay una experiencia de API para integrar pagos. Ver Pagos y API.'],['¿Cómo hablo con el equipo?','Desde la lista de espera o el contacto (pendiente).']]),
    next([['pagos.html','Pagos','Pagos y API','Integra pagos globales.'],['seguridad.html','Seguridad','Seguridad inteligente','Controles para tu operación.'],['cuenta.html','Cuenta','Cuenta multimoneda','Para personas.']])
  ]},
{ file:'pagos.html', nav:'pagos.html', title:'Pagos y API', eyebrow:'Pagos', h1:'Elige cómo pagar, o integra pagos.', sub:'Tarjeta, pagos digitales y una API para construir sobre Monni.', desc:'Pagos Monni y API.',
  tabs:[['#formas','Formas de pago'],['#api','API']],
  body:[
    showcase({ id:'formas', theme:'light', pill:'Pagos', h2:'Elige cómo pagar', p:'Tarjeta física, tarjeta virtual y pagos digitales: un solo saldo.', ctas:G.cta1, slides:[
      { cap:'Tarjeta', html:cardS('','Paga con tu tarjeta') },
      { cap:'Virtual', html:photo('hero','En línea','Compras digitales','Virtual') },
      { cap:'Desde la app', html:ui([[cur('@telefono','Pagar'),'Un toque'],[cur('@cambio','Moneda'),'Tú eliges'],[cur('@documento-check','Confirmar'),'Listo']],'Pagar','$38.000','Pagar') } ]}),
    `<section class="dark" id="api"><div class="wrap two"><div class="reveal"><h2>Construye pagos globales.</h2><p class="sub">Crea pagos y recibe eventos con una API pensada para equipos de producto.</p><div class="hero-cta"><a class="btn btn-lima" href="index.html#lista">Hablar con Monni</a></div></div><pre class="code reveal" aria-label="Ejemplo de código">const payout = await monni.payouts.create({\n  amount: 1200,\n  currency: "USD",\n  idempotency_key: "ord_8f3a"\n});\n\n// webhook\npayout.completed</pre></div></section>`,
    faq([['¿Tienen API?','Sí. El ejemplo es ilustrativo; la documentación se compartirá con el acceso.'],['¿Cuándo estará disponible?',SOON]]),
    next([['empresas.html','Empresas','Para empresas','Cuentas globales y tesorería.'],['tarjeta.html','Tarjeta','Tarjeta Monni','Paga aquí y allá.'],['seguridad.html','Seguridad','Seguridad inteligente','Controla tus movimientos.']])
  ]},
{ file:'seguridad.html', nav:'', title:'Seguridad', eyebrow:'Seguridad', h1:'Seguridad inteligente.', sub:'Controla tus tarjetas, límites y movimientos desde la app.', desc:'Seguridad Monni.',
  tabs:[['#control','Control']],
  body:[
    showcase({ id:'control', theme:'light', pill:'Seguridad', h2:'Tú tienes el control', p:'Gestiona tu tarjeta, tus límites y revisa tus movimientos cuando quieras.', ctas:G.cta1, slides:[
      { cap:'Bloquea tu tarjeta', html:ui([[cur('@tarjeta-mas','Tarjeta'),'Bloquear'],[cur('@barras','Límites'),'Define'],[cur('@campana','Avisos'),'Activos']],'Seguridad','Protegida','Gestionar') },
      { cap:'Avisos al instante', html:lima(i3('campana','xl'),'Recibe notificaciones de tus movimientos') },
      { cap:'Tus movimientos', html:ui([[cur('US','Pago recibido'),'+$640'],[cur('CO','Compra'),'−$38.000']],'Actividad','Hoy','Ver todo') } ]}),
    feats('off','Capas de protección','',[['lock','Bloqueo','Bloquea y desbloquea tu tarjeta.'],['chart','Límites','Define cuánto quieres gastar.'],['bell','Avisos','Notificaciones de actividad.'],['users','Equipo','Controles para empresas.']]),
    faq([['¿Monni presta servicios financieros?','No. Monni S.A.S. no presta ni ofrece servicios financieros.'],['¿Qué controles tengo?','Tarjeta, límites y movimientos desde la app.']]),
    next([['tarjeta.html','Tarjeta','Tarjeta Monni','Paga con control.'],['cuenta.html','Cuenta','Cuenta multimoneda','Tu saldo claro.'],['ayuda.html','Ayuda','Preguntas frecuentes','Resuelve tus dudas.']])
  ]},
{ file:'ayuda.html', nav:'ayuda.html', title:'Ayuda y recursos', eyebrow:'Recursos', h1:'Ayuda y preguntas frecuentes.', sub:'Respuestas rápidas sobre Monni.', desc:'Ayuda de Monni.',
  tabs:[['#faq','Preguntas']],
  body:[
    `<section class="light" id="faq"><div class="wrap"><h2>¿En qué podemos ayudarte?</h2><div class="faq">${[
      ['¿Qué es Monni?','Monni te permite recibir, pagar y administrar tu dinero en varias monedas desde una cuenta.'],
      ['¿Qué monedas maneja?','Pesos colombianos (COP), dólares (USD) y euros (EUR).'],
      ['¿Qué son USDC y EURC?','Stablecoins: activos virtuales referenciados a una moneda fiat. No son dinero fiat.'],
      ['¿Cómo me uno?',SOON],
      ['¿Monni presta servicios financieros?','No. MONNI S.A.S. no presta ni ofrece servicios financieros.'],
      ['¿Cómo contacto a Monni?','Los canales de contacto se publicarán pronto (pendiente).']
    ].map(i=>`<details><summary>${i[0]}<i>+</i></summary><p>${i[1]}</p></details>`).join('')}</div></div></section>`,
    next([['cuenta.html','Cuenta','Cuenta multimoneda','Tu saldo en un solo lugar.'],['tarjeta.html','Tarjeta','Tarjeta Monni','Paga aquí y allá.'],['seguridad.html','Seguridad','Seguridad inteligente','Controla tus movimientos.']])
  ]}
];

// ---------- plantilla ----------
const navLinks = (cls, c) => NAV.map(n=>`<a href="${n[0]}"${n[0]===c?' class="cur"':''}>${n[1]}</a>`).join('');
// Footer compartido con la home: una sola fuente en partials/footer.html (se omite el comentario de cabecera)
const footer = fs.readFileSync(path.join(root, 'partials', 'footer.html'), 'utf8').replace(/^<!--[\s\S]*?-->\n/, '').trim();

pages.forEach(p => {
  const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${p.title} — Monni</title><meta name="description" content="${p.desc}">
<link rel="stylesheet" href="assets/css/home.css"><link rel="stylesheet" href="assets/css/pages.css"><link rel="stylesheet" href="assets/css/footer.css">
</head><body>
<header id="hdr"><div class="wrap nav"><a class="logo" href="index.html" aria-label="Monni"><img src="assets/logo/logo-white-transparent.png" alt="Monni"></a>
<nav class="nav-links" aria-label="Principal">${navLinks('', p.nav)}</nav>
<div class="nav-r"><a class="login" href="#">Iniciar sesión</a><a class="btn btn-lima sm" href="index.html#lista">Unirme a la lista</a><button class="burger" id="burger" aria-label="Abrir menú"><span></span><span></span><span></span></button></div></div></header>
<div class="drawer" id="drawer">${navLinks('', p.nav)}<a href="index.html#lista" class="btn btn-lima">Unirme a la lista</a></div>
<main id="main">
<section class="pg-hero dark"><div class="wrap"><h1>${p.h1}</h1><p class="sub">${p.sub}</p><div class="hero-cta"><a class="btn btn-lima" href="index.html#lista">Unirme a la lista</a><a class="btn btn-ghost" href="${p.tabs[0][0]}">Descubrir</a></div><div class="pg-tabs">${p.tabs.map(t=>`<a href="${t[0]}">${t[1]}</a>`).join('')}</div></div></section>
${p.body.join('\n')}
<section class="dark cta-band"><div class="wrap"><h2>Tu dinero, sin fronteras.</h2><p class="sub" style="margin:20px auto 0">${SOON}</p><div class="hero-cta" style="margin-top:30px"><a class="btn btn-lima" href="index.html#lista">Unirme a la lista</a></div></div></section>
</main>
${footer}
<script src="assets/js/pages.js"></script></body></html>`;
  fs.writeFileSync(path.join(root, p.file), html);
  console.log('ok', p.file);
});

// La home (index.html) se escribe a mano: solo se sincroniza su footer entre los marcadores
const homeFile = path.join(root, 'index.html');
const home = fs.readFileSync(homeFile, 'utf8').replace(/<!-- footer:start -->[\s\S]*?<!-- footer:end -->/, `<!-- footer:start -->\n${footer}\n<!-- footer:end -->`);
fs.writeFileSync(homeFile, home);
console.log('ok index.html (footer)');
