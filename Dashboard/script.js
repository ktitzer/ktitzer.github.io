mapboxgl.accessToken = 'pk.eyJ1Ijoia3RpdHplciIsImEiOiJja3p5MWl4cTgwMWRqMm5wY3d5YWRreXB1In0.8YKr-h7pmDokMoPaIqbBLA';

// set map bounds
const bounds = [
[-4.8500, 55.6500], // Southwest coordinates
[-3.7000, 56.0500] // Northeast coordinates
];

const map = new mapboxgl.Map({
  container: 'map', // container element id
  style: 'mapbox://styles/ktitzer/cl5wbj8mf002l14lcwrfh1ony',
  center: [-4.2750, 55.8500], // initial map center in [lon, lat]
  zoom: 11,
  maxBounds: bounds,
  attributionControl: false, // So that attribution can be modified to include copyright for the new layers added
    });


setTimeout(function() {
    $('#hideDiv').fadeOut('slow');
}, 4000); // <-- time in milliseconds

// Add custom copyright information to the default copyright info
map.addControl(new mapboxgl.AttributionControl({
  customAttribution: '<a href="https://usmart.io/org/cyclingscotland/discovery/discovery-view-detail/558cb4f5-d119-4b95-9347-ee130946d86f">Next Bike Cycle Hire data</a> © Cycling Scotland 2022. Contains data © Glasgow City Council. Contains <a href="https://www.data.gov.uk/dataset/cb7ae6f0-4be6-4935-9277-47e5ce24a11f/road-safety-data">Department for Transport data</a>. Contains public sector information licensed under the <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/">Open Government Licence v3.0.</a> Bike rental years: 2018-2021, crash years: 2000-2020.',
  compact: true // Make copyright info only visible on click because it would otherwise cover the mapbox logo due to its length
}));


// Add a scale bar
const scale = new mapboxgl.ScaleControl({
  maxWidth: 80, //size of the scale bar
  unit: "metric",
});

map.addControl(scale, "top-right");


map.addControl(new mapboxgl.NavigationControl(), "top-right");

//url to crash dataset
const collisions_url = 'https://api.mapbox.com/datasets/v1/ktitzer/cl5wi2c850fr027pomphrsigf/features?access_token=pk.eyJ1Ijoia3RpdHplciIsImEiOiJja3p5MWl4cTgwMWRqMm5wY3d5YWRreXB1In0.8YKr-h7pmDokMoPaIqbBLA'



