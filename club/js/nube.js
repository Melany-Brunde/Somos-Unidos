/* Carga los datos desde la nube y los mantiene actualizados. No hace falta tocar. */
(function () {
  const ARR = { categorias: CATEGORIAS, equipos: EQUIPOS, partidos: PARTIDOS, noticias: NOTICIAS, galeria: GALERIA };
  const OBJ = { config: CONFIG, hogar: HOGAR };
  window.NUBE_ARR = ARR; window.NUBE_OBJ = OBJ;
  const CK = 'club-cache-v1';
  function aplicar(k, v) {
    if (ARR[k] && Array.isArray(v)) ARR[k].splice(0, ARR[k].length, ...v);
    else if (OBJ[k] && v && typeof v === 'object') { Object.keys(OBJ[k]).forEach(x => delete OBJ[k][x]); Object.assign(OBJ[k], v); }
  }
  window.refrescarDatos = () => { CATS = CATEGORIAS.map(c => String(c.id)); };
  const aplicarTodo = rows => { rows.forEach(r => aplicar(r.clave, r.valor)); refrescarDatos(); };

  if (!NUBE.url || !NUBE.clave || !window.supabase) return;
  window.sb = supabase.createClient(NUBE.url, NUBE.clave);
  try { const c = JSON.parse(localStorage.getItem(CK) || 'null'); if (c) { aplicarTodo(c); render(true); } } catch (e) {}

  async function cargar() {
    if (window.ADMIN_ABIERTO) return;
    try {
      const { data, error } = await sb.from('sitio').select('clave,valor');
      if (error || !data || !data.length) return;
      const s = JSON.stringify(data);
      if (s === localStorage.getItem(CK)) return;      // sin cambios: no tocar la pantalla
      aplicarTodo(data); localStorage.setItem(CK, s); render(true);
    } catch (e) {}
  }
  cargar();
  sb.channel('sitio-cambios').on('postgres_changes', { event: '*', schema: 'public', table: 'sitio' }, cargar).subscribe();
  setInterval(cargar, 120000);   // respaldo por si se corta el tiempo real
})();
