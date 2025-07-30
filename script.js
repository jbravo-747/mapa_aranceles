// Inicializa el mapa centrado en Sudamérica
const map = L.map('map').setView([-15, -55], 3);

// Añade el mapa base de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Datos de ejemplo para países
const detalles = {
  "Argentina": {
    arancel: "5.2%",
    productos: ["Soja", "Trigo", "Carne"],
    descripcion: "Argentina aplica un arancel promedio del 5.2%."
  },
  "Brasil": {
    arancel: "8.1%",
    productos: ["Café", "Hierro", "Soja"],
    descripcion: "Brasil aplica un arancel promedio del 8.1%."
  }
  // Puedes agregar más países aquí
};

// Función para mostrar detalles en el panel izquierdo
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

// GeoJSON simplificado para Argentina y Brasil
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

// Añade los países al mapa y gestiona el clic
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