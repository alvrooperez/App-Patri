## APK lista para generar

Tu webapp esta publicada en: **{{ORIGIN}}**

Ultimo commit: `{{COMMIT}}`

### Pasos (2 minutos)

1. **Abre PWABuilder** con la URL ya rellenada:
   {{PWA_URL}}

2. Click **"Package for stores"** -> **"Android"**

3. Acepta los defaults. PWABuilder genera el APK en unos 30 segundos.

4. Click **"Download"** -> guarda el `.apk`

5. **Manda el .apk a tu novia** por WhatsApp / Telegram / email

6. En su Android, abre el APK y acepta "Instalar de fuente desconocida"

### Si quieres build 100% automatico

Instala [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) en tu PC:

```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest {{ORIGIN}}/manifest.json
bubblewrap build
```

Saldra un APK en `app-release-signed.apk` lista para distribuir.

---

_Workflow run: {{RUN_URL}}_
