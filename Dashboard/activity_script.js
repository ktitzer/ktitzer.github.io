mapboxgl.accessToken = 'pk.eyJ1Ijoia3RpdHplciIsImEiOiJja3p5MWl4cTgwMWRqMm5wY3d5YWRreXB1In0.8YKr-h7pmDokMoPaIqbBLA';

// set map bounds
const bounds = [
[-4.8500, 55.6500], // Southwest coordinates
[-3.7000, 70.0500] // Northeast coordinates
];

const map = new mapboxgl.Map({
  container: 'map', // container element id
  style: 'mapbox://styles/ktitzer/cl6m744c4000v14qrxkz8fj61',
  center: [-4.2750, 55.8500], // initial map center in [lon, lat]
  zoom: 12,
  maxBounds: bounds,
  minZoom: 12,
  attributionControl: false, // So that attribution can be modified to include copyright for the new layers added
    });

// Add custom copyright information to the default copyright info
map.addControl(new mapboxgl.AttributionControl({
  customAttribution: 'Contains data Licensed by Strava. Strava Inc. Economic and Social Research Council. Strava Metro data - Glasgow 2013 - 2020 [data collection]. <a href="http://ubdc.gla.ac.uk/dataset/strava-metro-data">University of Glasgow - Urban Big Data Centre.</a> Contains data © Glasgow City Council. Contains <a href="https://www.data.gov.uk/dataset/cb7ae6f0-4be6-4935-9277-47e5ce24a11f/road-safety-data">Department for Transport data</a>. Contains public sector information licensed under the <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/">Open Government Licence v3.0.</a>',
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

  //map.setPaintProperty('infra-counts-comparisons_buf', 'line-opacity', 0);
  
  // make a pointer cursor
  map.getCanvas().style.cursor = "default";


 // add crash data
  map.addSource('crashes', {
    'type': "geojson",
    'data': 'https://api.mapbox.com/datasets/v1/ktitzer/cl5wi2c850fr027pomphrsigf/features?access_token=pk.eyJ1Ijoia3RpdHplciIsImEiOiJja3p5MWl4cTgwMWRqMm5wY3d5YWRreXB1In0.8YKr-h7pmDokMoPaIqbBLA',// tileset ID
    cluster: true,
    clusterMaxZoom: 13, // Max zoom to cluster points on
    clusterRadius: 30
});


  
    map.addLayer({
    'id': 'collisions',
    'type': 'symbol',
    'source': 'crashes',
      'layout': {
        "icon-allow-overlap": true,
        "icon-image" : 'crash_grey_2'
      /*"icon-image": [ 'match',['get', 'accident_severity'], 
      1, 'crash_1',
      2, 'crash_2',
      3, 'crash_3',
      'circle-stroked-15' // any other type
                    ]*/
      },
  });            

map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'crashes',
            filter: ['has', 'point_count'],
            paint: {
                // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
                // with three steps to implement three types of circles
                'circle-color': [
                    'step',
                    ['get', 'point_count'],
                    'rgba(140, 140, 140, 1)',
                    5,
                    'rgba(195, 195, 195, 1)',
                    10,
                    'rgba(255, 255, 255, 1)'
                ],
              'circle-stroke-color': '#353535',
              'circle-stroke-width': 0.5,
                'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    8,
                    5,
                    11,
                    10,
                    14
                ]
            }
        });

   map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'crashes',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': '{point_count_abbreviated}',
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12,
            }
        });
  
     
  //toggle layers
  // Thanks to chrki and Nickelberry on GIS stackexchange for the following code to toggle layers (source: https://gis.stackexchange.com/questions/207758/toggling-multiple-layers-with-one-click-mapbox-gl-js)
   var toggleableLayerIds = [ 'collisions', 'clusters', 'cluster-count' ];

var link = document.createElement('a');
link.href = '#';
link.className = 'active';
link.textContent = "Show/hide crashes";
link.onclick = function (e) {
    for(var index in toggleableLayerIds) {
      var clickedLayer = toggleableLayerIds[index];
      e.preventDefault();
      e.stopPropagation();

      var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

      if (visibility === 'visible') {
          map.setLayoutProperty(clickedLayer, 'visibility', 'none');
          this.className = '';
      } else {
          this.className = 'active';
          map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
      }
    }

};
var layers = document.getElementById('menu');
layers.appendChild(link);

  
  
  
  
  
  
        // inspect a crash cluster on click
        map.on('click', 'clusters', (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['clusters']
            });
            const clusterId = features[0].properties.cluster_id;
            map.getSource('crashes').getClusterExpansionZoom(
                clusterId,
                (err, zoom) => {
                    if (err) return;

                    map.easeTo({
                        center: features[0].geometry.coordinates,
                        zoom: zoom
                    });
                }
            );
        });

        // When user clicks on a crash, show the crash date 
        const c_popup = new mapboxgl.Popup({className: "my-popup", closeButton: false, offset: [0, -5] })
        
  map.on('click', 'collisions', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const crashdate = e.features[0].properties.date;
          

            // Ensure that if the map is zoomed out such that
            // multiple copies of the feature are visible, the
            // popup appears over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            c_popup
                .setLngLat(coordinates)
                .setHTML(
                    `Crash date: ${crashdate}`
                )
                .addTo(map);
        });

        map.on('mouseenter', 'clusters', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters', () => {
            map.getCanvas().style.cursor = '';
        });

  map.on('mouseenter', 'collisions', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'collisions', () => {
            map.getCanvas().style.cursor = '';
        });

  


});




  
  
  
//attempting again
  // Create popup
        const popup = new mapboxgl.Popup({className: "my-popup", closeButton: false, offset: [0, -5] })
        
        
        
        
        //map.setFilter('infra-counts-comparisons_buf', ['==', ['get', 'size'], '2']);

        // Events to occur when mouse moves over infrastructure
  map.on('mousemove', (event) => {
          const features = map.queryRenderedFeatures(event.point, {
            layers: ['infra-counts-comparisons']
          });
    
          if (!features.length) {
            popup.remove();
            return;
          }

          const feature = features[0];
    //map.setPaintProperty(feature, 'line-width', 3);
      if (feature.properties.RouteName){    
    popup
            .setLngLat((event.lngLat))
            .setHTML(feature.properties.RouteName)
            .addTo(map);
 

  }
  });