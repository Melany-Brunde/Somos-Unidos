/* =====================================================================
   ARMEMOS NUESTRO HOGAR (donaciones)
   ===================================================================== */
const HOGAR = {
  titulo: "Armemos nuestro hogar",
  texto: "Estamos soñando con un lugar propio para que los chicos del barrio jueguen, aprendan y se sientan en casa. Contanos pronto más sobre el proyecto.",
  foto: "",                 // ej: "fotos/galeria/terreno.jpg"
  meta: 1000000,            // meta en pesos
  juntado: 0,               // cuánto se juntó hasta hoy
  // Datos para colaborar (dejá "" lo que no uses)
  alias: "", cbu: "", titular: "",
  linkPago: "",             // link de Mercado Pago (empieza con https://)
  // En qué se usa lo que se junta
  usos: [
    { icono: "⚽", texto: "Cancha y arcos" },
    { icono: "🚿", texto: "Vestuarios" },
    { icono: "🎽", texto: "Pelotas y equipamiento" }
  ],
  // Etapas del proyecto (opcional)
  etapas: [
    // { titulo: "Conseguir el terreno", estado: "En marcha" },
  ]
};
