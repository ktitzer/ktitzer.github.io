mapboxgl.accessToken = 'pk.eyJ1Ijoia3RpdHplciIsImEiOiJja3p5MWl4cTgwMWRqMm5wY3d5YWRreXB1In0.8YKr-h7pmDokMoPaIqbBLA';

// set map bounds
const bounds = [
[-4.8500, 55.6500], // Southwest coordinates
[-3.7000, 56.0500] // Northeast coordinates
];

const map = new mapboxgl.Map({
  container: 'map', // container element id
  style: 'mapbox://styles/ktitzer/cl6jae2cl003115lju7hzf27t',
  center: [-4.2750, 55.8500], // initial map center in [lon, lat]
  zoom: 11,
  maxBounds: bounds,
  attributionControl: false, // So that attribution can be modified to include copyright for the new layers added
    });

// Add custom copyright information to the default copyright info
map.addControl(new mapboxgl.AttributionControl({
  customAttribution: 'Contains data Licensed by Strava. Strava Inc. Economic and Social Research Council. Strava Metro data - Glasgow 2013 - 2020 [data collection]. <a href="http://ubdc.gla.ac.uk/dataset/strava-metro-data">University of Glasgow - Urban Big Data Centre.</a> Contains data © Glasgow City Council.',
  compact: true // Make copyright info only visible on click because it would otherwise cover the mapbox logo due to its length
}));


// Add a scale bar
const scale = new mapboxgl.ScaleControl({
  maxWidth: 80, //size of the scale bar
  unit: "metric",
});

map.addControl(scale, "top-right");


map.addControl(new mapboxgl.NavigationControl(), "top-right");


map.on('load', () => {

  map.setPaintProperty('infra-counts-comparisons_buf', 'line-opacity', 0);
  
  // make a pointer cursor
  map.getCanvas().style.cursor = "default";


   
        // change info window on hover
map.on("mousemove", (event) => {
  const itype = map.queryRenderedFeatures(event.point, {
    layers: ["infra-counts-comparisons_buf"]
  });
map.setPaintProperty(itype[0], 'line-opacity', 1);
  document.getElementById("box").innerHTML = itype.length
    ? `<h3>${itype[0].properties.infra}</h3>
    <p>Percent of Strava trips in 2013 taken on this infrastructure type:  <strong>${itype[0].properties.perc_jm13}</strong></p>
    <p>Percent of Strava trips in 2019 taken on this infrastructure type:  <strong>${itype[0].properties.perc_jm19}</strong></p>`
    : `<p>Hover over infrastructure to see its type and how ridership has changed!</p>`;

  
  


});




  
  
  
//attempting again
  // Create popup
        const popup = new mapboxgl.Popup({className: "my-popup", closeButton: false, offset: [0, -5] })
        

        // Events to occur when mouse moves over infrastructure
  map.on('mousemove', (event) => {
          const features = map.queryRenderedFeatures(event.point, {
            layers: ['infra-counts-comparisons_buf']
          });
    
          if (!features.length) {
            popup.remove();
            return;
          }

          const feature = features[0];
    //map.setPaintProperty(feature, 'line-width', 3);
    map.setPaintProperty(feature, 'line-opacity', 1);
    map.setLayoutProperty(feature,'visibility','visible');
          popup
            .setLngLat((event.lngLat))
            .setHTML(feature.properties.infra)
            .addTo(map);
 
   
    // Change to pointer cursor when over clickable feature
   // map.getCanvas().style.cursor = 'pointer';



  map.on('mousemove', function(e) {
  var features = map.queryRenderedFeatures(e.point, {
    layers: ['infra-counts-comparisons'],
    paint: {
      "line-color": "black",
      "line-width": 4
    }
  });
    
 
  });
// new attempt here
  /*
map.on('mousemove', function(e) {
  var features = map.queryRenderedFeatures(e.point, {
    layers: ['infra-counts-comparisons']
  });

  if (!features.length) {
    return;
  }

  var feature = features[0];

  
  var popup = new mapboxgl.Popup({ offset: [0, -15] })
    .setLngLat(e.lngLat)
    .setHTML('<h3>' + feature.properties.agg + '</h3><p>' + feature.properties.infra + '</p>')
       .addTo(map);
  
});

   */
  //end of new attempt
  
 }); 
});
/*
const popup = new mapboxgl.Popup({
closeButton: false,
closeOnClick: false
});
*/