map.on('load', () => {
  // make a pointer cursor
  map.getCanvas().style.cursor = "default";


  
  let filterHour = ['==', ['number', ['get', 'hour']], 12];
  let filterHourNB = ['==', ['number', ['get', 'start_hour']], 12];
  //let filterInfra = ['==', ['string', ['get', 'crash_infra_cat']], 'placeholder'];
  

  // rentals
  map.addSource('nb', {
    'type': "geojson",
      'data': 'https://api.mapbox.com/datasets/v1/ktitzer/cl5x4m9no00ft21ql58kdzzhy/features?access_token=pk.eyJ1Ijoia3RpdHplciIsImEiOiJja3p5MWl4cTgwMWRqMm5wY3d5YWRreXB1In0.8YKr-h7pmDokMoPaIqbBLA'// tileset ID
});
  
  // add circle layer here
map.addLayer(
  {
    id: 'nb',
    type: 'circle',
    source: 'nb',
    paint: {
      // set circle colors
      'circle-color': {
property: 'rental count',
        stops: [
          [0, '#e0ecf4'],
          [1000, '#9ebcda'],
          [4000, '#8856a7']
]
},
      // increase the radius of the circle as the zoom level and dbh value increases
      'circle-radius': {
property: 'rental count',
stops: [
[{zoom: 8, value: 1}, 0],
[{zoom: 8, value: 1000}, 0.5],
[{zoom: 8, value: 4000}, 1],
[{zoom: 11, value: 1}, 0],
[{zoom: 11, value: 1000}, 10],
[{zoom: 11, value: 4000}, 20],
[{zoom: 16, value: 1}, 0],
[{zoom: 16, value: 1000}, 30],
[{zoom: 16, value: 4000}, 60]
]
},
      //'circle-stroke-color': 'white',
      //'circle-stroke-width': 0.5,
      'circle-opacity': 0.5,
    },
 'filter': ['all', filterHour, filterHourNB]

   });  

    // crashes
  map.addSource('crashes', {
    'type': "geojson",
    'data': 'https://api.mapbox.com/datasets/v1/ktitzer/cl5wi2c850fr027pomphrsigf/features?access_token=pk.eyJ1Ijoia3RpdHplciIsImEiOiJja3p5MWl4cTgwMWRqMm5wY3d5YWRreXB1In0.8YKr-h7pmDokMoPaIqbBLA',// tileset ID
});


  
    map.addLayer({
    'id': 'collisions',
    'type': 'symbol',
    'source': 'crashes',
      'layout': {
        "icon-allow-overlap": true,
      "icon-image": [ 'match',['get', 'accident_severity'], 
      1, 'crash_1',
      2, 'crash_2',
      3, 'crash_3',
      'circle-stroked-15' // any other type
                    ]
      },
    /*'paint': {},
    'layout': {
      "icon-image": "harbor-15", // Custom icon
      "icon-size": 1.0,
      "icon-allow-overlap": false
    },
      'paint': {
      'circle-radius': 4.5,
      'circle-color': [
            'match',
            ['get', 'accident_severity'],
        1, '#ed1c24', // most serious
        2, '#f26522',
        3, '#ffff00', //least serious
        '#ffffff'//other
      ]
    },
    /*'paint': {
          //'circle-radius': 3,
      
      'circle-stroke-color': 'white',
    'circle-stroke-width': 0.8,
    'circle-opacity': 1,
      'circle-radius': [
            'match',
            ['get', 'accident_severity'],
        1, 4.5,
        2, 4,
        3, 3.5,
        2 //other
      ],*/
      /*'circle-radius': 4.5,
      'circle-color': [
            'match',
            ['get', 'accident_severity'],
        1, '#ed1c24', // most serious
        2, '#f26522',
        3, '#ffff00', //least serious
        '#ffffff'//other
      ]
    },*/
    'filter': ['all', filterHour, filterHourNB]
  });            

   
  
// Create popup
        const popup = new mapboxgl.Popup({className: "my-popup", closeButton: false, offset: [0, -5] })
        

        // Events to occur when mouse moves over a rental location
  map.on('mousemove', (event) => {
    const features = map.queryRenderedFeatures(event.point, {
            layers: ['nb']
          });
    
          if (!features.length) {
            popup.remove();
            return;
          }

          const feature = features[0];
    const featurenum = feature.properties['rental count'];

          popup
      .setLngLat(feature.geometry.coordinates)
            .setHTML("Rentals: " + featurenum)
            .addTo(map);
  });
  
  

    // update hour filter when the slider is dragged
  document.getElementById('slider').addEventListener('input', (event) => {
  const hour = parseInt(event.target.value);
  // update the map
  filterHour = ['==', ['number', ['get', 'hour']], hour];
  filterHourNB = ['==', ['number', ['get', 'start_hour']], hour];
  map.setFilter('collisions', ['all', filterHour]);
  map.setFilter('nb', ['all', filterHourNB]); //just added
  //map.setFilter('collisions', ['all', filterHour, filterInfra]);
 

// update text in the UI
document.getElementById('active-hour').innerText = hour + ":00";
});
 
//document.getElementById('filters').addEventListener('change', (event) => {
  //const infra = event.target.value;
  // update the map filter
  //if (infra === 'all') {
    //filterInfra = ['==', ['string', ['get', 'crash_infra_cat']], 'placeholder'];
  //} else if (infra === 'infra') {
  //  filterInfra = ['match', ['get', 'crash_before_all'], true];
  //} else if (infra === 'no_infra') {
  //  filterInfra = ['match', ['get', 'crash_before_all'], false];
  //} else {
  //  console.log('error');
  //}
//});
//map.setFilter('collisions', ['all', filterHour, filterInfra]);
map.setFilter('collisions', ['all', filterHour]);
map.setFilter('nb', ['all', filterHourNB]); //just added
 

  });