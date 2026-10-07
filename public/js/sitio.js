// Mobile menu
var boton = document.getElementById('abrirMenu');
var menu = document.getElementById('menu');
var flotante = document.querySelector('.flotante');

function setMenu(abierto){
  menu.classList.toggle('abierto', abierto);
  boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
  boton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  document.body.classList.toggle('menu-abierto', abierto);
}
boton.addEventListener('click', function(){
  setMenu(!menu.classList.contains('abierto'));
});
menu.querySelectorAll('a').forEach(function(a){
  a.addEventListener('click', function(){
    setMenu(false);
  });
});
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape' && menu.classList.contains('abierto')){
    setMenu(false);
    boton.focus();
  }
});

// Dynamic year
document.getElementById('anio').textContent = new Date().getFullYear();

// Hide floating WhatsApp while typing in the quote modal (keyboard clashes with fixed button)
var modalEnvioEl = document.getElementById('modalEnvio');
if(modalEnvioEl && flotante){
  modalEnvioEl.addEventListener('focusin', function(){ flotante.classList.add('oculto'); });
  modalEnvioEl.addEventListener('focusout', function(){
    setTimeout(function(){
      if(!modalEnvioEl.contains(document.activeElement)) flotante.classList.remove('oculto');
    }, 120);
  });
}

// Scroll animations for sections
// threshold is a RATIO, so a section taller than 10x the viewport could never reach it
// (the catalog is ~14,000px tall on mobile) and stayed permanently at opacity:0.
// threshold:0 + a negative bottom rootMargin reveals on entry regardless of height.
if(window.matchMedia('(prefers-reduced-motion: no-preference)').matches && 'IntersectionObserver' in window){
  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0, rootMargin: '0px 0px -12% 0px'});

  document.querySelectorAll('.seccion').forEach(function(seccion){
    observer.observe(seccion);
  });
} else {
  document.querySelectorAll('.seccion').forEach(function(seccion){
    seccion.classList.add('visible');
  });
}

// Scroll reveal de las tarjetas de #proyectos: fade-in + translateY
// escalonado (--i por tarjeta, 0..7) al entrar en el viewport. Solo se
// ocultan (html.reveal) si hay IntersectionObserver y el usuario no
// prefiere movimiento reducido; sin JS o con movimiento reducido quedan
// visibles.
var tarjetas = document.querySelectorAll('#proyectos .trabajo-item');
if(tarjetas.length){
  var reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reducirMovimiento && 'IntersectionObserver' in window){
    document.documentElement.classList.add('reveal');
    var revelador = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          revelador.unobserve(entry.target);
          setTimeout(function(){ entry.target.style.transitionDelay = '0s'; }, 1100);
        }
      });
    }, {threshold: 0.12});
    tarjetas.forEach(function(t, i){
      t.style.setProperty('--i', String(i));
      revelador.observe(t);
    });
  } else {
    tarjetas.forEach(function(t){ t.classList.add('visible'); });
  }
}

// Lightbox de #proyectos - amplía cualquier mitad de tarjeta (las 16
// fotos de campo, dos por tarjeta partida) en un modal flotante
(function(){
  var caja = document.getElementById('lightbox');
  if(!caja) return;
  var img = document.getElementById('lbImg');
  var badge = document.getElementById('lbBadge');
  var txt = document.getElementById('lbTxt');
  var fichas = Array.prototype.slice.call(document.querySelectorAll('#proyectos .trabajo-img'));
  if(!fichas.length) return;
  var indice = -1;
  var origen = null;

  function pintar(i){
    var im = fichas[i];
    var item = im.closest('.trabajo-item');
    indice = i;
    img.setAttribute('src', im.getAttribute('src'));
    img.setAttribute('alt', im.getAttribute('alt') || '');
    badge.textContent = item.querySelector('.trabajo-cat') ? item.querySelector('.trabajo-cat').textContent : '';
    txt.textContent = item.getAttribute('data-pie') || '';
  }

  function abrir(i, disparador){
    origen = disparador || null;
    pintar(i);
    caja.classList.add('abierto');
    caja.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    caja.querySelector('.lb-cerrar').focus();
  }

  function cerrar(){
    if(!caja.classList.contains('abierto')) return;
    caja.classList.remove('abierto');
    caja.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if(origen && typeof origen.focus === 'function') origen.focus();
    origen = null;
  }

  function mover(paso){
    if(!caja.classList.contains('abierto')) return;
    pintar((indice + paso + fichas.length) % fichas.length);
  }

  fichas.forEach(function(im, i){
    im.addEventListener('click', function(){
      abrir(i, im.closest('.trabajo-item').querySelector('.trabajo-ver'));
    });
  });
  document.querySelectorAll('#proyectos .trabajo-ver').forEach(function(btn){
    btn.addEventListener('click', function(){
      var item = btn.closest('.trabajo-item');
      var im = item.querySelector('.trabajo-img');
      abrir(fichas.indexOf(im), btn);
    });
  });

  caja.addEventListener('click', function(e){
    if(e.target.closest('[data-lb-cerrar]')) cerrar();
    else if(e.target.closest('[data-lb-prev]')) mover(-1);
    else if(e.target.closest('[data-lb-next]')) mover(1);
  });

  document.addEventListener('keydown', function(e){
    if(!caja.classList.contains('abierto')) return;
    if(e.key === 'Escape'){ e.preventDefault(); cerrar(); }
    else if(e.key === 'ArrowLeft'){ mover(-1); }
    else if(e.key === 'ArrowRight'){ mover(1); }
    else if(e.key === 'Tab'){
      var foco = caja.querySelectorAll('button');
      if(!foco.length) return;
      var primero = foco[0];
      var ultimo = foco[foco.length - 1];
      if(e.shiftKey && document.activeElement === primero){ e.preventDefault(); ultimo.focus(); }
      else if(!e.shiftKey && document.activeElement === ultimo){ e.preventDefault(); primero.focus(); }
    }
  });
})();
