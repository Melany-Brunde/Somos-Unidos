# Página del Club Somos

PARA EDITAR SIN CÓDIGO: seguí GUIA-ADMIN.md (panel en tu-link/#admin).
Los archivos de la carpeta datos quedan como respaldo y como datos de ejemplo iniciales.

## Qué archivo toco para cada cosa

| Quiero...                                   | Archivo a editar        |
|---------------------------------------------|-------------------------|
| Cambiar nombre, contacto, WhatsApp, logo    | datos/config.js         |
| Agregar clubes rivales y sus escudos        | datos/equipos.js        |
| Plantel, profe y horarios de cada categoría | datos/categorias.js     |
| Cargar partidos, resultados, goles, tarjetas| datos/partidos.js       |
| Publicar noticias                           | datos/noticias.js       |
| Subir fotos a la galería                    | datos/galeria.js        |
| Donaciones, meta, alias, CBU                | datos/hogar.js          |
| Cambiar colores                             | css/estilos.css (arriba de todo, en :root) |

NO hace falta tocar: index.html y js/app.js

Cada partido lleva la categoría (categoria: "2015"). La TABLA, los GOLEADORES y las TARJETAS de cada categoría se calculan solos a partir de sus partidos.
Tocando el nombre o escudo de un rival se abre su ficha con sus partidos en todas las categorías.

## Fotos
Guardalas en estas carpetas y escribí la ruta en el archivo de datos:
- fotos/escudos/  -> escudos de los equipos (ej: "fotos/escudos/somos.png")
- fotos/noticias/ -> fotos de noticias
- fotos/galeria/  -> galería y fotos del proyecto "Hogar"
Consejo: achicá las fotos antes de subirlas (las del celular pesan mucho).
Escribí los nombres de archivo sin espacios ni tildes y respetá mayúsculas/minúsculas.

## Cómo cargar un resultado (ejemplo)
En datos/partidos.js buscá el partido y cambiá:
   jugado: false   ->   jugado: true, gl: 2, gv: 1
(gl = goles del local, gv = goles del visitante)

## Probar en tu compu (Visual Studio Code)
1. File > Open Folder > elegí esta carpeta.
2. Instalá la extensión "Live Server".
3. Clic derecho en index.html > Open with Live Server.

## Subir a GitHub Pages
1. Creá un repositorio Public en github.com.
2. Subí TODO el contenido de esta carpeta (index.html, css, js, datos, fotos).
3. Settings > Pages > Deploy from a branch > main > / (root) > Save.
4. Tu link: https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/

## Si la página queda en blanco
Casi siempre falta una coma "," o una comilla " en un archivo de datos.
Revisá lo último que cambiaste.
