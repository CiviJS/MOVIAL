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
