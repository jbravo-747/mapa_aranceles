# Mundo Aranceles

Aplicación web que muestra un mapa interactivo con información por país.
Los datos se cargan dinámicamente desde Google Sheets y las geometrías
se obtienen de un GeoJSON mundial para resaltar solo los territorios con
información disponible.

## Estructura

- `index.html` — contenedor principal con el mapa y el panel lateral.
- `style.css` — define el diseño en dos columnas y adapta el iframe
  embebido para que sea responsivo.
- `script.js` — inicializa el mapa, consume el CSV, dibuja las fronteras
  reales y muestra los detalles de cada país.

## Próximos pasos sugeridos

- Modularizar la lógica en archivos independientes.
- Usar una librería de parsing de CSV (p.ej. PapaParse) para validar los
  datos.
- Explorar controles adicionales de Leaflet y estrategias de despliegue
  optimizadas.

