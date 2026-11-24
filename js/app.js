/* =====================================================================
   PROGRAMA DE LA PÁGINA - no hace falta tocar nada acá.
   Todo lo que se edita está en la carpeta "datos".
   ===================================================================== */
const $ = s => document.querySelector(s);
const E = s => String(s ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const fd = d => d ? new Date(d + 'T12:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }) : '';
const T = id => EQUIPOS.find(e => e.id == id) || { id, nombre: id || '?' };
const ME = CONFIG.miEquipo;
const ICON = { gol: '⚽', amarilla: '🟨', roja: '🟥', falta: '🚫 falta' };

const LOGO_SVG = `<svg viewBox="0 0 100 110"><defs><path id="u" d="M8 6h32v60q0 12 10 12t10-12V6h32v62q0 38-42 38T8 68z"/></defs><use href="#u" fill="#000" stroke="#000" stroke-width="9"/><use href="#u" fill="#0066f2" stroke="#fff" stroke-width="4"/><circle cx="50" cy="66" r="22" fill="#fff" stroke="#111" stroke-width="2"/><text x="50" y="74" text-anchor="middle" font-size="26" font-style="italic" font-weight="900" font-family="Brush Script MT,cursive" fill="#0066f2" stroke="#000" stroke-width="3" paint-order="stroke" transform="rotate(-8 50 70)">Somos</text></svg>`;

const crest = (id, cls = '') => {
  const t = T(id);
  return t.escudo ? `<img class="crest ${cls}" src="${E(t.escudo)}" alt="">`
                  : `<span class="crest ini ${cls}">${E(t.nombre.charAt(0))}</span>`;
};
const money = n => '$' + Number(n || 0).toLocaleString('es-AR');

/* ---------- cálculos automáticos ---------- */
let CATS = CATEGORIAS.map(c => String(c.id));
const ST = { cat: '', rueda: '', fecha: '' };   // filtros activos
const ok = (m, f = {}) => (!f.cat || m.categoria == f.cat) && (!f.rueda || m.rueda == f.rueda) && (!f.fecha || m.fecha == f.fecha);
const soy = m => m.local == ME || m.visitante == ME;

function tabla(cat, rueda) {
  const r = {}, ms = PARTIDOS.filter(m => m.categoria == cat);
  ms.forEach(m => [m.local, m.visitante].forEach(id => r[id] = r[id] || { id, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 }));
  ms.filter(m => m.jugado && (!rueda || m.rueda == rueda)).forEach(m => {
    const a = r[m.local], b = r[m.visitante];
    a.pj++; b.pj++; a.gf += m.gl; a.gc += m.gv; b.gf += m.gv; b.gc += m.gl;
    if (m.gl > m.gv) { a.g++; b.p++; } else if (m.gl < m.gv) { b.g++; a.p++; } else { a.e++; b.e++; }
  });
  return Object.values(r).map(x => ({ ...x, dg: x.gf - x.gc, pts: x.g * 3 + x.e }))
    .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || T(a.id).nombre.localeCompare(T(b.id).nombre));
}
function stats(cat, rueda) {
  const g = {}, c = {};
  PARTIDOS.filter(m => m.jugado && m.categoria == cat && (!rueda || m.rueda == rueda)).forEach(m => (m.eventos || []).forEach(e => {
    const k = e.jugador + '|' + (e.equipo || '');
    if (e.tipo == 'gol') { g[k] = g[k] || { j: e.jugador, eq: e.equipo, n: 0 }; g[k].n++; }
    if (e.tipo == 'amarilla' || e.tipo == 'roja') { c[k] = c[k] || { j: e.jugador, eq: e.equipo, a: 0, r: 0 }; e.tipo == 'roja' ? c[k].r++ : c[k].a++; }
  }));
  return { g: Object.values(g).sort((a, b) => b.n - a.n), c: Object.values(c).sort((a, b) => b.r - a.r || b.a - a.a) };
}

/* ---------- piezas de pantalla ---------- */
function partido(m) {
  const mio = soy(m);
  let chip = '';
  if (m.jugado && mio) {
    const a = m.local == ME ? m.gl : m.gv, b = m.local == ME ? m.gv : m.gl, o = a > b ? 'G' : a < b ? 'P' : 'E';
    chip = `<i class="chip c${o}">${o}</i>`;
  }
  const ev = [...(m.eventos || [])].sort((a, b) => a.min - b.min).map(e =>
    `<li>${e.min}' ${ICON[e.tipo] || ''} <b>${E(e.jugador)}</b> <span class=m>${e.equipo ? E(T(e.equipo).nombre) : ''}</span></li>`).join('');
  const eq = id => `<a class=tt href="#equipo/${E(id)}">${crest(id)}<span>${E(T(id).nombre)}</span></a>`;
  return `<div class="match ${mio ? 'mio' : ''}"><div class=mh><span>Cat. ${E(m.categoria)} · ${fd(m.dia)} · ${E(m.hora || '')} hs</span>${chip}</div>
    <div class=mr>${eq(m.local)}<div class=sc>${m.jugado ? m.gl + ' - ' + m.gv : 'vs'}</div>${eq(m.visitante)}</div>
    <div class=ml>📍 ${E(m.lugar || 'A confirmar')}</div>
    ${ev ? `<details><summary>Ver detalle</summary><ul>${ev}</ul></details>` : ''}</div>`;
}
function tablaHTML(rows) {
  if (!rows.length) return '<p class=m>Todavía no hay partidos cargados en esta categoría.</p>';
  return `<div class="card wrap"><table><tr><th>#<th>Equipo<th>PJ<th>G<th>E<th>P<th>DG<th>Pts</tr>${rows.map((x, i) =>
    `<tr class="${x.id == ME ? 'me' : ''}"><td>${i + 1}<td><a class=eq href="#equipo/${E(x.id)}">${crest(x.id, 's')} ${E(T(x.id).nombre)}</a><td>${x.pj}<td>${x.g}<td>${x.e}<td>${x.p}<td>${x.dg}<td><b>${x.pts}</b></tr>`).join('')}</table></div>`;
}
function statsHTML(s) {
  const who = x => `${x.eq ? crest(x.eq, 's') : ''} ${E(x.j)}`;
  return `<div class=grid2><div class=card><b>⚽ Goleadores</b>${s.g.slice(0, 20).map(x => `<div class=dato><span class=eq>${who(x)}</span><b>${x.n}</b></div>`).join('') || '<p class=m>Todavía no hay goles cargados.</p>'}</div>
  <div class=card><b>🟨🟥 Tarjetas</b>${s.c.slice(0, 20).map(x => `<div class=dato><span class=eq>${who(x)}</span><span>🟨${x.a} 🟥${x.r}</span></div>`).join('') || '<p class=m>Sin tarjetas.</p>'}</div></div>`;
}
function noticia(n) {
  return `<div class="card noti">${n.foto ? `<img src="${E(n.foto)}" alt="">` : ''}<h3>${E(n.titulo)}</h3><p class=m>${fd(n.fecha)}</p><p>${E(n.texto).replace(/\n/g, '<br>')}</p></div>`;
}
function progreso() {
  const p = Math.min(100, Math.round(HOGAR.juntado / Math.max(1, HOGAR.meta) * 100));
  return `<div class=bar><i style="width:${p}%"></i></div><p class=m>${money(HOGAR.juntado)} de ${money(HOGAR.meta)} (${p}%)</p>`;
}
function contacto() {
  const c = CONFIG, b = [];
  if (c.whatsapp) b.push(`<a class=btn href="https://wa.me/${E(c.whatsapp)}" target=_blank rel=noopener>💬 WhatsApp</a>`);
  if (c.instagram) b.push(`<a class=btn href="https://instagram.com/${E(c.instagram)}" target=_blank rel=noopener>📸 Instagram</a>`);
  if (/^https:\/\//.test(c.facebook)) b.push(`<a class=btn href="${E(c.facebook)}" target=_blank rel=noopener>👍 Facebook</a>`);
  if (c.email) b.push(`<a class=btn href="mailto:${E(c.email)}">✉️ Email</a>`);
  return `<div class=card><b>Contacto</b><p>${c.direccion ? '📍 ' + E(c.direccion) + '<br>' : ''}${b.join('') || '<span class=m>Datos de contacto próximamente.</span>'}</p></div>`;
}
function filtros(cat, conFecha) {
  const ms = PARTIDOS.filter(m => m.categoria == cat);
  const ruedas = [...new Set(ms.map(m => m.rueda).filter(Boolean))].sort();
  const fechas = [...new Set(ms.map(m => m.fecha))].sort((a, b) => a - b);
  const sel = (k, l, a, p) => `<label>${l}<select data-f=${k}><option value="">Todas</option>${a.map(v => `<option value="${v}" ${ST[k] == v ? 'selected' : ''}>${p}${v}</option>`).join('')}</select></label>`;
  return `<div class=filtros>${ruedas.length > 1 ? sel('rueda', 'Rueda', ruedas, 'Rueda ') : ''}${conFecha && fechas.length ? sel('fecha', 'Fecha', fechas, 'Fecha ') : ''}</div>`;
}
const botonesCat = (c, ks = ['fixture', 'tabla', 'goleadores']) => ks.map(k => `<a class="btn g" href="#torneo/${k}/${c}">${{ fixture: '📅 Fixture', tabla: '📊 Tabla', goleadores: '⚽ Goleadores' }[k]}</a>`).join('');

/* ---------- pantallas ---------- */
const SUB = {
  fixture(cat) {
    const l = PARTIDOS.filter(m => ok(m, ST)).sort((a, b) => a.fecha - b.fecha || (a.dia + a.hora > b.dia + b.hora ? 1 : -1));
    const g = {}; l.forEach(m => (g[m.fecha] = g[m.fecha] || []).push(m));
    return Object.keys(g).map(f => `<div class=fh>Fecha ${f}</div>${g[f].map(partido).join('')}`).join('') || '<p class=m>Todavía no hay partidos cargados en esta categoría.</p>';
  },
  tabla(cat) { return tablaHTML(tabla(cat, ST.rueda)); },
  goleadores(cat) { return statsHTML(stats(cat, ST.rueda)); }
};
const VISTAS = {
  inicio() {
    const acc = CATEGORIAS.map(c => {
      const ms = PARTIDOS.filter(m => m.categoria == c.id && soy(m));
      const prox = ms.filter(m => !m.jugado).sort((a, b) => a.dia + a.hora > b.dia + b.hora ? 1 : -1)[0];
      const ult = ms.filter(m => m.jugado).sort((a, b) => a.dia < b.dia ? 1 : -1)[0];
      const rival = prox ? T(prox.local == ME ? prox.visitante : prox.local).nombre : '';
      return `<details class=acc><summary><b>Categoría ${E(c.id)}</b><span class=m>${prox ? 'Próx: ' + fd(prox.dia) + ' vs ' + E(rival) : 'Sin próximo partido'}</span></summary><div class=accb>
        <div class=fh>Próximo partido</div>${prox ? partido(prox) : '<p class=m>Todavía no hay próximo partido cargado.</p>'}
        <div class=fh>Último resultado</div>${ult ? partido(ult) : '<p class=m>Todavía no jugó.</p>'}
        <p>${botonesCat(c.id)}</p></div></details>`;
    }).join('');
    return `<div class=hero><b>${E(CONFIG.nombre)}</b><p>${E(CONFIG.mensajeInicio)}</p></div>
    <h2>Partidos por categoría</h2><p class=m>Tocá una categoría para ver su próximo partido y su último resultado.</p>${acc}
    <h2>Novedades</h2>${[...NOTICIAS].sort((a, b) => a.fecha < b.fecha ? 1 : -1).slice(0, 2).map(noticia).join('')}
    <h2>${E(HOGAR.titulo)}</h2><div class=card>${progreso()}<a class=btn href="#hogar">Quiero ayudar 💙</a></div>${contacto()}`;
  },
  torneo(q, r) {
    const s = SUB[q] ? q : 'fixture';
    const cat = CATS.includes(r) ? r : (CATS.find(c => PARTIDOS.some(m => m.categoria == c)) || CATS[0]);
    if (ST.cat !== cat) { ST.cat = cat; ST.rueda = ''; ST.fecha = ''; }
    return `<h1>${E(CONFIG.torneo)}</h1><div class=chips>${CATS.map(c => `<a href="#torneo/${s}/${c}" class="${c == cat ? 'on' : ''}">${c}</a>`).join('')}</div>
    <div class=tabs>${[['fixture', 'Fixture'], ['tabla', 'Tabla'], ['goleadores', 'Goleadores']].map(([k, l]) => `<a href="#torneo/${k}/${cat}" class="${k == s ? 'on' : ''}">${l}</a>`).join('')}</div>
    ${filtros(cat, s == 'fixture')}${SUB[s](cat)}`;
  },
  categorias() {
    return `<h1>Categorías</h1><p class=m>Tocá una categoría para ver su plantel y sus datos.</p>` + CATEGORIAS.map(c => {
      const pl = (c.plantel || []).map(j => `<div class=jug><span class=n>${E(j.numero)}</span>${j.foto ? `<img src="${E(j.foto)}" alt="">` : ''}<span><b>${E(j.nombre)}</b><br><span class=m>${E(j.posicion || '')}</span></span></div>`).join('');
      return `<details class=acc><summary><b>Categoría ${E(c.id)}</b><span class=m>${(c.plantel || []).length ? c.plantel.length + ' jugadores' : ''}</span></summary><div class=accb>
        ${c.entrenador ? `<p>🧢 <b>Profe:</b> ${E(c.entrenador)}</p>` : ''}${c.horarios ? `<p>🕒 <b>Entrenamiento:</b> ${E(c.horarios)}</p>` : ''}
        ${pl ? `<div class=card>${pl}</div>` : '<p class=m>Plantel próximamente.</p>'}<p>${botonesCat(c.id)}</p></div></details>`;
    }).join('');
  },
  equipo(q) {
    const t = EQUIPOS.find(e => e.id == q);
    if (!t) return '<p>Equipo no encontrado.</p><a href="#inicio">Volver al inicio</a>';
    const sec = CATS.filter(c => PARTIDOS.some(m => m.categoria == c && (m.local == q || m.visitante == q))).map(c => {
      const tb = tabla(c), pos = tb.findIndex(x => x.id == q), x = tb[pos];
      return `<h2>Categoría ${c}</h2><p class=m>Puesto ${pos + 1} · ${x.pts} pts · PJ ${x.pj} · G ${x.g} · E ${x.e} · P ${x.p}</p>
      ${PARTIDOS.filter(m => m.categoria == c && (m.local == q || m.visitante == q)).sort((a, b) => a.fecha - b.fecha).map(partido).join('')}`;
    }).join('');
    return `<a href="javascript:history.back()">← Volver</a><div class="card cab">${crest(q, 'xl')}<h1>${E(t.nombre)}</h1></div>${sec || '<p class=m>Sin partidos cargados.</p>'}`;
  },
  noticias() { return `<h1>Noticias</h1>${[...NOTICIAS].sort((a, b) => a.fecha < b.fecha ? 1 : -1).map(noticia).join('') || '<p class=m>Sin noticias.</p>'}`; },
  galeria() {
    return `<h1>Galería</h1><div class=gal>${GALERIA.map(g => `<a href="${E(g.foto)}" target=_blank><img src="${E(g.foto)}" alt="${E(g.descripcion)}" loading=lazy><span class=m>${E(g.descripcion)}</span></a>`).join('')}</div>${GALERIA.length ? '' : '<p class=m>Pronto vamos a subir fotos.</p>'}`;
  },
  hogar() {
    const h = HOGAR, d = (l, v) => v ? `<div class=dato><span><span class=m>${l}</span><br><b>${E(v)}</b></span><button class="btn g" data-copy="${E(v)}">Copiar</button></div>` : '';
    return `<div class=hogar><h1>${E(h.titulo)}</h1><div class=card>${h.foto ? `<img class=f src="${E(h.foto)}" alt="">` : ''}<p>${E(h.texto).replace(/\n/g, '<br>')}</p>${progreso()}
    <b>¿En qué usamos lo que juntamos?</b>${h.usos.map(u => `<div class=dato><span>${E(u.icono)} ${E(u.texto)}</span></div>`).join('')}
    ${(h.etapas || []).length ? '<p><b>Etapas</b></p>' + h.etapas.map(e => `<div class=dato><span>${E(e.titulo)}</span><span class=m>${E(e.estado)}</span></div>`).join('') : ''}</div>
    <div class=card><b>💙 Cómo colaborar</b>${d('Alias', h.alias)}${d('CBU / CVU', h.cbu)}${d('Titular', h.titular)}${!h.alias && !h.cbu ? '<p class=m>Datos de colaboración próximamente.</p>' : ''}
    ${/^https:\/\//.test(h.linkPago) ? `<a class=btn href="${E(h.linkPago)}" target=_blank rel=noopener>Donar online</a>` : ''}</div>${contacto()}</div>`;
  },
  contacto() { return `<h1>Contacto</h1>${contacto()}`; }
};

/* ---------- navegación ---------- */
const NAV = [['inicio', '🏠', 'Inicio'], ['torneo', '🏆', 'Torneo'], ['categorias', '🛡️', 'Categorías'], ['noticias', '📰', 'Noticias'], ['galeria', '📷', 'Galería'], ['hogar', '💙', 'Hogar']];
function cabecera() {
  document.title = CONFIG.nombre;
  $('#logo').innerHTML = (CONFIG.logo ? `<img src="${E(CONFIG.logo)}" alt="">` : LOGO_SVG) + `<div><b>${E(CONFIG.nombre)}</b><small>${E(CONFIG.subtitulo)}</small></div>`;
}
function render(keep) {
  if (location.hash.startsWith('#admin')) { if (window.Admin) Admin.open(); return; }
  if (window.Admin) Admin.close(); cabecera();
  const [p = 'inicio', q, r] = location.hash.slice(1).split('/'), pg = VISTAS[p] ? p : 'inicio', y = scrollY;
  $('#app').innerHTML = VISTAS[pg](q, r);
  document.querySelectorAll('.bnav a').forEach(a => a.classList.toggle('on', a.dataset.p == pg));
  scrollTo(0, keep ? y : 0);
}
$('#nav').innerHTML = NAV.map(([k, i, l]) => `<a href="#${k}" data-p=${k}><span>${i}</span>${l}</a>`).join('');
document.addEventListener('change', e => { const f = e.target.dataset.f; if (f) { ST[f] = e.target.value; render(true); } });
document.addEventListener('click', e => {
  const c = e.target.closest('[data-copy]');
  if (c && navigator.clipboard) navigator.clipboard.writeText(c.dataset.copy).then(() => { c.textContent = '¡Copiado!'; setTimeout(() => c.textContent = 'Copiar', 1500); });
});
addEventListener('hashchange', () => render());
render();
