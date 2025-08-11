
// =======================
// Configuración inicial
// =======================
const SHEET_PUBLISHED_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSGCLpCzHyFDk8wMIUWSDY4zKpMJAabjhlZv_6_4wCmrQRACK5aA-lv05Und6eEVKdsHvqxVqT-zXsJ/pubhtml';
// Si necesitas una pestaña específica, coloca su GID aquí, p. ej. const SHEET_GID = '0'; de lo contrario déjalo vacío.
const SHEET_GID = '';
const SHEET_CSV_URL = SHEET_PUBLISHED_URL.replace('/pubhtml', '/pub?output=csv') + (SHEET_GID ? `&gid=${SHEET_GID}` : '');
const WORLD_GEOJSON_URL = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';

const DEFAULT_STYLE = { color: "#6366f1", weight: 1, fillOpacity: 0.15, fillColor: "#c7d2fe" };
const HOVER_STYLE =   { fillOpacity: 0.35, fillColor: "#93c5fd" };
const SELECT_STYLE =  { color: "#1d4ed8", weight: 2, fillOpacity: 0.45, fillColor: "#a5b4fc" };

let map, worldLayer, detailsByCountry = {}, selectedLayer = null;
let nameToLayer = new Map(); // nombre normalizado -> layer
let barChart = null;

// Aliases para conciliar nombres entre CSV y GeoJSON
const COUNTRY_ALIASES = new Map(Object.entries({
  "E.U.": "United States of America",
  "EE.UU.": "United States of America",
  "USA": "United States of America",
  "Estados Unidos": "United States of America",
  "South Korea": "Korea, Republic of",
  "North Korea": "Korea, Democratic People's Republic of",
  "Russia": "Russian Federation",
  "Vietnam": "Viet Nam",
  "Syria": "Syrian Arab Republic",
  "Czech Republic": "Czechia",
  "Iran": "Iran, Islamic Republic of",
  "Bolivia": "Bolivia, Plurinational State of",
  "Venezuela": "Venezuela, Bolivarian Republic of",
  "Tanzania": "Tanzania, United Republic of",
  "Moldova": "Moldova, Republic of",
  "Cape Verde": "Cabo Verde",
  "Congo": "Congo",
  "Congo (DRC)": "Congo, the Democratic Republic of the",
  "Ivory Coast": "Côte d'Ivoire",
  "Laos": "Lao People's Democratic Republic"
}));

const mqMobile = window.matchMedia("(max-width: 920px)");

// =======================
// Utilidades de vista / móvil
// =======================
const MOBILE_BREAKPOINT = 920;
function isMobile() {
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
}

// =======================
// Selector móvil de países
// =======================
const mobileSelectEl = document.getElementById('country-select');

function buildCountryList() {
  // Unimos nombres del GeoJSON y del CSV (detailsByCountry) para robustez
  const names = new Set();

  // Desde GeoJSON (name/admin/ADMIN)
  if (worldLayer) {
    worldLayer.eachLayer(l => {
      const f = l.feature || {};
      const nm = (f.properties && (f.properties.name || f.properties.admin || f.properties.ADMIN)) || null;
      if (nm) names.add(nm);
    });
  }
  // Desde CSV canónico (keys exactas usadas para lookup de datos)
  Object.keys(detailsByCountry || {}).forEach(n => names.add(n));

  // A arreglo y orden alfabético ES
  return Array.from(names).sort((a,b) => a.localeCompare(b, 'es', {sensitivity:'base'}));
}

function populateMobileSelect() {
  if (!mobileSelectEl) return;
  // Limpia excepto placeholder
  const opts = Array.from(mobileSelectEl.querySelectorAll('option:not(:first-child)'));
  opts.forEach(o => o.remove());

  const list = buildCountryList();
  const frag = document.createDocumentFragment();
  list.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name; // mantenemos el displayName
    opt.textContent = name;
    frag.appendChild(opt);
  });
  mobileSelectEl.appendChild(frag);
}

