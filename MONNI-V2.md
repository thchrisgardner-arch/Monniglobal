# Monni Global V2 — Home escritorio

Rediseño de `index.html`. Las copias de respaldo anteriores se eliminaron el 22 oct 2026 para dejar una sola versión del proyecto.
Archivos nuevos: `assets/css/v2.css`, `assets/js/v2-ui.js`, `assets/js/v2-motion.js`, `assets/img/cards/`.
Las subpáginas (`cuenta.html`, `tarjeta.html`, etc.) siguen usando `home.css`, salvo el footer, que es común a todo el sitio.

**Footer compartido:** el marcado está en `partials/footer.html` y los estilos, autocontenidos, en `assets/css/footer.css`. Para cambiarlo se edita el partial y se ejecuta `node tools/build-pages.js`, que regenera las 9 páginas internas y sincroniza el footer de `index.html` entre los marcadores `<!-- footer:start -->` y `<!-- footer:end -->`.

Ubicación del proyecto (desde 22 oct 2026): `Desktop/Proyecto/Proyecto Monni/Monni Global Website 2026`.

Vista previa: `node tools/serve.js 8794` → http://127.0.0.1:8794

---

## 1. Auditoría (22 oct 2026)

**Técnica.** Sitio estático HTML/CSS/JS, sin framework ni build. GSAP 3.12.5 + ScrollTrigger desde cdnjs (se reutilizan; no se añadieron dependencias). Tokens oficiales en `assets/css/{colors,typography,spacing,radii,elevation,fonts}.css`. Tipografía del sistema: **Outfit 900 + Geist 400/600** (no Inter: el sistema Monni ya la define y se respetó).

**Contenido verificado en monni.global** (home, /billetera, /tarjeta, /tarjeta-credito, /ayuda):
- Monni está **en etapa previa al lanzamiento**. La acción principal real es la lista de espera (`https://www.monni.global/#lista-espera`).
- Planes: Start (gratis) · Plus ($19.900/mes, primer mes gratis) · Premium ($39.900/mes) · Platinum ($79.900/mes), en COP.
- Tarjeta débito: se descuenta del saldo, COP/USD/EUR, sin comisión de Monni por divisas, sin consulta de crédito, virtual incluida y física en planes de pago.
- Tarjeta de crédito: disponible desde julio de 2027; "Paga en 4" desde $120.000.
- Soporte: chat con Personal Banker en la app y +57 301 979 2712 (L–V, 8:00–18:00).
- Aviso legal de MONNI S.A.S. y conversión automática de pagos entrantes a USDc/EURc: copiados literalmente en el footer.

**Discrepancias encontradas (no se publicaron afirmaciones dudosas):**
1. La home oficial dice "acceso a salas VIP … con Monni Premium y Platinum"; la página de planes solo da **acceso ilimitado en Platinum** (Premium aparece como "entrada con descuento" en la tabla). En V2 solo se menciona Platinum.
2. ~~Redes distintas entre débito y crédito~~ **Resuelto (22 oct 2026):** los renders oficiales nuevos (`assets/img/cards/Debito/` y `Credito/`) usan VISA en ambas tarjetas.
3. En /tarjeta-credito, el mínimo de $120.000 está marcado con la nota ² pero el texto remite a la nota ¹.
4. La home oficial tiene un botón "Descarga la App" que lleva a la lista de espera, mientras el footer enlaza a App Store y Google Play. Conviene confirmar si la app ya está publicada.
5. La FAQ oficial habla de "encriptación de nivel bancario", pero Monni no se presenta como banco. Se mantuvo la frase oficial; conviene que legal la valide.

## 2. Dirección de arte

- **Concepto:** *Tu dinero, sin fronteras.* Un solo recorrido que cambia de atmósfera: ink → gris → blanco → ink → blanco → gris → blanco → lima → ink.
- **Paleta:** ink, lima y morado (reservado para Empresas) más neutros. Por decisión del cliente (22 oct 2026), la home V2 usa el gris frío de referencia Banco Plata **#F7F8FB** (tono `gris`) en lugar del crema #EDF0DA. El token `--monni-crema` de `colors.css` no cambia. Sin degradados decorativos ni glassmorphism.
- **Grilla:** 12 columnas, gutter 24 px, contenedor de 1312 px, margen exterior fluido `clamp(48px, 5vw, 88px)`. Composiciones asimétricas (6/6, 5/7, 4/4/4 escalonado).
- **Tipografía:** H1 `clamp(56px, 6.1vw, 88px)`, H2 `clamp(36px, 3.75vw, 56px)`, lead 18 px y caption 13 px. El bloque de propuesta usa un display editorial de hasta 176 px.
- **Imagen:** renders oficiales de la tarjeta, fotografía lifestyle del proyecto con UI flotante encima (como pide el sistema) y la foto de producto de la tarjeta negra.
- **Iconografía:** set propio en SVG (`<symbol>` inline). Caja de 24, trazo de 1.75 y remates redondeados, sobre tiles de 56 px con radio 16 (lima/ink/línea).
- **Cards:** borde de 1 px y sin sombra. La destacada (Premium) invierte a ink.

