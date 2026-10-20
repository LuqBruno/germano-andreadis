(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  // altura real do cabeçalho fixo (âncoras e medidor)
  const top = document.querySelector('.top');
  const hh = () => root.style.setProperty('--hh', top.offsetHeight + 'px');
  hh(); addEventListener('resize', hh); if (document.fonts) document.fonts.ready.then(hh);

  // revelação por seção
  const rv = [...document.querySelectorAll('.rv')];
  if (reduce || !('IntersectionObserver' in window)) {
    rv.forEach(e => e.classList.add('in'));
  } else {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rv.forEach(e => io.observe(e));
  }

  // o dia passa na janela: céu e mar acompanham a rolagem (manhã -> meio-dia -> entardecer)
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
  const K = [
    { a: '#9CC3D5', b: '#F6D8B8', sa: '#5F96A8', sb: '#2F6A80', sun: '#FFE7B0', y: 70 },
    { a: '#3E8BC0', b: '#BCE0F0', sa: '#3A8AA8', sb: '#17607F', sun: '#FFFFFF', y: -70 },
    { a: '#2A2E5A', b: '#F0925F', sa: '#6B5A7E', sb: '#1D2A4A', sun: '#FFB45E', y: 120 },
  ].map(k => ({ ...k, a: hex(k.a), b: hex(k.b), sa: hex(k.sa), sb: hex(k.sb), sun: hex(k.sun) }));
  const paint = p => {
    const seg = p < .5 ? 0 : 1, t = p < .5 ? p / .5 : (p - .5) / .5;
    const A = K[seg], B = K[seg + 1];
    root.style.setProperty('--sky-a', mix(A.a, B.a, t));
    root.style.setProperty('--sky-b', mix(A.b, B.b, t));
    root.style.setProperty('--sea-a', mix(A.sa, B.sa, t));
    root.style.setProperty('--sea-b', mix(A.sb, B.sb, t));
    root.style.setProperty('--sun-c', mix(A.sun, B.sun, t));
    root.style.setProperty('--sun-y', (A.y + (B.y - A.y) * t).toFixed(0) + 'px');
    root.style.setProperty('--lamp', Math.max(0, (p - .7) / .3).toFixed(2));
  };
  if (!reduce) {
    let raf = 0;
    const upd = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      paint(max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0);
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    upd();
  }

  // maré: a água sobe a cada ponto conferido
  const boxes = [...document.querySelectorAll('#checks input')];
  const level = document.getElementById('level');
  const gn = document.getElementById('gn');
  const gmsg = document.getElementById('gmsg');
  const msgs = ['Comece pelo primeiro ponto.', 'Bom começo. Siga em frente.', 'Dois pontos conferidos.', 'Metade do caminho.', 'Falta pouco.', 'Quase lá: só mais um.', 'Tudo conferido. Hora de conversar com o Germano.'];
  const tide = () => {
    const n = boxes.filter(b => b.checked).length;
    level.style.transform = `translateY(${388 - (388 * n / boxes.length)}px)`;
    gn.textContent = n;
    gmsg.textContent = msgs[n];
  };
  boxes.forEach(b => b.addEventListener('change', tide));
  tide();

  // CTA fixo no celular depois da primeira dobra
  const float = document.querySelector('[data-float]');
  const hero = document.querySelector('.hero');
  const contact = document.querySelector('#contato');
  if (float && 'IntersectionObserver' in window) {
    let past = false, atC = false;
    const upd = () => float.classList.toggle('show', past && !atC);
    new IntersectionObserver(([e]) => { past = !e.isIntersecting; upd(); }).observe(hero);
    new IntersectionObserver(([e]) => { atC = e.isIntersecting; upd(); }, { threshold: .2 }).observe(contact);
  }
})();
