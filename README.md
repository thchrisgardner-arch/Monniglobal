# Monniglobal

Sitio web de Monni Global (versión de escritorio V2): HTML, CSS y JavaScript estáticos, sin framework ni paso de compilación.

## Ver el sitio en local

```bash
node tools/serve.js 8794
```

Abre http://127.0.0.1:8794.

## Estructura

| Ruta | Contenido |
|---|---|
| `index.html` | Home V2 |
| `*.html` | Páginas internas generadas por `tools/build-pages.js` |
| `partials/footer.html` | Footer compartido por todas las páginas |
| `assets/css/` | Tokens oficiales de Monni, `v2.css` (home), `footer.css` (compartido), `home.css` y `pages.css` (páginas internas) |
| `assets/js/` | `v2-ui.js` (interfaz) y `v2-motion.js` (animaciones con GSAP) |
| `assets/img/cards/` | Renders oficiales de las tarjetas (`web/` contiene las versiones optimizadas que usa el sitio) |
| `assets/img/scenes/` | Escenas generadas con las tarjetas oficiales compuestas encima |
| `MONNI-V2.md` | Auditoría, dirección de arte, decisiones y pendientes |

## Regenerar las páginas internas

Después de editar `tools/build-pages.js` o `partials/footer.html`:

```bash
node tools/build-pages.js
```

El script regenera las páginas internas y sincroniza el footer de la home.
