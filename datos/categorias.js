/* =====================================================================
   CATEGORÍAS DEL CLUB (2013 a 2020)
   - id:         el año de la categoría (se usa en partidos.js como categoria: "2015")
   - entrenador: nombre del profe (opcional)
   - horarios:   días y horas de entrenamiento (opcional)
   - plantel:    jugadores de esa categoría (opcional)
        { numero: 9, nombre: "Nombre", posicion: "Delantero", foto: "" }
        foto: ruta en fotos/galeria/ (opcional)
   ===================================================================== */
const CATEGORIAS = [
  { id: "2013", entrenador: "", horarios: "", plantel: [] },
  { id: "2014", entrenador: "", horarios: "", plantel: [] },
  { id: "2015", entrenador: "Profe Ejemplo", horarios: "Martes y jueves 17:00 hs",
    plantel: [
      { numero: 1, nombre: "Jugador Ejemplo 1", posicion: "Arquero", foto: "" },
      { numero: 9, nombre: "Jugador Ejemplo 2", posicion: "Delantero", foto: "" },
      { numero: 10, nombre: "Jugador Ejemplo 3", posicion: "Volante", foto: "" }
    ] },
  { id: "2016", entrenador: "", horarios: "", plantel: [] },
  { id: "2017", entrenador: "", horarios: "", plantel: [] },
  { id: "2018", entrenador: "", horarios: "", plantel: [] },
  { id: "2019", entrenador: "", horarios: "", plantel: [] },
  { id: "2020", entrenador: "", horarios: "", plantel: [] }
];
