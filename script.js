
const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © OpenStreetMap contributors',
}).addTo(map);

// Reemplaza con tu Sheet ID
const SHEET_ID = 'TU_SHEET_ID';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

let countryData = {};

fetch(SHEET_URL)
  .then(response => response.text())
  .then(csvText => {
    const rows = csvText.split('\n').map(row => row.split(','));
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 2) continue;
      const country = row[0].trim();
      countryData[country] = {
        poblacion: row[1],
        capital: row[2],
        descripcion: row[3]
      };
    }
  });

fetch('countries.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      style: { color: "#3388ff", weight: 1 },
      onEachFeature: (feature, layer) => {
        layer.on('click', () => {
          const countryName = feature.properties.ADMIN;
          const info = countryData[countryName];
          document.getElementById('country-details').innerHTML = info
            ? `
              <h3>${countryName}</h3>
              <p><strong>Población:</strong> ${info.poblacion}</p>
              <p><strong>Capital:</strong> ${info.capital}</p>
              <p>${info.descripcion}</p>
            `
            : `<p>No hay información disponible para <strong>${countryName}</strong>.</p>`;
        });
      }
    }).addTo(map);
  });