const DANE_CENTER = [43.0731, -89.4012];
const DANE_BOUNDS = [[42.78, -89.86], [43.35, -88.92]];
const USER_AGENT_NOTE = "Dane County Live Weather demo";
const DANE_COUNTY_GEOJSON_URL = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query?where=STATE%3D%2755%27%20AND%20COUNTY%3D%27025%27&outFields=NAME,STATE,COUNTY&outSR=4326&f=geojson";
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
  ["Dane", 43.2505, -89.5015, "village"],
  ["Blue Mounds", 43.0178, -89.8318, "village"],
  ["Shorewood Hills", 43.0775, -89.4451, "village"],
  ["Maple Bluff", 43.1186, -89.3704, "village"],
  ["Windsor", 43.2181, -89.3415, "village"]
];

const map = L.map("map", {
  zoomControl: true,
  maxBoundsViscosity: 0.75
}).fitBounds(DANE_BOUNDS);

map.createPane("radarPane");
map.getPane("radarPane").style.zIndex = 350;
map.getPane("radarPane").classList.add("leaflet-radar-pane");
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: "&copy; OpenStreetMap contributors"
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

function $(id) {
  return document.getElementById(id);
}

function addPlaceLabels() {
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
    }).addTo(map);
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

async function loadDaneBoundary() {
  try {
    const boundary = await fetchJson(DANE_COUNTY_GEOJSON_URL);
    daneBoundaryLayers.forEach((layer) => map.removeLayer(layer));

    const halo = L.geoJSON(boundary, {
      interactive: false,
      style: {
        color: "#ffffff",
        weight: 8,
        opacity: 0.9,
        fill: false
      }
    }).addTo(map);

    const outline = L.geoJSON(boundary, {
      style: {
        color: "#d93025",
        weight: 4,
        opacity: 1,
        fill: false
      }
    }).addTo(map);

    outline.bindTooltip("Dane County", { permanent: false });
    daneBoundaryLayers = [halo, outline];
    map.fitBounds(outline.getBounds(), { padding: [20, 20] });
  } catch (error) {
    const fallback = L.rectangle(DANE_BOUNDS, {
      color: "#d93025",
      weight: 4,
      fill: false,
      opacity: 1
    }).addTo(map);
    fallback.bindTooltip("Dane County", { permanent: false });
    daneBoundaryLayers = [fallback];
  }
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

updateClock();
loadDaneBoundary();
addPlaceLabels();
refreshRadar();
loadWeather();
loadAlerts();
setInterval(updateClock, 1000);
setInterval(loadWeather, 60000);
setInterval(loadAlerts, 60000);
setInterval(refreshRadar, 60000);
