'use strict';

/**
 * Validación estática del sitio Movial (HTML/CSS/JS puro).
 * Ejecutar con Node:  node tests/validate.js
 * No requiere dependencias. Devuelve exit code 1 si algo falla.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

let failures = 0;
let passes = 0;

function check(name, condition, detail = '') {
  const ok = Boolean(condition);
  if (ok) passes++;
  else failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${name}${detail ? ' :: ' + detail : ''}`);
}

function read(rel) {
  try {
    return fs.readFileSync(path.join(ROOT, rel), 'utf8');
  } catch (e) {
    return null;
  }
}

function fileExists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

// ---------------------------------------------------------------------------
// 1. Archivos esenciales existen
// ---------------------------------------------------------------------------
check('existe public/index.html', fileExists('public/index.html'));
check('existe public/js/sitio.js', fileExists('public/js/sitio.js'));
check('existe public/js/catalogo.js', fileExists('public/js/catalogo.js'));
check('existe public/css/estilos.css', fileExists('public/css/estilos.css'));
check('existe wrangler.json', fileExists('wrangler.json'));

const indexHtml = read('public/index.html');
const catalogoJs = read('public/js/catalogo.js');
const sitioJs = read('public/js/sitio.js');

// ---------------------------------------------------------------------------
// 2. IDs que el JS referencia deben existir en el HTML
// ---------------------------------------------------------------------------
const idsEsperados = [
  'abrirMenu', 'menu', 'catGrid', 'catBuscar', 'catCarritoBtn',
  'cotCab', 'cotCuerpo', 'cotSecVaciar', 'cotSecEnviar', 'lightbox',
  'lbImg', 'lbBadge', 'lbTxt', 'irCatalogo', 'catAbrir', 'catCuerpo',
  'catMas', 'catVacio', 'catTotal', 'catRuta', 'catTabTodos'
];
for (const id of idsEsperados) {
  check(`index.html tiene id="${id}"`, indexHtml && indexHtml.includes(`id="${id}"`));
}

// ---------------------------------------------------------------------------
// 3. Clases que el JS/CSS seleccionan (sin el punto)
// ---------------------------------------------------------------------------
const clasesEsperadas = [
  'servicio-bloque', 'trabajo-item', 'trabajo-img', 'trabajo-ver',
  'menu-toggle', 'hamburguesa', 'seccion', 'rejilla'
];
for (const cls of clasesEsperadas) {
  check(`index.html tiene clase "${cls}"`, indexHtml && indexHtml.includes(`class="${cls}`));
}

// ---------------------------------------------------------------------------
// 4. WhatsApp: teléfono correcto en enlaces wa.me
// ---------------------------------------------------------------------------
check('index.html enlaza WhatsApp +573138595695',
  indexHtml && indexHtml.includes('wa.me/573138595695'));

// ---------------------------------------------------------------------------
// 5. Sub-páginas de servicios existen
// ---------------------------------------------------------------------------
const servicios = [
  'servicios/demarcacion-vial/index.html',
  'servicios/estudios-transito-barranquilla/index.html',
  'servicios/planes-manejo-transito/index.html',
  'servicios/senalizacion-vial/index.html'
];
for (const s of servicios) {
  check(`existe public/${s}`, fileExists('public/' + s));
}

// ---------------------------------------------------------------------------
// 6. catalogo.js: validar cada familia con sus campos esperados
//    Estructura real:
//      CATALOGO       (60 reglamentarias)   id, img, nombre, categoria, subtipo
//      CATALOGO_PREV  (87 preventivas)      id, imagePath, nombre
//      CATALOGO_INFO  (59 informativas)     id, imagePath, nombre
//      CATALOGO_DISP  (22 dispositivos)     id, imagePath, nombre
//      CATALOGO_DEM   (4 demarcación)       id, nombre           (sin imagen)
// ---------------------------------------------------------------------------
const esperados = {
  CATALOGO: { count: 60, imgField: 'img', campos: ['id', 'img', 'nombre'] },
  CATALOGO_PREV: { count: 87, imgField: 'imagePath', campos: ['id', 'imagePath', 'nombre'] },
  CATALOGO_INFO: { count: 59, imgField: 'imagePath', campos: ['id', 'imagePath', 'nombre'] },
  CATALOGO_DISP: { count: 22, imgField: 'imagePath', campos: ['id', 'imagePath', 'nombre'] },
  CATALOGO_DEM: { count: 4, imgField: null, campos: ['id', 'nombre'] }
};

let totalItems = 0;
let imagenesFaltantes = 0;

if (!catalogoJs) {
  check('catalogo.js legible', false, 'no se pudo leer');
} else {
  check('catalogo.js declara las 5 familias', Object.keys(esperados).every(k => catalogoJs.includes(`var ${k} = [`)));

  for (const [nombre, cfg] of Object.entries(esperados)) {
    // Extraer el texto del array, acotado entre su apertura y su cierre '];'
    const inicio = catalogoJs.indexOf(`var ${nombre} = [`);
    if (inicio === -1) {
      check(`${nombre} declarado`, false);
      continue;
    }
    const fin = catalogoJs.indexOf('];', inicio);
    if (fin === -1) {
      check(`${nombre} declarado`, false, `no se encontró cierre ']';`);
      continue;
    }
    check(`${nombre} declarado`, true);

    const textoFamilia = catalogoJs.slice(inicio, fin + 2);

    // Contar ítems por ocurrencia de {id:'...'
    const idMatches = textoFamilia.match(/{id:'([^']+)'/g) || [];
    const items = idMatches.length;
    totalItems += items;
    check(`${nombre}: ${items} ítems (esperados ${cfg.count})`, items === cfg.count);

    // Verificar campos requeridos en cada ítem
    for (const campo of cfg.campos) {
      const regex = new RegExp(`${campo}:'([^']*)'`, 'g');
      const valores = textoFamilia.match(regex) || [];
      check(`${nombre}: todos los ítems tienen ${campo}`, valores.length === items);
    }

    // IDs únicos dentro de la familia
    const ids = idMatches.map(m => m.match(/'([^']+)'$/)[1]);
    const unicos = new Set(ids);
    check(`${nombre}: IDs únicos`, ids.length === unicos.size, `${ids.length} ids, ${unicos.size} únicos`);

    // Imágenes en disco (solo familias que tienen campo de imagen)
    if (cfg.imgField) {
      const imgRegex = new RegExp(`${cfg.imgField}:'([^']+\\.webp)'`, 'g');
      let m;
      while ((m = imgRegex.exec(textoFamilia)) !== null) {
        const rutaEncoded = m[1];
        const ruta = decodeURIComponent(rutaEncoded); // %28 → (, %29 → )
        if (!fs.existsSync(path.join(PUBLIC, ruta))) {
          imagenesFaltantes++;
          check(`imagen existe: ${ruta}`, false, `${nombre}`);
        }
      }
    }
  }

  check(`total ítems catálogo: ${totalItems} (esperados 232)`, totalItems === 232);
  check(`todas las imágenes del catálogo existen en disco`, imagenesFaltantes === 0, `${imagenesFaltantes} faltantes`);
}

// ---------------------------------------------------------------------------
// 7. Imágenes lazy de index.html existen en disco
// ---------------------------------------------------------------------------
if (indexHtml) {
  const rutasLazy = indexHtml.match(/src="([^"]+\.webp)"[^>]*loading="lazy"/g) || [];
  let faltantesLazy = 0;
  for (const m of rutasLazy) {
    const ruta = m.match(/src="([^"]+\.webp)"/)[1];
    if (!fs.existsSync(path.join(PUBLIC, ruta))) {
      faltantesLazy++;
      check(`imagen lazy existe: ${ruta}`, false);
    }
  }
  check(`todas las ${rutasLazy.length} imágenes lazy existen en disco`, faltantesLazy === 0);
}

// ---------------------------------------------------------------------------
// 8. sitio.js: todas las IDs que lee por getElementById existen en el HTML
// ---------------------------------------------------------------------------
if (sitioJs && indexHtml) {
  const brutos = sitioJs.match(/getElementById\('([^']+)'\)/g) || [];
  const idsSitio = brutos
    .map(m => {
      const g = m.match(/'([^']+)'/);
      return g ? g[1] : null;
    })
    .filter(Boolean);
  let faltantes = 0;
  for (const id of idsSitio) {
    if (!indexHtml.includes(`id="${id}"`)) {
      faltantes++;
      check(`sitio.js referencia id="${id}" existente en HTML`, false);
    }
  }
  check(`sitio.js: ${idsSitio.length - faltantes}/${idsSitio.length} IDs resueltos en HTML`, faltantes === 0);
}

// ---------------------------------------------------------------------------
// Resumen
// ---------------------------------------------------------------------------
console.log(`\n${passes} pasó, ${failures} falló`);
process.exit(failures > 0 ? 1 : 0);
