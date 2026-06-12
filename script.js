const DANE_CENTER = [43.0731, -89.4012];
const DANE_BOUNDS = [[42.78, -89.86], [43.35, -88.92]];
const REGIONAL_BOUNDS = [[40.9, -92.9], [47.35, -86.15]];
const USER_AGENT_NOTE = "Dane County Live Weather demo";
const SITE_PASSWORD = "1234";
const COUNTY_CODES = ["025", "111", "021", "027", "055", "045", "105", "049", "065"];
const COUNTY_QUERY = COUNTY_CODES.map((code) => `'${code}'`).join(",");
const TIGER_COUNTIES = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query";
const TIGER_PLACES = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer";
const REGIONAL_WHERE = `STATE='55' AND COUNTY IN (${COUNTY_QUERY})`;
const EXTENDED_COUNTIES = {
  "55": ["Adams", "Brown", "Buffalo", "Calumet", "Chippewa", "Clark", "Crawford", "Dunn", "Eau Claire", "Fond du Lac", "Grant", "Green Lake", "Jackson", "Juneau", "Kenosha", "Kewaunee", "La Crosse", "Manitowoc", "Marathon", "Marquette", "Milwaukee", "Monroe", "Outagamie", "Ozaukee", "Pepin", "Pierce", "Portage", "Racine", "Richland", "Sheboygan", "St. Croix", "Trempealeau", "Vernon", "Walworth", "Washington", "Waukesha", "Waushara", "Winnebago", "Wood"],
  "17": ["Boone", "Carroll", "Cook", "DeKalb", "DuPage", "Jo Daviess", "Kane", "Kendall", "Lake", "Lee", "McHenry", "Ogle", "Stephenson", "Whiteside", "Winnebago"],
  "19": ["Allamakee", "Benton", "Black Hawk", "Bremer", "Buchanan", "Butler", "Cedar", "Chickasaw", "Clayton", "Clinton", "Delaware", "Dubuque", "Fayette", "Howard", "Jackson", "Jones", "Linn", "Mitchell", "Scott", "Winneshiek"],
  "27": ["Fillmore", "Goodhue", "Houston", "Mower", "Olmsted", "Wabasha", "Winona"],
  "26": ["Dickinson", "Gogebic", "Iron", "Menominee"]
};
const EXTENDED_WHERE_PARTS = Object.entries(EXTENDED_COUNTIES).map(([state, names]) => {
  const quoted = names.map((name) => `'${name.replace("'", "''")}'`).join(",");
  const countyNames = names.map((name) => `'${name.replace("'", "''")} County'`).join(",");
  return `(STATE='${state}' AND (BASENAME IN (${quoted}) OR NAME IN (${quoted}) OR NAME IN (${countyNames})))`;
});
const EXTENDED_WHERE = EXTENDED_WHERE_PARTS.join(" OR ");
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
const FELLOW_PLACES = [
  ["Baraboo", 43.4711, -89.7443, "city"], ["Reedsburg", 43.5325, -90.0026, "city"], ["Sauk City", 43.2708, -89.7246, "village"], ["Prairie du Sac", 43.2869, -89.7248, "village"], ["Lake Delton", 43.6011, -89.7932, "village"], ["Wisconsin Dells", 43.6275, -89.7709, "city"], ["Spring Green", 43.1753, -90.0679, "village"], ["Plain", 43.2775, -90.0443, "village"], ["Merrimac", 43.3736, -89.6265, "village"], ["Loganville", 43.4369, -90.0385, "village"], ["La Valle", 43.5833, -90.1307, "village"], ["Lime Ridge", 43.4661, -90.1532, "village"], ["North Freedom", 43.4597, -89.8685, "village"], ["Rock Springs", 43.4783, -89.9182, "village"], ["West Baraboo", 43.4744, -89.7701, "village"],
  ["Portage", 43.5391, -89.4626, "city"], ["Columbus", 43.3380, -89.0154, "city"], ["Lodi", 43.3139, -89.5265, "city"], ["Poynette", 43.3900, -89.4021, "village"], ["Rio", 43.4478, -89.2398, "village"], ["Cambria", 43.5422, -89.1090, "village"], ["Fall River", 43.3842, -89.0451, "village"], ["Friesland", 43.5886, -89.0690, "village"], ["Arlington", 43.3386, -89.3804, "village"], ["Wyocena", 43.4911, -89.3098, "village"], ["Pardeeville", 43.5378, -89.3001, "village"], ["Randolph", 43.5392, -89.0068, "village"],
  ["Beaver Dam", 43.4578, -88.8373, "city"], ["Juneau", 43.4056, -88.7051, "city"], ["Watertown", 43.1947, -88.7289, "city"], ["Mayville", 43.4942, -88.5448, "city"], ["Horicon", 43.4514, -88.6312, "city"], ["Waupun", 43.6333, -88.7296, "city"], ["Fox Lake", 43.5650, -88.9065, "city"], ["Columbus", 43.3380, -89.0154, "city"], ["Lomira", 43.5914, -88.4437, "village"], ["Reeseville", 43.3058, -88.8446, "village"], ["Lowell", 43.3372, -88.8196, "village"], ["Clyman", 43.3117, -88.7248, "village"], ["Hustisford", 43.3461, -88.6001, "village"], ["Iron Ridge", 43.3997, -88.5326, "village"], ["Theresa", 43.5178, -88.4512, "village"], ["Brownsville", 43.6164, -88.4907, "village"],
  ["Jefferson", 43.0056, -88.8073, "city"], ["Fort Atkinson", 42.9289, -88.8371, "city"], ["Watertown", 43.1947, -88.7289, "city"], ["Lake Mills", 43.0814, -88.9118, "city"], ["Waterloo", 43.1839, -88.9884, "city"], ["Cambridge", 43.0036, -89.0168, "village"], ["Johnson Creek", 43.0761, -88.7748, "village"], ["Palmyra", 42.8778, -88.5862, "village"], ["Sullivan", 43.0142, -88.5893, "village"], ["Helenville", 43.0119, -88.7018, "village"], ["Ixonia", 43.1439, -88.5973, "town"], ["Rome", 42.9795, -88.6320, "town"],
  ["Monroe", 42.6011, -89.6385, "city"], ["Brodhead", 42.6183, -89.3762, "city"], ["New Glarus", 42.8145, -89.6351, "village"], ["Belleville", 42.8597, -89.5385, "village"], ["Albany", 42.7075, -89.4379, "village"], ["Monticello", 42.7453, -89.5948, "village"], ["Brooklyn", 42.8536, -89.3704, "village"], ["Browntown", 42.5781, -89.7907, "village"], ["Juda", 42.5911, -89.5018, "community"], ["Clarno", 42.5565, -89.7054, "town"], ["Decatur", 42.6400, -89.3857, "town"], ["Exeter", 42.8472, -89.5179, "town"], ["Sylvester", 42.6097, -89.6179, "town"], ["York", 42.8814, -89.6618, "town"],
  ["Janesville", 42.6828, -89.0187, "city"], ["Beloit", 42.5083, -89.0318, "city"], ["Milton", 42.7756, -88.9440, "city"], ["Evansville", 42.7803, -89.2993, "city"], ["Edgerton", 42.8353, -89.0676, "city"], ["Clinton", 42.5578, -88.8651, "village"], ["Orfordville", 42.6278, -89.2535, "village"], ["Footville", 42.6706, -89.2076, "village"], ["Magnolia", 42.7467, -89.2521, "town"], ["Turtle", 42.5911, -88.9990, "town"], ["Harmony", 42.7472, -88.8432, "town"], ["Fulton", 42.8122, -89.0690, "town"], ["Porter", 42.8500, -89.2429, "town"],
  ["Dodgeville", 42.9603, -90.1301, "city"], ["Mineral Point", 42.8600, -90.1798, "city"], ["Barneveld", 43.0150, -89.8951, "village"], ["Arena", 43.1656, -89.9093, "village"], ["Avoca", 43.1842, -90.3226, "village"], ["Cobb", 42.9686, -90.3298, "village"], ["Highland", 43.0464, -90.3798, "village"], ["Hollandale", 42.8764, -89.9365, "village"], ["Linden", 42.9164, -90.2737, "village"], ["Livingston", 42.9025, -90.4310, "village"], ["Rewey", 42.8447, -90.3968, "village"], ["Ridgeway", 43.0025, -89.9907, "village"], ["Waldwick", 42.8614, -90.0387, "town"],
  ["Darlington", 42.6831, -90.1176, "city"], ["Shullsburg", 42.5736, -90.2301, "city"], ["Benton", 42.5694, -90.3848, "village"], ["Belmont", 42.7361, -90.3348, "village"], ["Blanchardville", 42.8100, -89.8610, "village"], ["Argyle", 42.7014, -89.8698, "village"], ["South Wayne", 42.5678, -89.8762, "village"], ["Gratiot", 42.5778, -90.0232, "village"], ["Hazel Green", 42.5325, -90.4348, "village"], ["Cuba City", 42.6053, -90.4298, "city"], ["Wiota", 42.5781, -89.9468, "town"], ["Fayette", 42.8164, -90.2007, "town"], ["Kendall", 42.6578, -90.2976, "town"], ["New Diggings", 42.5386, -90.3926, "town"]
];
const EXTENDED_MAJOR_CITIES = [
  ["Green Bay", 44.5133, -88.0133], ["Appleton", 44.2619, -88.4154], ["Oshkosh", 44.0247, -88.5426], ["Fond du Lac", 43.7730, -88.4471], ["Milwaukee", 43.0389, -87.9065], ["Waukesha", 43.0117, -88.2315], ["Racine", 42.7261, -87.7829], ["Kenosha", 42.5847, -87.8212], ["Sheboygan", 43.7508, -87.7145], ["Manitowoc", 44.0886, -87.6576], ["La Crosse", 43.8138, -91.2519], ["Eau Claire", 44.8113, -91.4985], ["Chippewa Falls", 44.9369, -91.3929], ["Wausau", 44.9591, -89.6301], ["Stevens Point", 44.5236, -89.5746], ["Marshfield", 44.6689, -90.1718], ["Wisconsin Rapids", 44.3836, -89.8173], ["Menomonie", 44.8755, -91.9193], ["Hudson", 44.9747, -92.7569], ["River Falls", 44.8614, -92.6238], ["West Bend", 43.4253, -88.1834], ["Port Washington", 43.3872, -87.8756], ["Elkhorn", 42.6728, -88.5445], ["Lake Geneva", 42.5917, -88.4334], ["Richland Center", 43.3347, -90.3868], ["Prairie du Chien", 43.0517, -91.1412], ["Platteville", 42.7342, -90.4785], ["Lancaster", 42.8475, -90.7107], ["Berlin", 43.9680, -88.9434], ["Wautoma", 44.0747, -89.2879], ["Tomah", 43.9786, -90.5040], ["Sparta", 43.9441, -90.8129], ["Black River Falls", 44.2947, -90.8515], ["Neillsville", 44.5599, -90.5962], ["Durand", 44.6264, -91.9657], ["Arcadia", 44.2527, -91.5015], ["Viroqua", 43.5569, -90.8887], ["Kewaunee", 44.4583, -87.5031],
  ["Chicago", 41.8781, -87.6298], ["Evanston", 42.0451, -87.6877], ["Waukegan", 42.3636, -87.8448], ["Elgin", 42.0354, -88.2826], ["Aurora", 41.7606, -88.3201], ["Naperville", 41.7508, -88.1535], ["Joliet", 41.5250, -88.0817], ["DeKalb", 41.9295, -88.7504], ["Sycamore", 41.9889, -88.6868], ["Rockford", 42.2711, -89.0940], ["Freeport", 42.2967, -89.6212], ["Belvidere", 42.2639, -88.8443], ["Dixon", 41.8389, -89.4795], ["Sterling", 41.7886, -89.6962], ["Morrison", 41.8098, -89.9651], ["Oregon", 42.0148, -89.3323], ["Galena", 42.4167, -90.4290], ["Woodstock", 42.3147, -88.4487], ["Crystal Lake", 42.2411, -88.3162],
  ["Cedar Rapids", 41.9779, -91.6656], ["Davenport", 41.5236, -90.5776], ["Bettendorf", 41.5250, -90.5151], ["Waterloo", 42.4928, -92.3426], ["Cedar Falls", 42.5349, -92.4453], ["Dubuque", 42.5006, -90.6646], ["Clinton", 41.8445, -90.1887], ["Maquoketa", 42.0689, -90.6657], ["Decorah", 43.3033, -91.7857], ["Waverly", 42.7258, -92.4755], ["Independence", 42.4686, -91.8893], ["Manchester", 42.4842, -91.4554], ["Anamosa", 42.1083, -91.2852], ["Vinton", 42.1686, -92.0235], ["New Hampton", 43.0591, -92.3174], ["Charles City", 43.0664, -92.6724], ["Osage", 43.2841, -92.8110], ["Waukon", 43.2694, -91.4757], ["Elkader", 42.8539, -91.4054], ["Tipton", 41.7697, -91.1279],
  ["Rochester", 44.0121, -92.4802], ["Winona", 44.0554, -91.6664], ["Red Wing", 44.5625, -92.5338], ["Austin", 43.6666, -92.9746], ["Albert Lea", 43.6480, -93.3683], ["Owatonna", 44.0839, -93.2260], ["Faribault", 44.2949, -93.2688], ["Wabasha", 44.3839, -92.0329], ["Caledonia", 43.6347, -91.4968], ["Preston", 43.6702, -92.0832],
  ["Iron Mountain", 45.8202, -88.0659], ["Kingsford", 45.7949, -88.0721], ["Menominee", 45.1078, -87.6143], ["Ironwood", 46.4547, -90.1710], ["Bessemer", 46.4813, -90.0529], ["Iron River", 46.0927, -88.6424], ["Crystal Falls", 46.0980, -88.3340]
];
const MAJOR_CITY_LOW_ZOOM = new Set([
  "Chicago", "Milwaukee", "Madison", "Green Bay", "Cedar Rapids", "Rochester", "Davenport", "Rockford", "Waukesha", "Eau Claire", "La Crosse", "Oshkosh", "Appleton", "Joliet", "Naperville", "Aurora", "Kenosha", "Racine", "Waukegan", "Waterloo"
]);
const MAJOR_CITY_MID_ZOOM = new Set([
  "Fond du Lac", "Sheboygan", "Manitowoc", "Wausau", "Stevens Point", "Wisconsin Rapids", "Marshfield", "Chippewa Falls", "Menomonie", "Hudson", "West Bend", "Port Washington", "Elkhorn", "Lake Geneva", "Prairie du Chien", "Platteville", "Tomah", "Sparta", "Viroqua", "Evanston", "Elgin", "DeKalb", "Sycamore", "Freeport", "Belvidere", "Dixon", "Sterling", "Galena", "Woodstock", "Crystal Lake", "Bettendorf", "Cedar Falls", "Dubuque", "Clinton", "Decorah", "Waverly", "Charles City", "Winona", "Red Wing", "Austin", "Albert Lea", "Owatonna", "Faribault", "Iron Mountain", "Menominee", "Ironwood"
]);
const EXTENDED_COUNTY_LABELS = [
  ["Adams", 43.97, -89.77], ["Brown", 44.48, -87.99], ["Buffalo", 44.39, -91.75], ["Calumet", 44.08, -88.21], ["Chippewa", 45.07, -91.28], ["Clark", 44.73, -90.61], ["Crawford", 43.25, -90.93], ["Dunn", 44.95, -91.90], ["Eau Claire", 44.73, -91.29], ["Fond du Lac", 43.75, -88.49], ["Grant", 42.87, -90.70], ["Green Lake", 43.80, -89.04], ["Jackson", 44.32, -90.81], ["Juneau", 43.93, -90.11], ["Kenosha", 42.58, -88.05], ["Kewaunee", 44.48, -87.49], ["La Crosse", 43.90, -91.11], ["Manitowoc", 44.09, -87.74], ["Marathon", 44.90, -89.76], ["Marquette", 43.82, -89.40], ["Milwaukee", 43.02, -87.97], ["Monroe", 43.95, -90.62], ["Outagamie", 44.42, -88.46], ["Ozaukee", 43.39, -87.89], ["Pepin", 44.58, -92.00], ["Pierce", 44.72, -92.43], ["Portage", 44.47, -89.50], ["Racine", 42.75, -88.05], ["Richland", 43.38, -90.43], ["Sheboygan", 43.75, -87.97], ["St. Croix", 45.03, -92.45], ["Trempealeau", 44.30, -91.36], ["Vernon", 43.60, -90.83], ["Walworth", 42.67, -88.54], ["Washington", 43.37, -88.23], ["Waukesha", 43.02, -88.31], ["Waushara", 44.11, -89.24], ["Winnebago", 44.09, -88.66], ["Wood", 44.46, -90.04],
  ["Boone", 42.32, -88.82], ["Carroll", 42.07, -89.92], ["Cook", 41.84, -87.82], ["DeKalb", 41.89, -88.77], ["DuPage", 41.85, -88.09], ["Jo Daviess", 42.36, -90.21], ["Kane", 41.94, -88.43], ["Kendall", 41.59, -88.43], ["Lake", 42.32, -87.99], ["Lee", 41.75, -89.30], ["McHenry", 42.32, -88.45], ["Ogle", 42.04, -89.32], ["Stephenson", 42.35, -89.66], ["Whiteside", 41.76, -89.91], ["Winnebago", 42.34, -89.16],
  ["Allamakee", 43.28, -91.38], ["Benton", 42.09, -92.07], ["Black Hawk", 42.47, -92.31], ["Bremer", 42.77, -92.32], ["Buchanan", 42.47, -91.84], ["Butler", 42.73, -92.79], ["Cedar", 41.77, -91.13], ["Chickasaw", 43.06, -92.32], ["Clayton", 42.84, -91.34], ["Clinton", 41.89, -90.53], ["Delaware", 42.47, -91.36], ["Dubuque", 42.47, -90.88], ["Fayette", 42.86, -91.84], ["Howard", 43.36, -92.32], ["Jackson", 42.17, -90.57], ["Jones", 42.12, -91.13], ["Linn", 42.08, -91.60], ["Mitchell", 43.35, -92.79], ["Scott", 41.64, -90.62], ["Winneshiek", 43.29, -91.84],
  ["Fillmore", 43.67, -92.09], ["Goodhue", 44.41, -92.72], ["Houston", 43.67, -91.49], ["Mower", 43.67, -92.75], ["Olmsted", 44.01, -92.40], ["Wabasha", 44.28, -92.23], ["Winona", 44.00, -91.77],
  ["Dickinson", 45.99, -87.87], ["Gogebic", 46.45, -89.72], ["Iron", 46.25, -88.58], ["Menominee", 45.53, -87.56]
];
const COUNTY_LABEL_OFFSETS = {
  "Calumet": [0.05, 0.02],
  "Fond du Lac": [-0.05, -0.02],
  "Milwaukee": [0.03, 0.03],
  "Ozaukee": [0.08, 0.02],
  "Racine": [-0.03, 0.02],
  "Kenosha": [-0.08, 0.01],
  "La Crosse": [0.04, -0.04],
  "Vernon": [-0.04, 0.03],
  "Pierce": [0.03, -0.05],
  "St. Croix": [0.05, 0.05],
  "Pepin": [-0.04, 0.03],
  "Wabasha": [0.05, -0.03],
  "Winona": [-0.05, 0.04],
  "Fillmore": [-0.04, -0.03],
  "Houston": [0.04, 0.02],
  "Cook": [-0.04, 0.05],
  "DuPage": [0.04, -0.03],
  "Kane": [0.04, 0.03],
  "Kendall": [-0.04, -0.03],
  "Lake": [0.04, 0.04],
  "McHenry": [-0.04, 0.02],
  "Boone": [0.04, -0.04],
  "Winnebago": [-0.04, 0.04],
  "Jo Daviess": [0.04, 0.04],
  "Stephenson": [-0.04, -0.03],
  "Allamakee": [0.04, 0.03],
  "Winneshiek": [-0.04, 0.03],
  "Clayton": [0.04, -0.03],
  "Dubuque": [-0.04, -0.04],
  "Jackson": [0.04, 0.04],
  "Clinton": [-0.04, 0.02],
  "Scott": [0.04, -0.03],
  "Benton": [-0.04, 0.04],
  "Linn": [0.04, 0.03],
  "Dickinson": [0.04, 0.04],
  "Iron": [-0.04, -0.03],
  "Menominee": [0.04, -0.03]
};

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
let daneOnlyLayers = [];
let fellowCountyLayers = [];
let extendedCountyLayers = [];
let daneCityVillageLabelLayer = L.layerGroup().addTo(map);
let daneTownshipLabelLayer = L.layerGroup().addTo(map);
let regionalLabelLayer = L.layerGroup().addTo(map);
let extendedCountyLabelLayer = L.layerGroup().addTo(map);
const DANE_TOWNSHIP_LABEL_MIN_ZOOM = 9;
const REGIONAL_LABEL_MIN_ZOOM = 10;
const DANE_CITY_LABEL_MIN_ZOOM = 9;
const EXTENDED_COUNTY_LABEL_MIN_ZOOM = 7;

