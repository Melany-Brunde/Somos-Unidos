/* Panel de administración (#admin). No hace falta tocar. */
window.Admin = (() => {
  const root = document.createElement('div'); root.id = 'admin'; document.body.appendChild(root);
  let sesion = null, sec = 'partidos', fcat = '', iniciado = false;
  const h = (tag, p = {}, ...k) => {
    const e = document.createElement(tag);
    for (const [a, v] of Object.entries(p)) { if (a === 'class') e.className = v; else if (a.startsWith('on')) e.addEventListener(a.slice(2), v); else e.setAttribute(a, v); }
    k.flat().forEach(x => { if (x != null && x !== false) e.append(x); });
    return e;
  };
  const toast = t => { const d = h('div', { class: 'toast' }, t); document.body.append(d); setTimeout(() => d.remove(), 2800); };
  const opEq = () => EQUIPOS.map(e => [e.id, e.nombre]);
  const opCat = () => CATEGORIAS.map(c => [String(c.id), 'Categoría ' + c.id]);
  const nombreEq = id => (EQUIPOS.find(e => e.id == id) || { nombre: id }).nombre;
  const slug = s => s.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '').slice(0, 24) || 'club';

  /* ---------- fotos ---------- */
  async function achicar(file, max) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
    const bmp = await createImageBitmap(file), k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise(r => c.toBlob(r, file.type == 'image/png' ? 'image/png' : 'image/jpeg', 0.85));
  }
  async function subir(file, max) {
    const blob = await achicar(file, max), ext = blob.type == 'image/png' ? 'png' : 'jpg';
    const path = Date.now() + '-' + Math.random().toString(36).slice(2, 7) + '.' + ext;
    const { error } = await sb.storage.from('fotos').upload(path, blob, { contentType: blob.type, cacheControl: '31536000' });
    if (error) throw error;
    return sb.storage.from('fotos').getPublicUrl(path).data.publicUrl;
  }

  /* ---------- campos de formulario ---------- */
  function campo(f, v) {
    const T = f.t || 'text';
    if (T === 'img') {
      const w = h('div', { class: 'af' }, h('span', {}, f.l)); let url = v || '';
      const prev = h('img', { class: 'pv' }), st = h('small', {});
      const show = () => { prev.src = url; prev.style.display = url ? 'block' : 'none'; };
      const inp = h('input', { type: 'file', accept: 'image/*', onchange: async () => {
        const fl = inp.files[0]; if (!fl) return; st.textContent = 'Subiendo…';
        try { url = await subir(fl, f.max || 1280); st.textContent = ''; show(); } catch (e) { st.textContent = 'No se pudo subir la foto.'; }
      } });
      w.append(prev, inp, h('button', { class: 'btn g', type: 'button', onclick: () => { url = ''; show(); } }, 'Quitar foto'), st); show();
      return { el: w, get: () => url };
    }
    if (T === 'list') {
      const w = h('div', { class: 'af' }, h('span', {}, f.l)), box = h('div'), rows = [];
      const add = val => {
        const g = f.sub.map(s => [s.k, campo(s, val && val[s.k])]);
        const o = { get: () => Object.fromEntries(g.map(([k, c]) => [k, c.get()])) };
        const r = h('div', { class: 'fil' }, g.map(([, c]) => c.el), h('button', { class: 'btn g', type: 'button', onclick: () => { rows.splice(rows.indexOf(o), 1); r.remove(); } }, '✕ Quitar'));
        rows.push(o); box.append(r);
      };
      (v || []).forEach(add);
      w.append(box, h('button', { class: 'btn g', type: 'button', onclick: () => add({}) }, '＋ Agregar'));
      return { el: w, get: () => rows.map(r => r.get()) };
    }
    const lab = h('label', { class: 'af' }, h('span', {}, f.l)); let get;
    if (T === 'check') { const i = h('input', { type: 'checkbox' }); i.checked = !!v; lab.className = 'af chk'; lab.prepend(i); get = () => i.checked; }
    else if (T === 'textarea') { const i = h('textarea', { rows: 4 }); i.value = v ?? ''; lab.append(i); get = () => i.value; }
    else if (T === 'select') { const i = h('select', {}, (typeof f.o === 'function' ? f.o() : f.o).map(([a, b]) => h('option', { value: a }, b))); i.value = v ?? ''; lab.append(i); get = () => i.value; }
    else { const i = h('input', { type: T, step: 'any' }); i.value = v ?? ''; lab.append(i); get = () => T === 'number' ? (i.value === '' ? undefined : Number(i.value)) : i.value; }
    return { el: lab, get };
  }
  function formulario(titulo, schema, val, ok) {
    const ov = h('div', { class: 'ov' }), form = h('div', { class: 'mb' }, h('h3', {}, titulo)), msg = h('p', { class: 'err' });
    const gs = schema.map(f => { const c = campo(f, val[f.k]); form.append(c.el); return [f.k, c.get]; });
    const bt = h('button', { class: 'btn', onclick: async () => {
      bt.disabled = true; bt.textContent = 'Guardando…'; msg.textContent = '';
      try { await ok(Object.fromEntries(gs.map(([k, g]) => [k, g()]))); ov.remove(); }
      catch (e) { msg.textContent = 'No se pudo guardar: ' + (e.message || e); bt.disabled = false; bt.textContent = 'Guardar'; }
    } }, 'Guardar');
    form.append(msg, h('div', { class: 'r' }, h('button', { class: 'btn g', onclick: () => ov.remove() }, 'Cancelar'), bt));
    ov.append(form); document.body.append(ov);
  }

  /* ---------- guardar en la nube ---------- */
  async function guardar(k) {
    const v = NUBE_ARR[k] || NUBE_OBJ[k];
    const { error } = await sb.from('sitio').upsert({ clave: k, valor: JSON.parse(JSON.stringify(v)) });
    if (error) throw error;
    refrescarDatos(); toast('✔ Guardado. Ya lo ve todo el mundo'); pintar();
  }

  /* ---------- secciones ---------- */
  const tipos = [['gol', '⚽ Gol'], ['amarilla', '🟨 Amarilla'], ['roja', '🟥 Roja'], ['falta', '🚫 Falta']];
  const SECS = {
    partidos: { t: '📅 Partidos', arr: 'partidos', nuevo: () => ({ categoria: fcat || String(CATEGORIAS[0].id), rueda: 1, jugado: false, local: CONFIG.miEquipo }),
      orden: (a, b) => (a.categoria + a.fecha + a.dia) > (b.categoria + b.fecha + b.dia) ? 1 : -1,
      titulo: m => `${m.categoria} · Fecha ${m.fecha || '?'} · ${nombreEq(m.local)} ${m.jugado ? m.gl + ' - ' + m.gv : 'vs'} ${nombreEq(m.visitante)}`, sub: m => `${m.dia || 'sin fecha'} ${m.hora || ''}`,
      schema: () => [{ k: 'categoria', l: 'Categoría', t: 'select', o: opCat }, { k: 'fecha', l: 'Nº de fecha (1, 2, 3...)', t: 'number' }, { k: 'rueda', l: 'Rueda (1 o 2, opcional)', t: 'number' },
        { k: 'dia', l: 'Día', t: 'date' }, { k: 'hora', l: 'Hora', t: 'time' }, { k: 'lugar', l: 'Lugar' },
        { k: 'local', l: 'Local', t: 'select', o: opEq }, { k: 'visitante', l: 'Visitante', t: 'select', o: opEq },
        { k: 'jugado', l: 'Ya se jugó (marcalo para cargar el resultado)', t: 'check' }, { k: 'gl', l: 'Goles del local', t: 'number' }, { k: 'gv', l: 'Goles del visitante', t: 'number' },
        { k: 'eventos', l: 'Goles, tarjetas y faltas', t: 'list', sub: [{ k: 'min', l: 'Minuto', t: 'number' }, { k: 'tipo', l: 'Tipo', t: 'select', o: tipos }, { k: 'jugador', l: 'Jugador' }, { k: 'equipo', l: 'Equipo', t: 'select', o: () => [['', '—'], ...opEq()] }] }] },
    noticias: { t: '📰 Noticias', arr: 'noticias', nuevo: () => ({ fecha: new Date().toISOString().slice(0, 10) }),
      orden: (a, b) => a.fecha < b.fecha ? 1 : -1, titulo: n => n.titulo, sub: n => n.fecha,
      schema: () => [{ k: 'titulo', l: 'Título' }, { k: 'fecha', l: 'Fecha', t: 'date' }, { k: 'texto', l: 'Texto', t: 'textarea' }, { k: 'foto', l: 'Foto (opcional)', t: 'img' }] },
    galeria: { t: '📷 Galería', arr: 'galeria', nuevo: () => ({}), titulo: g => g.descripcion || 'Foto', sub: () => '',
      schema: () => [{ k: 'foto', l: 'Foto', t: 'img' }, { k: 'descripcion', l: 'Descripción' }] },
    categorias: { t: '🛡️ Categorías', arr: 'categorias', nuevo: () => ({}), titulo: c => 'Categoría ' + c.id, sub: c => (c.plantel || []).length + ' jugadores',
      schema: () => [{ k: 'id', l: 'Año de la categoría (ej: 2015)' }, { k: 'entrenador', l: 'Profe' }, { k: 'horarios', l: 'Horarios de entrenamiento' },
        { k: 'plantel', l: 'Plantel', t: 'list', sub: [{ k: 'numero', l: 'Número', t: 'number' }, { k: 'nombre', l: 'Nombre' }, { k: 'posicion', l: 'Posición' }, { k: 'foto', l: 'Foto (opcional)', t: 'img', max: 600 }] }] },
    equipos: { t: '⚔️ Clubes rivales', arr: 'equipos', nuevo: () => ({}), titulo: e => e.nombre, sub: e => e.id,
      schema: () => [{ k: 'nombre', l: 'Nombre del club' }, { k: 'escudo', l: 'Escudo', t: 'img', max: 400 }] },
    hogar: { t: '💙 Hogar', obj: 'hogar',
      schema: () => [{ k: 'titulo', l: 'Título' }, { k: 'texto', l: 'Texto del proyecto', t: 'textarea' }, { k: 'foto', l: 'Foto (opcional)', t: 'img' }, { k: 'meta', l: 'Meta ($)', t: 'number' }, { k: 'juntado', l: 'Juntado hasta hoy ($)', t: 'number' },
        { k: 'alias', l: 'Alias' }, { k: 'cbu', l: 'CBU / CVU' }, { k: 'titular', l: 'Titular' }, { k: 'linkPago', l: 'Link de Mercado Pago (https://...)' },
        { k: 'usos', l: 'En qué se usa lo que se junta', t: 'list', sub: [{ k: 'icono', l: 'Emoji (ej: ⚽)' }, { k: 'texto', l: 'Texto' }] },
        { k: 'etapas', l: 'Etapas del proyecto', t: 'list', sub: [{ k: 'titulo', l: 'Etapa' }, { k: 'estado', l: 'Estado (ej: En marcha)' }] }] },
    config: { t: '⚙️ Datos del club', obj: 'config',
      schema: () => [{ k: 'nombre', l: 'Nombre del club' }, { k: 'subtitulo', l: 'Subtítulo' }, { k: 'torneo', l: 'Título de la sección Torneo' }, { k: 'logo', l: 'Escudo del club', t: 'img', max: 400 },
        { k: 'miEquipo', l: 'Tu club (se resalta en azul)', t: 'select', o: opEq }, { k: 'mensajeInicio', l: 'Mensaje de bienvenida', t: 'textarea' },
        { k: 'whatsapp', l: 'WhatsApp (con código de país, sin + ni espacios)' }, { k: 'instagram', l: 'Instagram (solo el usuario)' }, { k: 'facebook', l: 'Facebook (link completo)' }, { k: 'email', l: 'Email' }, { k: 'direccion', l: 'Dirección' }] }
  };

  async function guardarItem(k, S, i, v) {
    const arr = NUBE_ARR[S.arr];
    if (k === 'equipos' && i < 0) { let id = slug(v.nombre), n = 2; while (arr.some(e => e.id == id)) id = slug(v.nombre) + n++; v.id = id; }
    if (k === 'categorias' && i < 0 && arr.some(c => c.id == v.id)) throw new Error('Esa categoría ya existe.');
    if (i < 0) arr.push(v); else arr[i] = Object.assign({}, arr[i], v);
    await guardar(S.arr);
  }
  function lista(k) {
    const S = SECS[k], arr = NUBE_ARR[S.arr];
    let it = arr.map((x, i) => ({ x, i }));
    if (k === 'partidos' && fcat) it = it.filter(o => o.x.categoria == fcat);
    if (S.orden) it.sort((a, b) => S.orden(a.x, b.x));
    const top = h('p', {}, h('button', { class: 'btn', onclick: () => formulario('Nuevo', S.schema(), S.nuevo(), v => guardarItem(k, S, -1, v)) }, '＋ Agregar'),
      arr.length && k !== 'equipos' ? h('button', { class: 'btn g', onclick: async () => { if (confirm('¿Borrar TODOS los elementos de esta sección?')) { arr.splice(0); try { await guardar(S.arr); } catch (e) { alert(e.message); } } } }, '🗑 Vaciar todo') : null);
    const fil = k === 'partidos' ? h('label', { class: 'af' }, h('span', {}, 'Ver categoría'), h('select', { onchange: e => { fcat = e.target.value; pintar(); } }, h('option', { value: '' }, 'Todas'), CATEGORIAS.map(c => { const o = h('option', { value: c.id }, c.id); if (fcat == c.id) o.selected = true; return o; }))) : null;
    return [top, fil, it.map(({ x, i }) => h('div', { class: 'item' }, h('div', {}, h('b', {}, S.titulo(x) || '(sin título)'), h('div', { class: 'm' }, S.sub(x) || '')),
      h('div', {}, h('button', { class: 'btn g', onclick: () => formulario('Editar', S.schema(), x, v => guardarItem(k, S, i, v)) }, '✏️'),
        h('button', { class: 'btn g', onclick: async () => {
          if (k === 'equipos' && (PARTIDOS.some(m => m.local == x.id || m.visitante == x.id) || CONFIG.miEquipo == x.id)) return alert('Ese club tiene partidos cargados (o es tu club). Borrá primero esos partidos.');
          if (!confirm('¿Borrar?')) return; arr.splice(i, 1); try { await guardar(S.arr); } catch (e) { alert(e.message); } } }, '🗑')))), it.length ? null : h('p', { class: 'm' }, 'Todavía no hay nada cargado.')];
  }
  function objeto(k) {
    const S = SECS[k];
    return [h('p', {}, h('button', { class: 'btn', onclick: () => formulario(S.t, S.schema(), NUBE_OBJ[S.obj], async v => { Object.assign(NUBE_OBJ[S.obj], v); await guardar(S.obj); }) }, '✏️ Editar esta sección')),
      h('p', { class: 'm' }, 'Tocá el botón para cambiar los datos. Al guardar, se actualiza la página para todos.')];
  }

  /* ---------- pantallas ---------- */
  function pintar() {
    root.innerHTML = '';
    const w = h('div', { class: 'ap' }); root.append(w);
    w.append(h('h1', {}, '🔧 Administración'));
    if (!window.sb) return w.append(h('div', { class: 'card' }, h('p', {}, 'Falta conectar la nube. Completá datos/nube.js con los datos de Supabase (mirá GUIA-ADMIN.md).'), h('a', { class: 'btn', href: '#inicio' }, 'Volver a la página')));
    if (!sesion) {
      const em = h('input', { type: 'email', placeholder: 'Email', autocomplete: 'username' }), pw = h('input', { type: 'password', placeholder: 'Contraseña', autocomplete: 'current-password' }), msg = h('p', { class: 'err' });
      const entrar = async () => { msg.textContent = ''; const { error } = await sb.auth.signInWithPassword({ email: em.value.trim(), password: pw.value }); if (error) msg.textContent = 'Email o contraseña incorrectos.'; };
      pw.addEventListener('keydown', e => e.key == 'Enter' && entrar());
      return w.append(h('div', { class: 'card' }, h('label', { class: 'af' }, h('span', {}, 'Email'), em), h('label', { class: 'af' }, h('span', {}, 'Contraseña'), pw), msg,
        h('button', { class: 'btn', onclick: entrar }, 'Entrar'), h('a', { class: 'btn g', href: '#inicio' }, 'Volver')));
    }
    w.append(h('p', {}, h('a', { class: 'btn g', href: '#inicio' }, '← Ver la página'), h('button', { class: 'btn g', onclick: () => sb.auth.signOut() }, 'Cerrar sesión')),
      h('div', { class: 'chips' }, Object.entries(SECS).map(([k, s]) => h('a', { class: k === sec ? 'on' : '', href: 'javascript:void 0', onclick: () => { sec = k; pintar(); } }, s.t))),
      ...(SECS[sec].obj ? objeto(sec) : lista(sec)).flat(2).filter(Boolean));
  }
  async function open() {
    root.classList.add('on'); window.ADMIN_ABIERTO = true;
    if (!iniciado && window.sb) {
      iniciado = true;
      sb.auth.onAuthStateChange((_e, s) => { sesion = s; if (root.classList.contains('on')) pintar(); });
      const { data } = await sb.auth.getSession(); sesion = data.session;
    }
    pintar();
  }
  const close = () => { root.classList.remove('on'); window.ADMIN_ABIERTO = false; };
  return { open, close };
})();
if (location.hash.startsWith('#admin')) render();