function onMobileSelectChange(e) {
  const name = e.target.value;
  if (!name) return;
  // Cargar datos y abrir panel SIN necesidad del mapa
  selectCountry(name, null, { focusMap: false });
}

if (mobileSelectEl) {
  mobileSelectEl.addEventListener('change', onMobileSelectChange);
}


function normName(name){
  return (name || "").toString().trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function mapCsvNameToGeojson(name){
  const alias = COUNTRY_ALIASES.get(name);
  return alias || name;
}

// =======================
// Inicializar mapa
// =======================
function initMap(){
  map = L.map('map', { worldCopyJump: true }).setView([20, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
}

// =======================
// Cargar CSV con PapaParse
// =======================
function loadSheetData(){
  return new Promise((resolve, reject) => {
    Papa.parse(SHEET_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        res.data.forEach(row => {
          const rawName = (row[Object.keys(row)[0]] || "").replace('*','').trim(); // 1a columna = país
          const countryName = mapCsvNameToGeojson(rawName);
          detailsByCountry[countryName] = {
            arancel_prev: row.arancel_prev || row[Object.keys(row)[1]] || "",
            arancel_nuevo: row.arancel_nuevo || row[Object.keys(row)[2]] || "",
            participacion: row.participacion || row[Object.keys(row)[3]] || ""
          };
        });
        resolve(detailsByCountry);
      },
      error: (err) => reject(err)
    });
  });
}

// =======================
// Cargar GeoJSON mundial
// =======================
async function loadWorldGeoJSON(){
  const res = await fetch(WORLD_GEOJSON_URL);
  if(!res.ok) throw new Error("No se pudo descargar el GeoJSON mundial");
  return res.json();
}

// =======================
// Dibujar GeoJSON y eventos
// =======================
function addWorldLayer(geojson){
  worldLayer = L.geoJSON(geojson, {
    style: DEFAULT_STYLE,
    onEachFeature: (feature, layer) => {
      const name = feature.properties && (feature.properties.name || feature.properties.admin || feature.properties.ADMIN);
      if(!name) return;

      const key = normName(name);
      nameToLayer.set(key, layer);

      layer.on('mouseover', () => layer.setStyle(HOVER_STYLE));
      layer.on('mouseout', () => {
        if (selectedLayer === layer) return;
        layer.setStyle(DEFAULT_STYLE);
      });
      layer.on('click', () => selectCountry(name, layer));
    }
  }).addTo(map);
}

// =======================
// Selección de país
// =======================

function selectCountry(displayName, layer, opts = {}){
  const { focusMap = true } = opts;

  // Si no viene layer (p.ej., selección desde <select>), intenta encontrarlo
  if (!layer) {
    const key = normName(displayName);
    layer = nameToLayer.get(key) || null;
  }

  // Restaurar estilo del anterior seleccionado
  if (selectedLayer && selectedLayer !== layer){
    try { selectedLayer.setStyle(DEFAULT_STYLE); } catch(_){}
  }
  // Marcar y acercar solo si hay capa y NO estamos en móvil (o si focusMap true)
  if (layer){
    selectedLayer = layer;
    try { layer.setStyle(SELECT_STYLE); } catch(_){}
    if (focusMap && !isMobile()) {
      try{ map.fitBounds(layer.getBounds(), { padding:[10,10] }); }catch(_){}
    }
  } else {
    selectedLayer = null; // no hay capa (p.ej., móvil sin mapa)
  }

  // Mostrar detalles (convierte a nombre canónico si hay alias)
  const countryKey = mapCsvNameToGeojson(displayName);
  showCountryDetails(countryKey);

  // Título del panel y almacenamiento
  try {
    localStorage.setItem("lastCountry", displayName);
  } catch(_) {}
  document.getElementById("panel-title").textContent = displayName;

  // Abrir panel en móvil
  openSheetOnMobile(true);

  // Sincronizar el <select> si existe
  if (mobileSelectEl && mobileSelectEl.value !== displayName) {
    // Solo establecer si la opción existe
    const exists = Array.from(mobileSelectEl.options).some(o => o.value === displayName);
    if (exists) mobileSelectEl.value = displayName;
  }
}
  selectedLayer = layer;
  layer.setStyle(SELECT_STYLE);

  // Acercar al país
  try{ map.fitBounds(layer.getBounds(), { padding:[10,10] }); }catch(_){}

  // Mostrar detalles
  const countryKey = mapCsvNameToGeojson(displayName);
  showCountryDetails(countryKey);

  // Guardar y abrir panel en móvil
  localStorage.setItem("lastCountry", displayName);
  document.getElementById("panel-title").textContent = displayName;
  openSheetOnMobile(true);
}

