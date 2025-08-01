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
        const pais = cols[0].replace('*', '').trim();
        detalles[pais] = {
          arancel_prev: cols[1] || '',
          arancel_nuevo: cols[2] || '',
          participacion: cols[3] || ''
        };
      }
      callback();
    })
    .catch(err => {
      console.error('Error al cargar CSV', err);
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
  <strong>Participación en importaciones de EE.UU.:</strong> ${info.participacion}<br><br>
  <div class="video-container">
    <iframe loading="lazy" src="https://www.canva.com/design/DAGuxMqtXow/uJeCd-UaH0JTn2-0_oVzeA/watch?embed" allowfullscreen></iframe>
  </div>`;
  } else {
    document.getElementById("country-details").innerHTML = "Información no disponible.";
  }
}

// ===========================================
// BLOQUE: CARGA Y DIBUJO DEL GEOJSON EN EL MAPA
// ===========================================
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSGCLpCzHyFDk8wMIUWSDY4zKpMJAabjhlZv_6_4wCmrQRACK5aA-lv05Und6eEVKdsHvqxVqT-zXsJ/pub?output=csv';
const GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';
const NAME_MAP = {
  'E.U.': 'United States of America',
  'South Korea': 'Republic of Korea',
  'Laos': "Lao People's Democratic Republic"
};

function normalizarNombre(pais) {
  return NAME_MAP[pais] || pais;
}

function desnormalizarNombre(admin) {
  return Object.keys(NAME_MAP).find(k => NAME_MAP[k] === admin) || admin;
}

  cargarDatosDesdeCSV(SHEET_CSV_URL, () => {
    fetch(GEOJSON_URL)
      .then(res => res.json())
      .then(worldData => {
        const layer = L.geoJSON(worldData, {
          style: function (feature) {
            const nombre = desnormalizarNombre(feature.properties.ADMIN);
            if (detalles[nombre]) {
              return { color: "#3388ff", weight: 2, fillOpacity: 0.2 };
            }
            return { color: "#3388ff", weight: 1, fillOpacity: 0 };
          },
          onEachFeature: function (feature, layer) {
            const nombre = desnormalizarNombre(feature.properties.ADMIN);
            if (detalles[nombre]) {
              layer.on('click', function () {
                mostrarDetallesPais(nombre);
                document.querySelector("#info h2").textContent = nombre;
              });
              layer.on('mouseover', function () {
                layer.setStyle({ fillOpacity: 0.5 });
              });
              layer.on('mouseout', function () {
                layer.setStyle({ fillOpacity: 0.2 });
              });
            }
          }
        }).addTo(map);

        const bounds = L.latLngBounds([]);
        layer.eachLayer(l => {
          const nombre = desnormalizarNombre(l.feature.properties.ADMIN);
          if (detalles[nombre]) bounds.extend(l.getBounds());
        });

        if (bounds.isValid()) {
          map.fitBounds(bounds);
        } else {
          map.fitWorld();
        }
      })
      .catch(err => {
        console.error('Error al cargar GeoJSON', err);
      });
  });

