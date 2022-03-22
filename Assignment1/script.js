mapboxgl.accessToken =
  "pk.eyJ1Ijoia3RpdHplciIsImEiOiJja3p5MWl4cTgwMWRqMm5wY3d5YWRreXB1In0.8YKr-h7pmDokMoPaIqbBLA";

const map = new mapboxgl.Map({
        container: 'map',
        style: "mapbox://styles/ktitzer/cl0sko1ii00kz15qgbhvjsu5h",
        center: [-4.35, 57.4],
        minZoom: 4,
        zoom: 6.6,
  attributionControl: false, // So that attribution can be modified to include copyright for new layers added
    });

// Add custom copyright information to default copyright info
map.addControl(new mapboxgl.AttributionControl({
  customAttribution: 'Contains OS data © Crown copyright [and database right] 2022. Contains data © Improvement Service and Database of British & Irish Hills.',
  compact: true // Make copyright info only visible on click because it would otherwise cover the mapbox logo due to its length
}));

// URL to station dataset
const stations_url =
  "https://api.mapbox.com/datasets/v1/ktitzer/cl0s1n86w001n27pqxu7s5v3i/features?access_token=pk.eyJ1Ijoia3RpdHplciIsImEiOiJja3p5MWl4cTgwMWRqMm5wY3d5YWRreXB1In0.8YKr-h7pmDokMoPaIqbBLA";

// URL to mountain dataset
const mountains_url = "https://api.mapbox.com/datasets/v1/ktitzer/cl0i510650b0027o26pjjtxg9/features?access_token=pk.eyJ1Ijoia3RpdHplciIsImEiOiJja3p5MWl4cTgwMWRqMm5wY3d5YWRreXB1In0.8YKr-h7pmDokMoPaIqbBLA"


// Add a scale bar
const scale = new mapboxgl.ScaleControl({
  maxWidth: 80, //size of the scale bar
  unit: "metric",
});
map.addControl(scale);

// Add the navigation control to the map to the top left corner.
map.addControl(new mapboxgl.NavigationControl(),'top-left');



map.on("load", () => {
  map.addLayer({
    id: "stations",
    type: "symbol",
    source: {
      type: "geojson",
      data: stations_url // URL to stations dataset
    },
    layout: {
      "icon-image": "national-rail", // custom UK train station icon
      "icon-size": 0.8,
      "icon-allow-overlap": true,
      "text-allow-overlap": false,
      'text-field': ['get', 'Name'],
'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
      'text-size': 10,
      'text-radial-offset': 0.7,
      'text-justify': 'auto',
    },
    paint: {}
  });

  map.addLayer({
    id: "mountains",
    type: "symbol",
    source: {
      type: "geojson",
      data: mountains_url
    },

    layout: {
      "icon-image": "mountain-green-e", // Custom mountain icon
      "icon-size": 1.0,
      "icon-allow-overlap": false
    },
    paint: {}
  });

  map.addSource("nearest-station", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: []
    }
  });


  // Create legend
  const legend = document.getElementById("legend");

 
// Create popup
        const popup = new mapboxgl.Popup({className: "my-popup", closeButton: false, offset: [0, -5] })
        

        // Events to occur when mouse moves over a mountain
  map.on('mousemove', (event) => {
          const features = map.queryRenderedFeatures(event.point, {
            layers: ['mountains']
          });
    
          if (!features.length) {
            popup.remove();
            return;
          }

          const feature = features[0];

          popup
            .setLngLat(feature.geometry.coordinates)
            .setHTML(feature.properties.Name)
            .addTo(map);

   
    // Change to pointer cursor when over clickable feature
    map.getCanvas().style.cursor = 'pointer';

     });
  
// Populate feature information box with name of mountain, nearest station, and linear distance. Fly to mountain when clicked.
    map.on("click", (event) => {
    const mountain = map.queryRenderedFeatures(event.point, {
      layers: ["mountains"]
    });
 
      
      if (!mountain.length) {
    return;
  }
  // This variable feature is the marker clicked.
  // Feature has geometry and properties.
  // Properties are the columns in the attribute table.
  const selectedmountain = mountain[0];   
      
      // Fly to the point when clicked.
  map.flyTo({
    center: selectedmountain.geometry.coordinates, // fly to coordinates of selected mountain
    zoom:8.8, //zoom to level 8.8
    
    // flyTo options from https://docs.mapbox.com/mapbox-gl-js/example/flyto-options/
    bearing: 0,
    
// These options control the flight curve, making it move
// slowly and zoom out almost completely before starting
// to pan.
speed: 0.7, // choose flight speed
curve: 1, // change the speed at which it zooms out
    
    // This can be any easing function: it takes a number between 0 and 1 and returns another number between 0 and 1.
easing: (t) => t,
 
// This animation is considered essential with respect to prefers-reduced-motion
essential: true
 });
 
  
      // Add info to overlay box
  document.getElementById("pd").innerHTML = mountain.length
      ? `<h4>Munro name: ${mountain[0].properties.Name}</h4><p>Closest station: ${mountain[0].properties.NearestStation}</p><p>Distance from station: ${mountain[0].properties.HubDist_2} km</p><p>Elevation: ${mountain[0].properties.Height_ft} feet</p>`
      
      : `<p>Click a mountain to see its details and nearest train station.</p>`;
    

// Create popup
        const popup = new mapboxgl.Popup({className: "my-popup", closeButton: false, offset: [0, -5] })
        

// Have popup stay visible when a mountain is clicked     
                popup
            .setLngLat(mountain[0].geometry.coordinates)
            .setHTML(mountain[0].properties.Name)
            .addTo(map);
    });


// When pointer leaves mountains layer, change to regular cursor for UI  
map.on('mouseleave', 'mountains', (event) => {     
  map.getCanvas().style.cursor = '';
  });

// When pointer leaves stations layer, change to regular cursor for UI       
map.on('mouseleave', 'stations', (event) => {       
  map.getCanvas().style.cursor = '';
  });
  
  
// Find closest station to each mountain using turf API  
map.on("click", (event) => {
    const mountainFeatures = map.queryRenderedFeatures(event.point, {
      layers: ["mountains"]
    });
    if (!mountainFeatures.length) {
      return;
    }

    const mountainFeature = mountainFeatures[0];

   // Get all features from the station layers
    var features = map.querySourceFeatures("stations");

    //Create the turf collection to conform with the turf format
    const stations = turf.featureCollection(features);

    const nearestStation = turf.nearest(mountainFeature, stations);

    if (nearestStation === null) return;
    map.getSource("nearest-station").setData({
      type: "FeatureCollection",
      features: [nearestStation]
    });

  if (map.getLayer("nearest-station")) {
      map.removeLayer("nearest-station");
    }  

  
  // Display circle around the nearest station
    map.addLayer(
      {
        id: "nearest-station",
        type: "circle",
        source: "nearest-station",
        paint: {
          "circle-radius": 20,
          "circle-opacity": 0.5,
          "circle-color": "#006d2c",
          "circle-stroke-color": '#ffffff',
          "circle-stroke-width": 1
        }
      },
      "stations"
    );
  });
});