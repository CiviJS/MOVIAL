/**
 * Suite de pruebas para ejecutar en el navegador.
 * Se carga desde tests/runner.html (que a su vez carga public/js/catalogo.js).
 * Valida la integridad de los datos del catálogo y la consistencia con el HTML.
 */

(function () {
  'use strict';

  var contenedor = document.getElementById('ts-resultados');
  var lista = document.getElementById('ts-lista');
  var contador = document.getElementById('ts-contador');

  var passes = 0;
  var failures = 0;

  function check(nombre, condicion, detalle) {
    var ok = Boolean(condicion);
    if (ok) passes++; else failures++;

    var li = document.createElement('li');
    li.className = ok ? 'ts-pasa' : 'ts-falla';
    li.setAttribute('data-estado', ok ? 'PASS' : 'FAIL');
    li.textContent = (ok ? 'PASS' : 'FAIL') + ' - ' + nombre;
    if (detalle) li.textContent += ' :: ' + detalle;
    lista.appendChild(li);

    contador.textContent = passes + ' pasó, ' + failures + ' falló';
    if (failures > 0) contador.className = 'ts-falla';
    else contador.className = 'ts-pasa';
  }

  function escaparHtml(texto) {
    return String(texto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // -------------------------------------------------------------------------
  // 1. CATALOGO existe y es un array con ítems
  // -------------------------------------------------------------------------
  var catalogoOk = window.CATALOGO && Array.isArray(window.CATALOGO) && window.CATALOGO.length > 0;
  check('CATALOGO existe y tiene ítems', catalogoOk, window.CATALOGO ? window.CATALOGO.length + ' ítems' : 'no definido');

  if (!catalogoOk) {
    contenedor.className = 'ts-panel ts-falla';
    return;
  }

  var idsVistos = {};
  var idsDuplicados = [];
  var itemsSinCampos = [];
  var imagenesVacias = [];

  var conteos = {};

  window.CATALOGO.forEach(function (item, i) {
    var falta = [];
    if (!item.id) falta.push('id');
    if (!item.img) falta.push('img');
    if (!item.nombre) falta.push('nombre');
    if (!item.categoria) falta.push('categoria');
    if (!item.subtipo) falta.push('subtipo');
    if (falta.length) itemsSinCampos.push('ítem #' + i + ' falta: ' + falta.join(', '));

    if (item.id) {
      if (idsVistos[item.id]) idsDuplicados.push(item.id);
      idsVistos[item.id] = true;
    }
    if (!item.img || !item.img.endsWith('.webp')) imagenesVacias.push((item.id || 'ítem #' + i) + ': ' + item.img);

    if (item.subtipo) {
      conteos[item.subtipo] = (conteos[item.subtipo] || 0) + 1;
    }
  });

  check('CATALOGO: ningún ítem sin campos requeridos', itemsSinCampos.length === 0, itemsSinCampos.join('; '));
  check('CATALOGO: IDs únicos', idsDuplicados.length === 0, idsDuplicados.join(', '));
  check('CATALOGO: todas las imágenes terminan en .webp', imagenesVacías.length === 0, imagenesVacías.join('; '));

  // -------------------------------------------------------------------------
  // 2. Conteos por categoría esperados (según píldoras de public/index.html)
  // -------------------------------------------------------------------------
  var esperados = {
    Reglamentarias: 60,
    Preventivas: 87,
    Informativas: 59,
    'Dispositivos Viales': 22,
    'Demarcación Vial': 4
  };
  var conteoOk = true;
  Object.keys(esperados).forEach(function (subtipo) {
    var real = conteos[subtipo] || 0;
    if (real !== esperados[subtipo]) conteoOk = false;
    check('Catálogo ' + subtipo + ': ' + real + ' ítems (esperados ' + esperados[subtipo] + ')', real === esperados[subtipo]);
  });
  var totalEsperado = Object.values(esperados).reduce(function (a, b) { return a + b; }, 0);
  check('Catálogo total: ' + window.CATALOGO.length + ' ítems (esperados ' + totalEsperado + ')', window.CATALOGO.length === totalEsperado);

  // -------------------------------------------------------------------------
  // 3. Estructura del HTML: IDs críticos presentes (si el runner se abre junto al sitio)
  // -------------------------------------------------------------------------
  var idsHtml = [
    'catGrid', 'catBuscar', 'catCarritoBtn', 'cotCab', 'cotCuerpo',
    'cotSecVaciar', 'cotSecEnviar', 'lightbox', 'lbImg', 'abrirMenu', 'menu'
  ];
  idsHtml.forEach(function (id) {
    check('HTML tiene id="' + id + '"', !!document.getElementById(id));
  });

  // -------------------------------------------------------------------------
  // 4. Imágenes lazy tienen loading="lazy"
  // -------------------------------------------------------------------------
  var lazyImgs = document.querySelectorAll('img[loading="lazy"]');
  check('Hay imágenes con loading="lazy"', lazyImgs.length > 0, lazyImgs.length + ' encontradas');

  // -------------------------------------------------------------------------
  // Resultado final
  // -------------------------------------------------------------------------
  contenedor.className = 'ts-panel ' + (failures === 0 ? 'ts-pasa' : 'ts-falla');
})();
