# Guía: activar el panel de administración (Supabase, gratis)

Tiempo estimado: 20 minutos. Se hace una sola vez.

## 1. Crear el proyecto
1. Entrá a https://supabase.com y tocá "Start your project". Registrate con tu cuenta de GitHub o con un email.
2. "New project". Nombre: club-somos. Elegí una contraseña de base de datos (guardala) y la región "South America (São Paulo)".
3. Elegí el plan Free y esperá 1 o 2 minutos a que termine de crearse.

## 2. Preparar la base de datos
1. En el menú de la izquierda entrá a "SQL Editor" > "New query".
2. Abrí el archivo supabase/preparar.sql de esta carpeta, copiá TODO, pegalo y tocá "Run".
3. Tiene que decir "Success". (Si lo corrés dos veces da error: es normal, ya está hecho.)

## 3. Conectar la página
1. Menú izquierdo: "Project Settings" (la rueda) > "API Keys" (o "API").
2. Copiá la "Project URL" y la clave "anon public" (o "publishable").
3. Pegalas en datos/nube.js, entre las comillas, y guardá.
   Esa clave es pública por diseño: la seguridad la dan las reglas del paso 2.

## 4. Crear el usuario administrador (único)
1. Menú izquierdo: "Authentication" > "Users" > "Add user" > "Create new user".
2. Poné el email y una contraseña FUERTE. Tildá "Auto Confirm User".
3. IMPORTANTE: andá a Authentication > Sign In / Providers (o "Providers") > Email y
   DESACTIVÁ "Allow new users to sign up". Así nadie más puede crear usuarios.

## 5. Subir los cambios a GitHub
Subí TODA la carpeta de nuevo (index.html, css, js, datos, supabase, fotos) reemplazando lo anterior.

## 6. Usar el panel
1. Entrá a: https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/#admin
2. Iniciá sesión con el email y la contraseña del paso 4.
3. Cargá partidos, resultados, goles, noticias, fotos, plantel y donaciones con los formularios.
4. Al guardar, todos los que tengan la página abierta ven el cambio al instante.
5. Borrá los datos de ejemplo con el botón "Vaciar todo" de cada sección.

## Cosas para saber
- Plan gratis: la base se PAUSA si pasa 1 semana sin ninguna visita ni actividad. Si pasa, entrá al panel de
  Supabase y tocá "Restore". Con visitas regulares no pasa. Mientras tanto la página muestra el último dato guardado.
- Si algo de la nube falla, la página sigue mostrando los archivos de la carpeta datos.
- Guardá la contraseña en un lugar seguro. Si la olvidás: Authentication > Users > restablecer.
- Más de un administrador: creá más usuarios en el paso 4 (todos tienen el mismo permiso).
- Las fotos se achican solas antes de subirlas, así entran muchas en el plan gratis.
- Fotos y datos de menores: pedí autorización por escrito a los padres y evitá apellidos, teléfonos y documentos.
