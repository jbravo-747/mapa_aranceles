// =======================
// INICIALIZACIÓN DEL MAPA
// =======================
const map = L.map('map').setView([-15, -55], 3);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// ==========================================
// BLOQUE: CARGA DE DATOS DESDE GOOGLE SHEETS
// ==========================================
let detalles = {};

function cargarDatosDesdeCSV(url, callback) {
  fetch(url)
    .then(response => response.text())
    .then(text => {
      const rows = text.trim().split('\n');
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(',');
        const pais = cols[0];
        detalles[pais] = {
          arancel: cols[1],
          productos: cols[2] ? cols[2].split(';') : [],
          descripcion: cols[3] || ''
        };
      }
      callback();
    });
}

// ==================================
// BLOQUE: FUNCIÓN DE MOSTRAR DETALLES
// ==================================
function mostrarDetallesPais(pais) {
  const info = detalles[pais];
  if (info) {
    document.getElementById("country-details").innerHTML = `
      <strong>Arancel promedio:</strong> ${info.arancel}<br>
      <strong>Principales productos:</strong> ${info.productos.join(", ")}<br>
      <p>${info.descripcion}</p>
    `;
  } else {
    document.getElementById("country-details").innerHTML = "Información no disponible.";
  }
}

// ===============================
// BLOQUE: GEOJSON DE LOS PAÍSES
// ===============================
const geojsonData = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name": "Argentina" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-73.4154, -55.25], [-66.5, -55.25], [-66.5, -21.8], [-73.4154, -21.8], [-73.4154, -55.25]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Brasil" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-74, -34], [-34, -34], [-34, 5], [-74, 5], [-74, -34]
        ]]
      }
    }
  ]
};

// ===========================================
// BLOQUE: CARGA Y DIBUJO DEL GEOJSON EN EL MAPA
// ===========================================

// URL de tu Google Sheet publicado como CSV
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSGCLpCzHyFDk8wMIUWSDY4zKpMJAabjhlZv_6_4wCmrQRACK5aA-lv05Und6eEVKdsHvqxVqT-zXsJ/pub?output=csv';

// Carga los datos y luego inicializa el GeoJSON en el mapa
cargarDatosDesdeCSV(SHEET_CSV_URL, () => {
  L.geoJSON(geojsonData, {
    style: {
      color: "#3388ff",
      weight: 2,
      fillOpacity: 0.2
    },
    onEachFeature: function (feature, layer) {
      layer.on('click', function () {
        mostrarDetallesPais(feature.properties.name);
        document.querySelector("#info h2").textContent = feature.properties.name;
      });
      layer.on('mouseover', function () {
        layer.setStyle({ fillOpacity: 0.5 });
      });
      layer.on('mouseout', function () {
        layer.setStyle({ fillOpacity: 0.2 });