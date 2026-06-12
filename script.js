const DANE_CENTER = [43.0731, -89.4012];
const DANE_BOUNDS = [[42.78, -89.86], [43.35, -88.92]];
const REGIONAL_BOUNDS = [[42.45, -90.75], [43.75, -88.45]];
const USER_AGENT_NOTE = "Dane County Live Weather demo";
const COUNTY_CODES = ["025", "111", "021", "027", "055", "045", "105", "049", "065"];
const COUNTY_QUERY = COUNTY_CODES.map((code) => `'${code}'`).join(",");
const TIGER_COUNTIES = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query";
const TIGER_PLACES = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer";
const REGIONAL_WHERE = `STATE='55' AND COUNTY IN (${COUNTY_QUERY})`;
const FEATURE_COPY = {
  weather: {
    title: "Data Notes",
    summary: "Public radar and station feeds refresh on their own schedule. This page updates automatically and shows current feed timestamps when available.",
    details: [
      ["Station", "NWS KMSN"],
      ["Radar", "NOAA/NWS MRMS"],
      ["Refresh", "Every 60 seconds"]
    ]
  },
  fire: {
    title: "Southern WI Fire",
    summary: "Fire-watch, no-burn, and fire-risk information will focus on Dane, Sauk, Columbia, Dodge, Jefferson, Green, Rock, Iowa, and Lafayette counties.",
    details: [
      ["Source", "Wisconsin DNR"],
      ["Layer", "Fire danger / burn status"],
      ["Status", "Ready for live DNR feed"]
    ]
  },
  flood: {
    title: "Southern WI Flood",
    summary: "Flood-watch mode will focus on flood alerts, flood watches, and flood warnings for the same southern Wisconsin county set.",
    details: [
      ["Source", "NWS alerts"],
      ["Area", "Focused counties"],
      ["Status", "Alert filtering next"]
    ]
  }
};
const PLACES = [
  ["Madison", 43.0731, -89.4012, "city"],
  ["Fitchburg", 43.0022, -89.4240, "city"],
  ["Middleton", 43.0972, -89.5043, "city"],
  ["Sun Prairie", 43.1836, -89.2137, "city"],
  ["Verona", 42.9908, -89.5332, "city"],
  ["Stoughton", 42.9169, -89.2179, "city"],
  ["Monona", 43.0622, -89.3340, "city"],
  ["DeForest", 43.2478, -89.3437, "village"],
  ["Waunakee", 43.1919, -89.4557, "village"],
  ["Oregon", 42.9261, -89.3846, "village"],
  ["McFarland", 43.0125, -89.2898, "village"],
  ["Mount Horeb", 43.0086, -89.7385, "village"],
  ["Cross Plains", 43.1144, -89.6557, "village"],
  ["Black Earth", 43.1372, -89.7468, "village"],
  ["Mazomanie", 43.1767, -89.7948, "village"],
  ["Cottage Grove", 43.0761, -89.1998, "village"],
  ["Deerfield", 43.0511, -89.0757, "village"],
  ["Marshall", 43.1683, -89.0668, "village"],
  ["Cambridge", 43.0036, -89.0168, "village"],
  ["Belleville", 42.8597, -89.5385, "village"],
  ["Brooklyn", 42.8536, -89.3704, "village"],
  ["Dane", 43.2505, -89.5015, "village"],
  ["Blue Mounds", 43.0178, -89.8318, "village"],
  ["Maple Bluff", 43.1186, -89.3704, "village"],
  ["Windsor", 43.2181, -89.3415, "village"]
];

const map = L.map("map", {
  zoomControl: true,
  maxBoundsViscosity: 0.75
}).fitBounds(REGIONAL_BOUNDS);

map.createPane("roadsPane");
map.getPane("roadsPane").style.zIndex = 320;
map.createPane("radarPane");
map.getPane("radarPane").style.zIndex = 360;
map.getPane("radarPane").classList.add("leaflet-radar-pane");
map.createPane("boundaryPane");
map.getPane("boundaryPane").style.zIndex = 470;

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

L.tileLayer("https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Transportation/MapServer/tile/{z}/{y}/{x}", {
  maxZoom: 18,
  opacity: 0.55,
  pane: "roadsPane",
  attribution: "U.S. Census TIGER roads"
}).addTo(map);

const noaaRadarLayer = L.tileLayer.wms("https://opengeo.ncep.noaa.gov/geoserver/conus/conus_bref_qcd/ows", {
  layers: "conus_bref_qcd",
  format: "image/png",
  transparent: true,
  opacity: 0.68,
  pane: "radarPane",
  attribution: "NOAA/NWS MRMS"
}).addTo(map);

let daneBoundaryLayers = [];
let daneLabelLayer = L.layerGroup().addTo(map);
let regionalLabelLayer = L.layerGroup().addTo(map);

function $(id) {
  return document.getElementById(id);
}