function $(id) {
  return document.getElementById(id);
}

function unlockSite() {
  document.body.classList.add("unlocked");
}

function setupPasswordGate() {
  const form = $("passwordForm");
  const input = $("passwordInput");
  const error = $("passwordError");

  input.focus();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (input.value === SITE_PASSWORD) {
      error.textContent = "";
      unlockSite();
    } else {
      error.textContent = "Incorrect password.";
      input.value = "";
      input.focus();
    }
  });
}

function addFallbackDaneLabels() {
  daneCityVillageLabelLayer.clearLayers();
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
    }).addTo(daneCityVillageLabelLayer);
  });
}

function addManualRegionalLabels() {
  FELLOW_PLACES.forEach(([name, lat, lng, type]) => {
    if (name === "Shorewood Hills") return;
    const icon = L.divIcon({
      className: `place-label ${type}`,
      html: `<span>${name}</span>`,
      iconSize: [130, 22],
      iconAnchor: [65, 11]
    });
    L.marker([lat, lng], {
      icon,
      interactive: false,
      zIndexOffset: 900
    }).addTo(regionalLabelLayer);
  });
}

function addExtendedCountyLabels(counties) {
  extendedCountyLabelLayer.clearLayers();
  const seen = new Set();
  function addCountyLabel(name, latLng) {
    if (!name || seen.has(`${name}:${latLng.lat.toFixed(2)}:${latLng.lng.toFixed(2)}`)) return;
    seen.add(`${name}:${latLng.lat.toFixed(2)}:${latLng.lng.toFixed(2)}`);
    const offset = COUNTY_LABEL_OFFSETS[name] || [0, 0];
    const adjustedLatLng = L.latLng(latLng.lat + offset[0], latLng.lng + offset[1]);
    const icon = L.divIcon({
      className: "county-label extended-county-label",
      html: `<span>${name}</span>`,
      iconSize: [50, 22],
      iconAnchor: [25, 11]
    });
    L.marker(adjustedLatLng, {
      icon,
      interactive: false,
      zIndexOffset: 760
    }).addTo(extendedCountyLabelLayer);
  }
  counties.features?.forEach((feature) => {
    const name = feature.properties?.BASENAME || feature.properties?.NAME;
    const bounds = L.geoJSON(feature).getBounds();
    if (bounds.isValid()) addCountyLabel(name, bounds.getCenter());
  });
  EXTENDED_COUNTY_LABELS.forEach(([name, lat, lng]) => {
    addCountyLabel(name, L.latLng(lat, lng));
  });
}

