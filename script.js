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
        // Elimina asteriscos y espacios extra del nombre del país
        const pais = cols[0].replace('*', '').trim();
        detalles[pais] = {
          arancel_prev: cols[1] || '',
          arancel_nuevo: cols[2] || '',
          participacion: cols[3] || ''
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
      <strong>País:</strong> ${pais}<br>
      <strong>Arancel previamente aplicado o amenazado:</strong> ${info.arancel_prev}<br>
      <strong>Nuevo arancel anunciado:</strong> ${info.arancel_nuevo}<br>
      <strong>Participación en importaciones de EE.UU.:</strong> ${info.participacion}
      <br><br>
      <div style="position: relative; width: 100%; height: 0; padding-top: 56.2225%; padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden; border-radius: 8px; will-change: transform;">
        <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;"
          src="https://www.canva.com/design/DAGuxMqtXow/uJeCd-UaH0JTn2-0_oVzeA/watch?embed" allowfullscreen="allowfullscreen" allow="fullscreen">
        </iframe>
      </div>
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
    // E.U.
    {
      "type": "Feature",
      "properties": { "name": "E.U." },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-125, 24], [-66, 24], [-66, 49], [-125, 49], [-125, 24]
        ]]
      }
    },
    // Mexico
    {
      "type": "Feature",
      "properties": { "name": "Mexico" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-117, 14], [-86, 14], [-86, 33], [-117, 33], [-117, 14]
        ]]
      }
    },
    // Canada
    {
      "type": "Feature",
      "properties": { "name": "Canada" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-140, 42], [-52, 42], [-52, 83], [-140, 83], [-140, 42]
        ]]
      }
    },
    // Japan
    {
      "type": "Feature",
      "properties": { "name": "Japan" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [129, 31], [146, 31], [146, 46], [129, 46], [129, 31]
        ]]
      }
    },
    // South Korea
    {
      "type": "Feature",
      "properties": { "name": "South Korea" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [126, 34], [130, 34], [130, 39], [126, 39], [126, 34]
        ]]
      }
    },
    // Thailand
    {
      "type": "Feature",
      "properties": { "name": "Thailand" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [97, 5], [106, 5], [106, 21], [97, 21], [97, 5]
        ]]
      }
    },
    // Malaysia
    {
      "type": "Feature",
      "properties": { "name": "Malaysia" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [99, 1], [120, 1], [120, 7], [99, 7], [99, 1]
        ]]
      }
    },
    // Brazil
    {
      "type": "Feature",
      "properties": { "name": "Brazil" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-74, -34], [-34, -34], [-34, 5], [-74, 5], [-74, -34]
        ]]
      }
    },
    // Indonesia
    {
      "type": "Feature",
      "properties": { "name": "Indonesia" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [95, -11], [141, -11], [141, 6], [95, 6], [95, -11]
        ]]
      }
    },
    // South Africa
    {
      "type": "Feature",
      "properties": { "name": "South Africa" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [16, -35], [33, -35], [33, -22], [16, -22], [16, -35]
        ]]
      }
    },
    // Philippines
    {
      "type": "Feature",
      "properties": { "name": "Philippines" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [117, 5], [127, 5], [127, 20], [117, 20], [117, 5]
        ]]
      }
    },
    // Cambodia
    {
      "type": "Feature",
      "properties": { "name": "Cambodia" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [102, 10], [107, 10], [107, 15], [102, 15], [102, 10]
        ]]
      }
    },
    // Bangladesh
    {
      "type": "Feature",
      "properties": { "name": "Bangladesh" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [88, 20], [93, 20], [93, 27], [88, 27], [88, 20]
        ]]
      }
    },
    // Iraq
    {
      "type": "Feature",
      "properties": { "name": "Iraq" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [38, 29], [49, 29], [49, 38], [38, 38], [38, 29]
        ]]
      }
    },
    // Sri Lanka
    {
      "type": "Feature",
      "properties": { "name": "Sri Lanka" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [79, 5], [82, 5], [82, 10], [79, 10], [79, 5]
        ]]
      }
    },
    // Algeria
    {
      "type": "Feature",
      "properties": { "name": "Algeria" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-9, 19], [12, 19], [12, 37], [-9, 37], [-9, 19]
        ]]
      }
    },
    // Kazakhstan
    {
      "type": "Feature",
      "properties": { "name": "Kazakhstan" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [46, 40], [88, 40], [88, 56], [46, 56], [46, 40]
        ]]
      }
    },
    // Libya
    {
      "type": "Feature",
      "properties": { "name": "Libya" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [9, 19], [25, 19], [25, 33], [9, 33], [9, 19]
        ]]
      }
    },
    // Tunisia
    {
      "type": "Feature",
      "properties": { "name": "Tunisia" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [7, 30], [12, 30], [12, 38], [7, 38], [7, 30]
        ]]
      }
    },
    // Serbia
    {
      "type": "Feature",
      "properties": { "name": "Serbia" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [18, 42], [23, 42], [23, 47], [18, 47], [18, 42]
        ]]
      }
    },
    // Laos
    {
      "type": "Feature",
      "properties": { "name": "Laos" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [100, 14], [108, 14], [108, 23], [100, 23], [100, 14]
        ]]
      }
    }
  ]
};

// ===========================================
// BLOQUE: CARGA Y DIBUJO DEL GEOJSON EN EL MAPA
// ===========================================

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSGCLpCzHyFDk8wMIUWSDY4zKpMJAabjhlZv_6_4wCmrQRACK5aA-lv05Und6eEVKdsHvqxVqT-zXsJ/pub?output=csv';

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
      });
    }
  }).addTo(map);
});