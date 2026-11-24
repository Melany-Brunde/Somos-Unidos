/* =====================================================================
   PARTIDOS DE TODAS LAS CATEGORÍAS
   La TABLA, los GOLEADORES y las TARJETAS de cada categoría se calculan solos.

   Cada partido:
     categoria: "2015"   (la categoría, igual que en categorias.js)
     fecha:     número de fecha (1, 2, 3...)
     rueda:     1 o 2 (opcional)
     dia:       "AAAA-MM-DD"
     hora:      "10:00"
     lugar:     "Cancha del barrio"
     local / visitante:  los id de datos/equipos.js
     jugado:    true si ya se jugó, false si falta jugar
     gl / gv:   goles del local / del visitante (solo si jugado:true)
     eventos:   goles, tarjetas y faltas (opcional)
        { min: 12, tipo: "gol", jugador: "Nombre", equipo: "somos" }
        tipos: "gol", "amarilla", "roja", "falta"

   PARA CARGAR UN RESULTADO: cambiá  jugado: false  por  jugado: true, gl: 2, gv: 1
   Tip: copiá y pegá un partido entero y cambiale los datos.
   ===================================================================== */
const PARTIDOS = [

  // ================= CATEGORÍA 2015 =================
  { categoria: "2015", fecha: 1, rueda: 1, dia: "2026-11-08", hora: "10:00", lugar: "Cancha del barrio",
    local: "somos", visitante: "ejemploa", jugado: true, gl: 3, gv: 1,
    eventos: [
      { min: 12, tipo: "gol", jugador: "Jugador Ejemplo 2", equipo: "somos" },
      { min: 25, tipo: "gol", jugador: "Rival 7", equipo: "ejemploa" },
      { min: 30, tipo: "gol", jugador: "Jugador Ejemplo 3", equipo: "somos" },
      { min: 41, tipo: "amarilla", jugador: "Jugador Ejemplo 1", equipo: "somos" },
      { min: 50, tipo: "gol", jugador: "Jugador Ejemplo 2", equipo: "somos" }
    ] },
  { categoria: "2015", fecha: 1, rueda: 1, dia: "2026-11-08", hora: "11:30", lugar: "Cancha del barrio",
    local: "ejemplob", visitante: "ejemploc", jugado: true, gl: 0, gv: 0, eventos: [] },
  { categoria: "2015", fecha: 2, rueda: 1, dia: "2026-11-15", hora: "10:00", lugar: "Club Ejemplo B",
    local: "ejemplob", visitante: "somos", jugado: true, gl: 1, gv: 2,
    eventos: [
      { min: 8, tipo: "gol", jugador: "Jugador Ejemplo 3", equipo: "somos" },
      { min: 33, tipo: "falta", jugador: "Jugador Ejemplo 1", equipo: "somos" },
      { min: 60, tipo: "gol", jugador: "Jugador Ejemplo 2", equipo: "somos" }
    ] },
  { categoria: "2015", fecha: 3, rueda: 1, dia: "2026-11-29", hora: "10:00", lugar: "A confirmar",
    local: "somos", visitante: "ejemploc", jugado: false },

  // ================= CATEGORÍA 2016 =================
  { categoria: "2016", fecha: 1, rueda: 1, dia: "2026-11-08", hora: "09:00", lugar: "Cancha del barrio",
    local: "ejemploc", visitante: "somos", jugado: true, gl: 2, gv: 2, eventos: [] },
  { categoria: "2016", fecha: 2, rueda: 1, dia: "2026-11-29", hora: "09:00", lugar: "A confirmar",
    local: "somos", visitante: "ejemploa", jugado: false },

  // ================= CATEGORÍA 2018 =================
  { categoria: "2018", fecha: 1, rueda: 1, dia: "2026-12-06", hora: "10:00", lugar: "A confirmar",
    local: "somos", visitante: "ejemplob", jugado: false }

  // (Las categorías 2013, 2014, 2017, 2019 y 2020 todavía no tienen partidos cargados.)
];