## 3. Arquitectura

| # | Sección | Tono | Notas |
|---|---|---|---|
| 01 | Header | adaptativo | Toma el tono y el fondo de la sección que tiene debajo |
| 02 | Hero | ink | Tarjeta débito 3D + teléfono ilustrativo + chips COP/USD/EUR |
| 03 | Propuesta "Recibe. Cambia. Paga." | gris #F7F8FB | Primera transición cromática; palabras con máscara |
| 04 | Cuenta global | gris #F7F8FB | Teléfono `sticky` (CSS, sin pin) + 4 pasos; estado por IntersectionObserver |
| 05 | Transferencias | blanco | Ruta SVG que se dibuja con el scroll + 3 escenas lifestyle |
| 06–07 | Tarjeta débito + control | ink | Foto oficial de marca (`brand/lifestyle-tarjeta-lima.webp`, mujer con la tarjeta débito lima real) junto a una lista de 4 beneficios con ícono, al estilo de moneda.com/es/accounts; luego el bento de control |
| 08 | Planes | blanco | 4 planes verificados; la tabla completa queda en /billetera |
| 09 | Seguridad y atención | gris #F7F8FB | Capas de seguridad oficiales + Personal Banker / teléfono |
| 10 | FAQ | blanco | Acordeón accesible (button + region, `aria-expanded`) |
| 11 | CTA final | lima | CTA ink (única acción principal en la vista) |
| 12 | Footer | ink | Wordmark, apps, 4 columnas, redes, mercado y aviso legal completo |

## 4. Sistema de movimiento (`v2-motion.js`)

- **Color:** mientras una sección entra (`top 92%` → `top 38%`), ella y la anterior comparten el mismo fondo interpolado y cambian de tono de texto en el punto medio, así no hay borde visible ni pérdida de contraste. El progreso se calcula desde la geometría real en cada frame, por lo que resiste cambios de layout.
- **Entradas:** máscaras de línea en H1 y en la propuesta. Desplazamientos de 18–56 px con opacidad y escalonados cortos, distintos por sección.
- **Parallax:** solo en las capas del hero (`data-depth`), las fotos de transferencias (±4 %) y la tarjeta y su foto en la sección de tarjeta.
- **Interfaces:** cambios de estado con significado (pantallas de la cuenta, interruptor "Congelar tarjeta"). Ninguna cifra se anima como si fuera un dato en vivo.
- Sin pin ni scroll hijacking. Con `prefers-reduced-motion` no se carga el movimiento y todo el contenido queda visible. Si GSAP no carga en 2,5 s, el contenido se muestra igual.
- Microinteracciones de 120–180 ms, según el sistema Monni.

> Nota: el sistema de diseño Monni dice "nunca parallax". El brief pedía parallax moderado, así que se limitó a tres composiciones de producto y no afecta texto. Si la marca lo prefiere, se desactiva borrando los bloques marcados en `v2-motion.js`.

## 5. Recursos visuales

**Renders oficiales de tarjetas:** los originales PNG están en `assets/img/cards/Debito/` y `Credito/`, con una copia idéntica en `assets/img/Tarjeta/`. La web usa versiones WebP de 1200 px con nombres sin espacios, en `assets/img/cards/web/`: `debito-verde`, `debito-negra-signature`, `debito-gris-platinum`, `debito-blanca-platinum`, `credito-signature-negra` y `credito-infinite-plateada`. La home usa `debito-verde` (hero, bloque Congélala, cierre) y `credito-signature-negra` (cierre). `scenes/credito-lima.webp` se recompuso con el render Signature.

**Otros recursos usados:** `img/xf-conversion.webp`, `img/tr-bogota.webp`, `logo/logo-white-transparent.png` (invertido a ink en fondos claros) e iconos de Instagram y Facebook.

**Badges oficiales de tiendas** (`assets/badges/`, 22 oct 2026):
- `app-store-es.svg`: badge oficial de Apple "Descárgalo en el App Store" en negro, archivo `Download_on_the_App_Store_Badge_ES_RGB_blk_100217` del kit de Apple, obtenido vía Wikimedia Commons porque el dominio tools.applemarketingtools.com no estaba accesible.
- `google-play-es.png`: badge oficial es-419 de play.google.com/intl/en_us/badges.