function addFallbackDaneLabels() {
  daneLabelLayer.clearLayers();
  PLACES.forEach(([name, lat, lng, type]) => {
    const icon = L.divIcon({
      className: `place-label ${type}`,
      html: `<span>${name}</span>`,
      iconSize: [110, 22],
      iconAnchor: [55, 11]
    });
    L.marker([lat, lng], {
      icon,
      interactive: false,
      zIndexOffset: 900
    }).addTo(daneLabelLayer);
  });
}

function fmt(value, suffix = "") {
  return value === null || value === undefined || Number.isNaN(value) ? "--" : `${value}${suffix}`;
}

function cToF(c) {
  return c === null || c === undefined ? null : Math.round((c * 9 / 5) + 32);
}

function mpsToMph(mps) {
  return mps === null || mps === undefined ? null : Math.round(mps * 2.23694);
}

function paToInHg(pa) {
  return pa === null || pa === undefined ? null : (pa * 0.0002953).toFixed(2);
}

function metersToMiles(m) {
  return m === null || m === undefined ? null : (m / 1609.344).toFixed(1);
}

function compass(degrees) {
  if (degrees === null || degrees === undefined) return "";
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(degrees / 45) % 8];
}

function updateClock() {
  const now = new Date();
  $("clock").textContent = now.toLocaleTimeString("en-US", { timeZone: "America/Chicago" });
  $("dateLine").textContent = now.toLocaleDateString("en-US", {
    timeZone: "America/Chicago",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "Accept": "application/geo+json, application/json"
    },
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

function tigerQueryUrl(baseUrl, layerId, where) {
  const url = new URL(layerId === null ? baseUrl : `${baseUrl}/${layerId}/query`);
  url.searchParams.set("where", where);
  url.searchParams.set("outFields", "NAME,STATE,COUNTY,BASENAME");
  url.searchParams.set("returnGeometry", "true");
  url.searchParams.set("resultRecordCount", "5000");
  url.searchParams.set("outSR", "4326");
  url.searchParams.set("f", "geojson");
  return url.toString();
}

function labelLayer(feature, layer) {
  const name = feature.properties?.BASENAME || feature.properties?.NAME;
  if (name) layer.bindTooltip(name, { sticky: true });
}

function isDaneFeature(feature) {
  return feature.properties?.STATE === "55" && feature.properties?.COUNTY === "025";
}

function addFeatureLabel(feature, type, seen) {
  const name = feature.properties?.BASENAME || feature.properties?.NAME;
  const county = feature.properties?.COUNTY;
  const state = feature.properties?.STATE;
  if (!name || name === "Shorewood Hills") return;

  const key = `${state}:${county}:${type}:${name}`;
  if (seen.has(key)) return;
  seen.add(key);

  const bounds = L.geoJSON(feature).getBounds();
  if (!bounds.isValid()) return;

  const icon = L.divIcon({
    className: `place-label ${type}`,
    html: `<span>${name}</span>`,
    iconSize: [130, 22],
    iconAnchor: [65, 11]
  });

  L.marker(bounds.getCenter(), {
    icon,
    interactive: false,
    zIndexOffset: 900
  }).addTo(isDaneFeature(feature) ? daneLabelLayer : regionalLabelLayer);
}

async function loadRegionalBoundaries() {
  try {
    const [counties, towns, places] = await Promise.all([
      fetchJson(tigerQueryUrl(TIGER_COUNTIES, null, REGIONAL_WHERE)),
      fetchJson(tigerQueryUrl(TIGER_PLACES, 1, REGIONAL_WHERE)),
      fetchJson(tigerQueryUrl(TIGER_PLACES, 4, REGIONAL_WHERE))
    ]);
    daneBoundaryLayers.forEach((layer) => map.removeLayer(layer));
    daneLabelLayer.clearLayers();
    regionalLabelLayer.clearLayers();

    const countyHalo = L.geoJSON(counties, {
      pane: "boundaryPane",
      style: (feature) => ({
        color: "#ffffff",
        weight: isDaneFeature(feature) ? 9 : 7,
        opacity: 0.92,
        fill: false
      }),
      onEachFeature: labelLayer
    }).addTo(map);

    const townOutlines = L.geoJSON(towns, {
      interactive: false,
      pane: "boundaryPane",
      style: {
        color: "#6b7280",
        weight: 1.4,
        opacity: 0.72,
        dashArray: "5 4",
        fill: false
      }
    }).addTo(map);

    const placeOutlines = L.geoJSON(places, {
      pane: "boundaryPane",
      style: {
        color: "#2563eb",
        weight: 1.8,
        opacity: 0.78,
        fill: false
      },
      onEachFeature: labelLayer
    }).addTo(map);

    const countyOutline = L.geoJSON(counties, {
      pane: "boundaryPane",
      style: (feature) => ({
        color: "#d93025",
        weight: isDaneFeature(feature) ? 4.8 : 3.2,
        opacity: 1,
        fill: false
      })
    }).addTo(map);

    countyOutline.bindTooltip("Focused county", { permanent: false });
    daneBoundaryLayers = [countyHalo, townOutlines, placeOutlines, countyOutline];

    const seenLabels = new Set();
    towns.features?.forEach((feature) => addFeatureLabel(feature, "town", seenLabels));
    places.features?.forEach((feature) => addFeatureLabel(feature, "village", seenLabels));
    if (!$("toggleDaneLabels").checked) map.removeLayer(daneLabelLayer);
    if (!$("toggleRegionalLabels").checked) map.removeLayer(regionalLabelLayer);

    map.fitBounds(countyHalo.getBounds(), { padding: [14, 14] });
  } catch (error) {
    addFallbackDaneLabels();
    const fallback = L.rectangle(REGIONAL_BOUNDS, {
      color: "#d93025",
      weight: 4,
      fill: false,
      opacity: 1
    }).addTo(map);
    fallback.bindTooltip("Dane County", { permanent: false });
    daneBoundaryLayers = [fallback];
  }
}

function setFeatureMode(mode) {
  const copy = FEATURE_COPY[mode] || FEATURE_COPY.weather;
  $("featureTitle").textContent = copy.title;
  $("featureSummary").textContent = copy.summary;
  $("featureDetails").innerHTML = copy.details.map(([term, value]) => (
    `<div><dt>${term}</dt><dd>${value}</dd></div>`
  )).join("");
}

async function loadWeather() {
  try {
    const data = await fetchJson("https://api.weather.gov/stations/KMSN/observations/latest");
    const p = data.properties;
    const tempF = cToF(p.temperature?.value);
    const windMph = mpsToMph(p.windSpeed?.value);
    const gustMph = mpsToMph(p.windGust?.value);
    const windText = windMph === null ? "--" : `${compass(p.windDirection?.value)} ${windMph} mph${gustMph ? `, gust ${gustMph}` : ""}`;

    $("temperature").textContent = fmt(tempF, " deg");
    $("summary").textContent = p.textDescription || "Latest KMSN observation";
    $("wind").textContent = windText;
    $("humidity").textContent = fmt(Math.round(p.relativeHumidity?.value), "%");
    $("pressure").textContent = fmt(paToInHg(p.barometricPressure?.value), " in");
    $("visibility").textContent = fmt(metersToMiles(p.visibility?.value), " mi");

    const when = p.timestamp ? new Date(p.timestamp) : null;
    $("obsAge").textContent = when
      ? `Observed ${when.toLocaleString("en-US", { timeZone: "America/Chicago" })}`
      : "Observation time unavailable";
  } catch (error) {
    $("summary").textContent = "Weather feed unavailable";
    $("obsAge").textContent = "Could not reach the NWS observation feed.";
  }
}

async function loadAlerts() {
  try {
    const data = await fetchJson("https://api.weather.gov/alerts/active?area=WI");
    const daneAlerts = data.features.filter((feature) => {
      const props = feature.properties || {};
      const area = `${props.areaDesc || ""} ${props.geocode?.UGC?.join(" ") || ""}`;
      return /Dane|WIC025|WIZ063/i.test(area);
    });

    $("alertCount").textContent = daneAlerts.length;
    if (!daneAlerts.length) {
      $("alertsList").textContent = "No active Dane County alerts found.";
      return;
    }

    $("alertsList").innerHTML = daneAlerts.slice(0, 4).map((feature) => {
      const p = feature.properties;
      const until = p.ends ? new Date(p.ends).toLocaleTimeString("en-US", { timeZone: "America/Chicago" }) : "until further notice";
      return `<article class="alert-item"><strong>${p.event}</strong><small>${p.severity || "Alert"} - ${until}</small></article>`;
    }).join("");
  } catch (error) {
    $("alertCount").textContent = "!";
    $("alertsList").textContent = "Could not reach the NWS alert feed.";
  }
}

function refreshRadar() {
  noaaRadarLayer.setOpacity(Number($("radarOpacity").value) / 100);
  noaaRadarLayer.setParams({ _: Date.now() });
  $("radarStatus").textContent = "Radar refreshed";
}

$("refreshRadar").addEventListener("click", refreshRadar);
$("refreshWeather").addEventListener("click", () => {
  loadWeather();
  loadAlerts();
});
$("radarOpacity").addEventListener("input", (event) => {
  noaaRadarLayer.setOpacity(Number(event.target.value) / 100);
});
$("toggleDaneLabels").addEventListener("change", (event) => {
  if (event.target.checked) {
    daneLabelLayer.addTo(map);
  } else {
    map.removeLayer(daneLabelLayer);
  }
});
$("toggleRegionalLabels").addEventListener("change", (event) => {
  if (event.target.checked) {
    regionalLabelLayer.addTo(map);
  } else {
    map.removeLayer(regionalLabelLayer);
  }
});
$("featureSelect").addEventListener("change", (event) => {
  setFeatureMode(event.target.value);
});

updateClock();
setFeatureMode($("featureSelect").value);
loadRegionalBoundaries();
refreshRadar();
loadWeather();
loadAlerts();
setInterval(updateClock, 1000);
setInterval(loadWeather, 60000);
setInterval(loadAlerts, 60000);
setInterval(refreshRadar, 60000);