// =======================
// Panel de detalles
// =======================
function showCountryDetails(countryName){
  const info = detailsByCountry[countryName] || null;
  const container = document.getElementById("country-details");

  if(!info){
    container.innerHTML = `
      <div class="country-error">
        No hay información disponible para <b>${countryName}</b> en el CSV.
      </div>
    `;
    destroyChart();
    return;
  }

  const prev = parseNumber(info.arancel_prev);
  const nuevo = parseNumber(info.arancel_nuevo);
  const part = (info.participacion || "").toString().trim();

  container.innerHTML = `
    <div class="details-grid">
      <div class="detail-row"><b>País:</b> ${countryName}</div>
      <div class="detail-row"><b>Arancel previamente aplicado o amenazado:</b> ${info.arancel_prev}</div>
      <div class="detail-row"><b>Nuevo arancel anunciado:</b> ${info.arancel_nuevo}</div>
      <div class="detail-row"><b>Participación en importaciones de EE.UU.:</b> ${part}</div>
    </div>
    <div class="chart-wrap">
      <canvas id="barAranceles" height="220" aria-label="Comparativa de aranceles"></canvas>
    </div>
    <div style="position: relative; width: 100%; height: 0; padding-top: 56.2225%;
      box-shadow: 0 2px 8px rgba(63,69,81,0.16); margin-top: 1rem; overflow: hidden;
      border-radius: 8px;">
      <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none;"
        src="https://www.canva.com/design/DAGuxMqtXow/uJeCd-UaH0JTn2-0_oVzeA/watch?embed" allowfullscreen="allowfullscreen" allow="fullscreen">
      </iframe>
    </div>
  `;

  // Chart: prev vs nuevo
  destroyChart();
  const ctx = document.getElementById('barAranceles');
  if (ctx && (!isNaN(prev) || !isNaN(nuevo))) {
    barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Previo', 'Nuevo'],
        datasets: [{
          label: 'Arancel (%)',
          data: [isNaN(prev) ? null : prev, isNaN(nuevo) ? null : nuevo]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ctx.raw != null ? ctx.raw + '%' : 'N/D' } }
        },
        scales: {
          y: { beginAtZero: true, ticks: { callback: v => v + '%' } }
        }
      }
    });
  }
}

function destroyChart(){
  if(barChart){ barChart.destroy(); barChart = null; }
}

function parseNumber(s){
  if(s == null) return NaN;
  const v = String(s).replace(/[^0-9.,-]/g, '').replace(',', '.');
  return parseFloat(v);
}

