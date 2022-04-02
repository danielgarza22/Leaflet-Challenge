// Title layer for the background of the map
var defaultMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Layer # 2
var grayscale = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
});

let topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

//  Basemaps object
let basemaps = {
  Grayscale: grayscale,
  Topography: topoMap,
  Default: defaultMap
}

// Map Object
var myMap = L.map("map", {
  center: [36.7783, -119.4179],
  zoom: 3,
  layers: [grayscale, topoMap, defaultMap]
});

// Default map to the map
defaultMap.addTo(myMap);


// Get tectonic data
let tectonicplates = new L.layerGroup();

d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
.then(function(plateData){
  // console.log(plateData);
  L.geoJson(plateData,{
    color: "yellow",
    weight: 1
  }).addTo(tectonicplates);
});

// Add tectonic plates to the map
tectonicplates.addTo(myMap);

// variable to hold the earthquake data layer
let earthquakes = new L.layerGroup();

// get data for the eartquakes in the USGS GeoJason API and populate layer group
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
.then(
  function(earthquakeData){
    console.log(earthquakeData);
    function dataColor(depth){
      if (depth > 90)
        return "red";
      else if (depth > 70)
        return "#fc4903";
      else if (depth > 50)
        return "#fc8403";
      else if (depth > 30)
        return "#fcad03";
      else if (depth > 10)
        return "#cafc03";
      else
        return "green";
    }

    function radiusSize(mag){
      if (mag == 0)
        return 1;
      else
        return mag * 5;
    }
    function dataStyle(feature)
    {
      return {
        opacity: 0.5,
        fillOpacity: 0.5,
        fillColor: dataColor(feature.geometry.coordinates[2]), // use the index 2 for the depth
        color: "000000", // black outline
        radius: radiusSize(feature.properties.mag), // grab the magnitude
        weight: 0.5,
        stroke: true
      }
    }
    //Geojson Data
    L.geoJson(earthquakeData, {
      pointToLayer: function(feature, laLng){
        return L.circleMarker(laLng);
      },
      style: dataStyle, // calls the data style function
      onEachFeature: function(feature, layer){
        layer.bindPopup(`Magnitude:  <b>${feature.properties.mag}</b><br>
                        Depth: <b>${feature.geometry.coordinates[2]}</b><br>
                        Location: <b>${feature.properties.place}</b>`);
      }
    }).addTo(earthquakes);
  }
);

// earthquake layer
earthquakes.addTo(myMap);

// add the overlay for the tectonic plates
let overlays = {
  "Tectonic Plates": tectonicplates,
  "Earthquake Data": earthquakes
};


// Layer control
L.control.layers(basemaps, overlays)
.addTo(myMap);

// Map legend
let legend = L.control({
  position: "bottomright"
});

legend.onAdd = function() {
  let div = L.DomUtil.create("div", "Info legend");
  
  let intervals = [-10, 10, 30, 50, 70, 90];
  
  let colors = ["green", "#cafc03", "#fcad03", "#fc8403", "#fc4903", "red"];
  
  for (var i = 0; i < intervals.length; i++)
  {
    div.innerHTML += "<i style=background: " + colors[i] + "`></i>`" + intervals[i]
    + (intervals[i + 1] ? "km &ndash km" + intervals[i + 1] + "Km<br>" : "+");
  }
  return div;
};

legend.addTo(myMap);