function syncLabelToggles() {
  const zoom = map.getZoom();
  const showDaneCities = $("toggleDaneCityLabels").checked && zoom >= DANE_CITY_LABEL_MIN_ZOOM;
  const showDaneTownships = $("toggleDaneLabels").checked && zoom >= DANE_TOWNSHIP_LABEL_MIN_ZOOM;
  const showRegionalLabels = $("toggleRegionalLabels").checked && zoom >= REGIONAL_LABEL_MIN_ZOOM;
  const showExtendedCounties = zoom >= EXTENDED_COUNTY_LABEL_MIN_ZOOM;

  if (showDaneCities) {
    daneCityVillageLabelLayer.addTo(map);
  } else {
    map.removeLayer(daneCityVillageLabelLayer);
  }

  if (showDaneTownships) {
    daneTownshipLabelLayer.addTo(map);
  } else {
    map.removeLayer(daneTownshipLabelLayer);
  }

  if (showRegionalLabels) {
    regionalLabelLayer.addTo(map);
  } else {
    map.removeLayer(regionalLabelLayer);
  }

  if (showExtendedCounties) {
    extendedCountyLabelLayer.addTo(map);
  } else {
    map.removeLayer(extendedCountyLabelLayer);
  }
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
  $("clock").textContent = now.toLocaleTimeString("en-US", {
    timeZone: "America/Chicago",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
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

function isFellowFeature(feature) {
  return feature.properties?.STATE === "55" && feature.properties?.COUNTY !== "025";
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

  const targetLayer = isDaneFeature(feature)
    ? (type === "town" ? daneTownshipLabelLayer : null)
    : regionalLabelLayer;
  if (!targetLayer) return;

  L.marker(bounds.getCenter(), {
    icon,
    interactive: false,
    zIndexOffset: 900
  }).addTo(targetLayer);
}

async function loadRegionalBoundaries() {
  try {
    const [counties, towns, places, extendedCounties] = await Promise.all([
      fetchJson(tigerQueryUrl(TIGER_COUNTIES, null, REGIONAL_WHERE)),
      fetchJson(tigerQueryUrl(TIGER_PLACES, 1, REGIONAL_WHERE)),
      fetchJson(tigerQueryUrl(TIGER_PLACES, 4, REGIONAL_WHERE)),
      fetchJson(tigerQueryUrl(TIGER_COUNTIES, null, EXTENDED_WHERE))
    ]);
    daneBoundaryLayers.forEach((layer) => map.removeLayer(layer));
    daneOnlyLayers.forEach((layer) => map.removeLayer(layer));
    fellowCountyLayers.forEach((layer) => map.removeLayer(layer));
    extendedCountyLayers.forEach((layer) => map.removeLayer(layer));
    daneCityVillageLabelLayer.clearLayers();
    daneTownshipLabelLayer.clearLayers();
    regionalLabelLayer.clearLayers();
    extendedCountyLabelLayer.clearLayers();
    addFallbackDaneLabels();
    addExtendedCountyLabels(extendedCounties);

    const extendedCountyBorders = L.geoJSON(extendedCounties, {
      pane: "boundaryPane",
      style: {
        color: "#111111",
        weight: 1.4,
        opacity: 0.95,
        fill: false
      },
      onEachFeature: labelLayer
    }).addTo(map);

    const fellowCountyHalo = L.geoJSON(counties, {
      filter: isFellowFeature,
      pane: "boundaryPane",
      style: {
        color: "#ffffff",
        weight: 6,
        opacity: 0.88,
        fill: false
      },
      onEachFeature: labelLayer
    }).addTo(map);

    const daneHalo = L.geoJSON(counties, {
      filter: isDaneFeature,
      pane: "boundaryPane",
      style: {
        color: "#ffffff",
        weight: 8,
        opacity: 0.92,
        fill: false
      },
      onEachFeature: labelLayer
    }).addTo(map);

    const fellowTownOutlines = L.geoJSON(towns, {
      filter: isFellowFeature,
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

    const daneTownOutlines = L.geoJSON(towns, {
      filter: isDaneFeature,
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

    const fellowPlaceOutlines = L.geoJSON(places, {
      filter: isFellowFeature,
      pane: "boundaryPane",
      style: {
        color: "#2563eb",
        weight: 1.8,
        opacity: 0.78,
        fill: false
      },
      onEachFeature: labelLayer
    }).addTo(map);

    const danePlaceOutlines = L.geoJSON(places, {
      filter: isDaneFeature,
      pane: "boundaryPane",
      style: {
        color: "#2563eb",
        weight: 1.8,
        opacity: 0.78,
        fill: false
      },
      onEachFeature: labelLayer
    }).addTo(map);

    const fellowCountyOutline = L.geoJSON(counties, {
      filter: isFellowFeature,
      pane: "boundaryPane",
      style: {
        color: "#d93025",
        weight: 3.5,
        opacity: 1,
        fill: false
      }
    }).addTo(map);

    const daneCountyOutline = L.geoJSON(counties, {
      filter: isDaneFeature,
      pane: "boundaryPane",
      style: {
        color: "#111111",
        weight: 3.6,
        opacity: 1,
        fill: false
      }
    }).addTo(map);

    fellowCountyOutline.bindTooltip("Focused county", { permanent: false });
    daneCountyOutline.bindTooltip("Dane County", { permanent: false });
    daneOnlyLayers = [daneHalo, daneTownOutlines, danePlaceOutlines, daneCountyOutline];
    fellowCountyLayers = [fellowCountyHalo, fellowTownOutlines, fellowPlaceOutlines, fellowCountyOutline];
    extendedCountyLayers = [extendedCountyBorders];
    daneBoundaryLayers = [...daneOnlyLayers, ...fellowCountyLayers];

    const seenLabels = new Set();
    towns.features?.forEach((feature) => addFeatureLabel(feature, "town", seenLabels));
    places.features?.forEach((feature) => addFeatureLabel(feature, "village", seenLabels));
    addManualRegionalLabels();
    syncLabelToggles();

    map.fitBounds(daneCountyOutline.getBounds(), { padding: [24, 24] });
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

    $("temperature").textContent = fmt(tempF, " F");
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
$("toggleDaneCityLabels").addEventListener("change", (event) => {
  syncLabelToggles();
});
$("toggleDaneLabels").addEventListener("change", (event) => {
  syncLabelToggles();
});
$("toggleRegionalLabels").addEventListener("change", (event) => {
  syncLabelToggles();
});
$("featureSelect").addEventListener("change", (event) => {
  setFeatureMode(event.target.value);
});
map.on("zoomend", syncLabelToggles);

setupPasswordGate();
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
