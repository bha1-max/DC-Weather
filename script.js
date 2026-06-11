const DANE_CENTER = [43.0731, -89.4012];
const DANE_BOUNDS = [[42.78, -89.86], [43.35, -88.92]];
const USER_AGENT_NOTE = "Dane County Live Weather demo";

const map = L.map("map", {
  zoomControl: true,
  maxBoundsViscosity: 0.75
}).fitBounds(DANE_BOUNDS);

map.createPane("radarPane");
map.getPane("radarPane").style.zIndex = 350;
map.getPane("radarPane").classList.add("leaflet-radar-pane");
map.createPane("labelsPane");
map.getPane("labelsPane").style.zIndex = 450;
map.getPane("labelsPane").classList.add("leaflet-labels-pane");

L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
  maxZoom: 18,
  attribution: "&copy; OpenStreetMap, &copy; CARTO"
}).addTo(map);

const noaaRadarLayer = L.tileLayer.wms("https://opengeo.ncep.noaa.gov/geoserver/conus/conus_bref_qcd/ows", {
  layers: "conus_bref_qcd",
  format: "image/png",
  transparent: true,
  opacity: 0.82,
  pane: "radarPane",
  attribution: "NOAA/NWS MRMS"
}).addTo(map);

let radarLayer = noaaRadarLayer;

L.tileLayer("https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png", {
  maxZoom: 18,
  pane: "labelsPane",
  attribution: "&copy; OpenStreetMap, &copy; CARTO"
}).addTo(map);

const daneOutline = L.rectangle(DANE_BOUNDS, {
  color: "#11c976",
  weight: 5,
  fill: false,
  opacity: 0.98
}).addTo(map);
daneOutline.bindTooltip("Dane County focus area", { permanent: false });

function $(id) {
  return document.getElementById(id);
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
      "Accept": "application/geo+json, application/json",
      "User-Agent": USER_AGENT_NOTE
    },
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
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

async function loadSmoothRadar() {
  try {
    const data = await fetchJson("https://api.rainviewer.com/public/weather-maps.json");
    const frames = data.radar?.past || [];
    const latest = frames[frames.length - 1];
    if (!latest?.path) throw new Error("No RainViewer radar frame");

    const smoothLayer = L.tileLayer(`https://tilecache.rainviewer.com${latest.path}/256/{z}/{x}/{y}/2/1_1.png`, {
      opacity: Number($("radarOpacity").value) / 100,
      maxNativeZoom: 10,
      maxZoom: 18,
      pane: "radarPane",
      attribution: "RainViewer"
    });

    smoothLayer.on("tileerror", () => {
      if (radarLayer === smoothLayer) {
        map.removeLayer(smoothLayer);
        noaaRadarLayer.setOpacity(Number($("radarOpacity").value) / 100);
        noaaRadarLayer.setParams({ _: Date.now() });
        noaaRadarLayer.addTo(map);
        radarLayer = noaaRadarLayer;
        $("radarStatus").textContent = "NOAA radar";
      }
    });

    smoothLayer.addTo(map);
    if (radarLayer && radarLayer !== noaaRadarLayer) map.removeLayer(radarLayer);
    if (map.hasLayer(noaaRadarLayer)) map.removeLayer(noaaRadarLayer);
    radarLayer = smoothLayer;

    const radarTime = new Date(latest.time * 1000).toLocaleTimeString("en-US", {
      timeZone: "America/Chicago",
      hour: "numeric",
      minute: "2-digit"
    });
    $("radarStatus").textContent = `Radar ${radarTime}`;
  } catch (error) {
    if (!map.hasLayer(noaaRadarLayer)) noaaRadarLayer.addTo(map);
    radarLayer = noaaRadarLayer;
    radarLayer.setOpacity(Number($("radarOpacity").value) / 100);
    radarLayer.setParams({ _: Date.now() });
    $("radarStatus").textContent = "NOAA radar";
  }
}

function refreshRadar() {
  loadSmoothRadar();
}

$("refreshRadar").addEventListener("click", refreshRadar);
$("refreshWeather").addEventListener("click", () => {
  loadWeather();
  loadAlerts();
});
$("radarOpacity").addEventListener("input", (event) => {
  radarLayer.setOpacity(Number(event.target.value) / 100);
});

updateClock();
loadSmoothRadar();
loadWeather();
loadAlerts();
setInterval(updateClock, 1000);
setInterval(loadWeather, 60000);
setInterval(loadAlerts, 60000);
setInterval(loadSmoothRadar, 60000);