// =======================
// Búsqueda de países
// =======================
function setupSearch(){
  const input = document.getElementById('country-search');
  const clearBtn = document.getElementById('clear-search');
  const toggleBtn = document.getElementById('toggle-panel');

  function findAndSelect(val){
    const key = normName(val);
    if(!key) return;

    let foundEntry = null;
    for(const [nameKey, layer] of nameToLayer.entries()){
      if(nameKey === key || nameKey.includes(key)){
        foundEntry = { nameKey, layer };
        break;
      }
    }
    if(foundEntry){
      const layer = foundEntry.layer;
      const featName = (layer.feature.properties.name || layer.feature.properties.admin || layer.feature.properties.ADMIN);
      selectCountry(featName, layer);
    }
  }

  input.addEventListener('keydown', (e) => {
    if(e.key === 'Enter'){
      findAndSelect(input.value);
    }
  });

  clearBtn.addEventListener('click', () => {
    input.value = "";
    if(selectedLayer){
      selectedLayer.setStyle(DEFAULT_STYLE);
      selectedLayer = null;
    }
    document.getElementById("panel-title").textContent = "Selecciona un país";
    document.getElementById("country-details").innerHTML = "";
    openSheetOnMobile(false);
  });

  toggleBtn.addEventListener('click', () => {
    const willOpen = !document.getElementById('info').classList.contains('open');
    openSheetOnMobile(willOpen);
  });
}

// =======================
// Bottom sheet helpers
// =======================
function openSheetOnMobile(open){
  const sheet = document.getElementById('info');
  const toggleBtn = document.getElementById('toggle-panel');
  const mqMobile = window.matchMedia("(max-width: 920px)");

// =======================
// Utilidades de vista / móvil
// =======================
const MOBILE_BREAKPOINT = 920;
function isMobile() {
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
}

// =======================
// Selector móvil de países
// =======================
const mobileSelectEl = document.getElementById('country-select');

function buildCountryList() {
  // Unimos nombres del GeoJSON y del CSV (detailsByCountry) para robustez
  const names = new Set();

  // Desde GeoJSON (name/admin/ADMIN)
  if (worldLayer) {
    worldLayer.eachLayer(l => {
      const f = l.feature || {};
      const nm = (f.properties && (f.properties.name || f.properties.admin || f.properties.ADMIN)) || null;
      if (nm) names.add(nm);
    });
  }
  // Desde CSV canónico (keys exactas usadas para lookup de datos)
  Object.keys(detailsByCountry || {}).forEach(n => names.add(n));

  // A arreglo y orden alfabético ES
  return Array.from(names).sort((a,b) => a.localeCompare(b, 'es', {sensitivity:'base'}));
}

function populateMobileSelect() {
  if (!mobileSelectEl) return;
  // Limpia excepto placeholder
  const opts = Array.from(mobileSelectEl.querySelectorAll('option:not(:first-child)'));
  opts.forEach(o => o.remove());

  const list = buildCountryList();
  const frag = document.createDocumentFragment();
  list.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name; // mantenemos el displayName
    opt.textContent = name;
    frag.appendChild(opt);
  });
  mobileSelectEl.appendChild(frag);
}

function onMobileSelectChange(e) {
  const name = e.target.value;
  if (!name) return;
  // Cargar datos y abrir panel SIN necesidad del mapa
  selectCountry(name, null, { focusMap: false });
}

if (mobileSelectEl) {
  mobileSelectEl.addEventListener('change', onMobileSelectChange);
}

  if(!mqMobile.matches) return; // Sólo en móvil

  sheet.classList.toggle('open', !!open);
  toggleBtn.setAttribute('aria-expanded', (!!open).toString());
  if(open){ sheet.focus(); }
}

// =======================
// Restaurar última selección
// =======================
function restoreLastSelection(){
  const last = localStorage.getItem("lastCountry");
  if(!last) return;
  const key = normName(last);
  const layer = nameToLayer.get(key);
  if(layer){
    selectCountry(last, layer, { focusMap: !isMobile() });
  } else {
    // En móvil podría no existir capa usable; carga detalles de todas formas
    selectCountry(last, null, { focusMap: false });
  }
}

// =======================
// Arranque
// =======================
(async function main(){
  try{
    initMap();
    await loadSheetData();
    const world = await loadWorldGeoJSON();
    addWorldLayer(world);
    setupSearch();
    populateMobileSelect();
    restoreLastSelection();
  }catch(err){
    console.error(err);
    const details = document.getElementById("country-details");
    details.innerHTML = `<div class="country-error">Ocurrió un error al cargar recursos: ${err.message}</div>`;
  }
})();