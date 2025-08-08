
# Mundo Aranceles — versión mejorada

Mapa interactivo con Leaflet que carga polígonos **reales** por país y datos dinámicos desde **Google Sheets**. Incluye:

- Polígonos reales del mundo (GeoJSON remoto).
- Resaltado *hover* y estilo de **seleccionado**.
- **Zoom automático** al país clicado.
- **Buscador** de países.
- Carga de CSV robusta con **PapaParse**.
- Gráfica comparativa (Chart.js) de arancel previo vs nuevo.
- Manejo de **alias** y normalización de nombres país.
- **localStorage** para recordar el último país seleccionado.
- Mensajes de error más claros.

## Estructura

```
index.html
style.css
script.js
```

## Cómo correr

Solo abre `index.html` en un servidor local (recomendado por CORS) o usa una extensión de “Live Server”.

```bash
# Opción simple con Python 3
python -m http.server 5500
# Luego abre http://localhost:5500/
```

## Datos

- El CSV se lee desde Google Sheets (URL pública). Asegúrate de tener columnas:
  - **País** (primera columna — nombre libre)
  - **arancel_prev**
  - **arancel_nuevo**
  - **participacion**

Si los encabezados no coinciden, el script intenta usar el orden de columnas de forma tolerante.

## Notas

- El GeoJSON mundial se descarga en tiempo de ejecución desde GitHub.
- Puedes ampliar `COUNTRY_ALIASES` en `script.js` para conciliar nombres.
- Si algunas cifras llevan `%` o usan coma decimal, el gráfico las normaliza automáticamente.
