mapboxgl.accessToken =
  "pk.eyJ1Ijoia3RpdHplciIsImEiOiJja3p5MWl4cTgwMWRqMm5wY3d5YWRreXB1In0.8YKr-h7pmDokMoPaIqbBLA";


const map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/ktitzer/cl0836o55000016mqev510rso" // style URL
});



map.on("load", () => {
  const layers = ["<10", "20", "30", "40", "50", "60", "70", "80", "90", "100"];
  const colors = [
    "#67001f",
    "#b2182b",
    "#d6604d",
    "#f4a582",
    "#fddbc7",
    "#d1e5f0",
    "#92c5de",
    "#4393c3",
    "#2166ac",
    "#053061"
  ];

  // create legend
  const legend = document.getElementById("legend");

  layers.forEach((layer, i) => {
 const color = colors[i];
const key = document.createElement("div");
if (i <= 1 || i >= 8) {
 key.style.color = "white";
 }
 key.className = "legend-key";
 key.style.backgroundColor = color;
 key.innerHTML = `${layer}`;
 legend.appendChild(key);
 });
map.addSource("hover", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] }
  });

  map.addLayer({
    id: "dz-hover",
    type: "line",
    source: "hover",
    layout: {},
    paint: {
      "line-color": "yellow",
      "line-width": 2
    }
  });

  
  
  map.on("mousemove", (event) => {
    const dzone = map.queryRenderedFeatures(event.point, {
      layers: ["glasgow-simd"]
    });
    document.getElementById("pd").innerHTML = dzone.length
      ? `<h3>${dzone[0].properties.DZName}</h3><p>Rank: <strong><em>${dzone[0].properties.Percentv2}</strong> %</em></p>`
      : `<p>Hover over a data zone!</p>`;
    map.getSource("hover").setData({
 type: "FeatureCollection",
 features: dzone.map(function (f) {
 return { type: "Feature", geometry: f.geometry };
 })
 });
  });

  map.getCanvas().style.cursor = "default";

  map.fitBounds([
    [-4.359643, 55.932458],
    [-4.173001, 55.776259]
  ]);
  
});



map.addControl(new mapboxgl.NavigationControl(), "top-left");

map.addControl(
 new mapboxgl.GeolocateControl({
 positionOptions: {
 enableHighAccuracy: true
 },
 trackUserLocation: true,
 showUserHeading: true
 }),
 "top-left"
);