Ambos se usan sin modificar, a 48 px de alto. Antes de publicar, conviene confirmar con las guías de cada marca el tamaño mínimo y el espacio libre alrededor.

**Escenas generadas en Higgsfield (22 oct 2026)** con GPT Image 2.5, calidad alta y 2K. Se hicieron 2 variantes por escena (8 imágenes, unos 22 créditos). Todas se generaron sin tarjetas, logos ni texto, y las tarjetas oficiales se componen encima en código:

| ID | Archivo (`assets/img/scenes/`) | Sección | Composición | Job elegido |
|---|---|---|---|---|
| H1 | `hero-stage-ink.webp` (1400², 17 KB) | Hero | Charco de luz lima sobre negro. Va en `mix-blend-mode:screen` (el negro desaparece) con máscara radial, y la tarjeta débito oficial flota encima | 81e3dbae |
| H2 | `card-pedestal-ink.webp` (sin uso desde el rediseño de la sección débito) (1100×1656, 35 KB) | Tarjeta | Pedestal de piedra negra con reflejo lima. Reemplaza a `img-card-black.jpg` y la tarjeta débito flota sobre el pedestal | 50b22f00 |
| H3 | `recibe-medellin.webp` (1100×1473, 84 KB) | Transferencias · "Recibe" | Reemplaza a `tr-recibe.webp`, con la UI flotante del proyecto encima | 1c2bdcb7 |
| H4 | `final-pedestal-lima.webp` (1600×1195, 15 KB) | CTA final | Bloques y pedestal lima con bordes fundidos por máscara. Las tarjetas débito y crédito oficiales van sobre el pedestal, y la escena se apaga con `--out` al entrar al footer | 8c11c463 |

**Panel de la tarjeta de crédito** (`scenes/credito-lima.webp`, 1800×1018, 159 KB). Está inspirado en el hero de bancoplata.mx: foto a sangre monocromática, texto encima a la izquierda y un solo CTA. Se generaron 4 variantes (job elegido 31a6d4e2) de una mujer sosteniendo una tarjeta **negra en blanco** frente al ojo. Con sharp se compuso encima el render oficial `card-credito-ink.jpg`, recortado con la máscara exacta de la tarjeta en blanco, así los dedos quedan por delante. El panel usa el lima medido en la foto (#BAF723) y la foto va desplazada un 14 % a la derecha para liberar la columna de texto. La fecha "Disponible desde julio de 2027" y la nota legal de Paga en 4 vienen de /tarjeta-credito.

Variantes descartadas: H1a tenía un haz de luz duro en la esquina, H2a añadió una roca y una planta que no se pidieron, H3a mostraba bandas de posterización en el cielo y H4a tenía poca forma. Los originales PNG quedan en la cuenta de Higgsfield.

**Prompts usados** (resumen):
- H1 · *Minimal dark studio scene … infinite pure black cyclorama, edges fading to black, low wide pool of soft light with lime (#C2FB17) bounce tint, soft contact shadow … no card, no device, no text, no logos.*
- H2 · *Luxury product photography set, black on black, sculpted matte black stone pedestal … subtle lime reflected light … empty space above for a floating object … no card, no text.*
- H3 · *Candid lifestyle photograph, Colombian man in his late 20s working remotely from a bright apartment in Medellín, smiling at his smartphone, screen facing away … no brands, no text.*
- H4 · *Minimal abstract product set in solid lime (#C2FB17): rounded lime blocks and a low cylinder pedestal on the right, monochrome, soft top light … empty area above the pedestal … no card, no text.*

**Reglas:** el generador nunca debe dibujar tarjetas, logos, números de tarjeta ni pantallas con texto. Las tarjetas y la UI se componen siempre con los archivos oficiales o en código.

## 6. Pendientes

- Confirmar la red de pago de cada tarjeta (Mastercard débito / VISA crédito) y si la app ya está en las tiendas.
- Logo oficial en SVG con fondo transparente: hoy se usa un PNG de 1024² recortado con `object-fit`.
- Binarios oficiales de Outfit y Geist: hoy se cargan desde Google Fonts.
- Versión de las tarjetas con fondo transparente para `card-credito-ink.jpg` (hoy se recorta con `clip-path`).
- Adaptación a tablet y móvil (fuera del alcance de esta fase; la grilla y los componentes ya están preparados).
- Revisión legal de los textos de seguridad.
