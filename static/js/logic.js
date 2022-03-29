var queryUrl = "https://https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(queryUrl).then(function (data) {
  console.log(data.features);
  
  let earthquakeData = data.features;
  
  createFeatures(earthquakeData);
});