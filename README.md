# Mi Dia a Dia

App HTML standalone para moviles. Un solo archivo, sin build, sin dependencias.

## Como usarla

1. Abre `index.html` en cualquier navegador moderno.
2. Todo se guarda automaticamente en `localStorage` del navegador.

## Estructura del proyecto

```
app-novia/
+- index.html          <-- la app
+- dashboard.html      <-- editor visual de fotos (opcional, lo puedes ignorar)
+- mensajes.json       <-- frases editables, se cargan al arrancar
+- mensajes.README.md  <-- guia de las categorias de mensajes
+- _optimize.py        <-- script para re-optimizar fotos cuando anadas nuevas
+- assets/
   +- pool/            <-- aqui van tus fotos originales (las que has subido)
   |  +- manifest.json <-- generado por _optimize.py
   |  +- _opt/         <-- versiones optimizadas (lee la app desde aqui)
   +- icon/            <-- base del icono de la app (opcional)
   +- processed/       <-- recortes finales del dashboard (opcional)
+- README.md
```

## Imagenes

### Como anadir/quitar fotos

1. Arrastra tus JPG/PNG/WebP a `assets/pool/`
2. Ejecuta `python _optimize.py` (si tienes Python + Pillow) o usa el `dashboard.html`
3. Recarga la app

`_optimize.py` se encarga de:
- Aplicar la rotacion EXIF (para que las fotos del movil salgan derechas)
- Redimensionar a 1600px maximo
- Comprimir a JPEG q.82 (de 2MB a 100-450KB)
- Crear un `manifest.json` con la lista

La app lee las fotos de `assets/pool/_opt/` automaticamente. Si no hay ninguna, usa iconos emoji como fallback.

### Sin Python

Si no tienes Pillow, abre `dashboard.html` y arrastra las fotos alli. El navegador las optimizara en local y te dara los archivos para descargar, que metes en `assets/pool/`.

## Mensajes

Edita `mensajes.json` directamente. Tiene 5 categorias:

| Categoria | Cuando se dispara |
|-----------|-------------------|
| `racha`   | Cuando tu racha sube a multiplo de 5 (5, 10, 15...) |
| `animo`   | Cuando marcas un habito sin objetivo numerico |
| `logro`   | Cuando completas un objetivo numerico por primera vez hoy |
| `fuerte`  | Cuando bates un PR en el gym |
| `campeona`| (reservada para futuro: cuando vuelves tras fallar dias) |

Las frases de `racha` aceptan `{n}` que se reemplaza con el numero de dias.

`mensajes.README.md` tiene instrucciones detalladas.

## Dashboard (opcional)

`dashboard.html` es un editor visual con tres pestanas:
- **Fotos**: subes, optimizas, previsualizas
- **Asignar**: recortas cada foto en su sitio (21:9, 3:4, 1:1)
- **Mensajes**: editas `mensajes.json` con textareas
- **Vista previa**: como queda en un movil simulado

Si no quieres complicarte, **ignora el dashboard** y mete las fotos directamente en `assets/pool/`, ejecuta el script, recarga la app. Eso ya da una rotacion automatica y los mensajes del JSON.

## Funcionalidades (resumen)

### Habitos
- Retos numericos (objetivo + unidad, stepper -/+)
- Imagen por habito y mensaje de animo personalizado
- Celebraciones con confeti + foto del pool + frase contextual
- Rachas, mejor racha, calendario mensual, grafica 30 dias
- Frecuencia: diaria / L-V / personalizada

### Gimnasio
- Categorias colapsables (Pecho, Pierna...)
- Buscador y filtros (Todos / Recientes / Con PR / Sin sesiones)
- 1RM estimado (Epley), volumen total, PR
- Celebracion al batir PR con mensaje personalizado
- Imagen y mensaje por ejercicio

### General
- Foto aleatoria del pool como fondo del saludo
- Toast de confirmacion
- Saludo segun hora
- Mobile-first, soporte para notch de iPhone

## Personalizacion

- **Colores**: bloque `:root` en el CSS de `index.html` -> `--primary`, `--lavender`, etc.
- **Categorias de mensajes**: editar `mensajes.json`
- **Pool de fotos**: anadir a `assets/pool/` y ejecutar `_optimize.py`
- **Icono de la app** (favicon, apple-touch-icon): ahora mismo es un emoji en un fondo rosa. Si quieres un PNG custom, metelo en `assets/icon/` y anade las correspondientes `<link rel="icon">` en el `<head>` del `index.html`.

## Para convertirla en app movil

### PWA (ya viene configurado)

- **iOS**: Safari -> Compartir -> "Anadir a pantalla de inicio"
- **Android**: Chrome -> menu -> "Instalar app"

El `manifest.json` y el service worker (`sw.js`) ya estan configurados.

### APK firmada con GitHub Actions

Hay un workflow en `.github/workflows/build-apk.yml` que buildea la APK con [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) (oficial de Google para TWA).

**Como se usa:**

1. Sube el repo a GitHub (rama `main`)
2. Activa **GitHub Pages** en Settings -> Pages -> source: `main` branch, `/` root
3. Espera 2-3 min a que se publique
4. La pestana **Actions** correra automaticamente el build
5. En la ejecucion, scroll abajo hasta **Artifacts** y descarga `app-release-apk`
6. Manda el `.apk` a quien quieras por WhatsApp / Telegram / email
7. En el Android, abrir el APK y aceptar "Instalar de fuente desconocida"

**Para cambiar la URL del TWA:**

Por defecto apunta a `https://TU_USUARIO.github.io/TU_REPO/`. Si publicas en otro sitio, crea una variable de repo llamada `TWA_ORIGIN` con la URL completa (sin slash final).

**Para subir a Play Store:**

La debug key que genera Bubblewrap NO vale para publicar. Necesitas:
- Una cuenta de Google Play Developer ($25 una vez)
- Generar tu propia release key
- Actualizar el workflow para firmarla

Doc oficial: https://github.com/GoogleChromeLabs/bubblewrap/blob/main/docs/quickstart.md

## Backup de datos

Los datos (habitos, ejercicios, sesiones) viven en `localStorage` bajo `mia-app-v1`. Para hacer backup:

```js
copy(localStorage.getItem('mia-app-v1'))
```

Para restaurar:

```js
localStorage.setItem('mia-app-v1', '...pega aqui...')
location.reload()
```

**Cuidado**: las imagenes de los habitos/ejercicios subidas por el usuario (distintas de las del pool) se guardan como base64 dentro de este localStorage. Si metes muchas, puede petar. Las del `assets/pool/_opt/` NO cuentan en este limite porque las lee por URL.
