// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});

// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map
let streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
   attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});

// Create the map object with center and zoom options.
let myMap = L.map("map", {
  center: [40, -100],
  zoom: 5,
layers: [basemap]
});

// Then add the 'basemap' tile layer to the map.
basemap.addTo(myMap);

// OPTIONAL: Step 2
// Create the layer groups, base maps, and overlays for our two sets of data, earthquakes and tectonic_plates.
// Add a control to the map that will allow the user to change which layers are visible.
let earthquakesLayer = L.layerGroup();
let tectonicPlatesLayer = L.layerGroup();

let overlayMaps = {
"Earthquakes": earthquakesLayer,
"Tectonic_Plates": tectonicPlatesLayer,
};

let baseMaps = {
  "Street Map": streetLayer,
  "Basic Map": basemap,
};

L.control.layers(baseMaps, overlayMaps, {collapse: false}).addTo(myMap);

// Make a request that retrieves the earthquake geoJSON data.
d3.json(
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
).then(function (data) {
  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      radius: getRadius(feature.properties.mag),
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000000",
      weight: 0.5,
      opacity: 1,
      fillOpacity: 0.7,
    };
  }

// This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    return depth > 90 ? "#FF0000": //red
           depth > 70 ? "#FF6600": //orange
           depth > 50 ? "#FFFF00": //yellow
           depth > 30 ? "#31A354": //green
           depth > 10 ? "#FFC0CB": //pink
                        "#90EE90"; //lightgreen
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    return magnitude * 5;
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        `<h3>Magnitude: ${feature.properties.mag}</h3><p>Location: ${feature.properties.place}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p>`
      );
    },
    // OPTIONAL: Step 2
    // Add the data to the earthquake layer instead of directly to the map.
  }).addTo(myMap);

  // Create a legend control object.
  let legend = L.control({
    position: "bottomright",
  });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let depths = [-10, 10, 30, 50, 70, 90];
    let labels = [];
    // Initialize depth intervals and colors for the legend

    // Loop through our depth intervals to generate a label with a colored square for each interval.
    for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(depths[i] + 1) + '; width: 20px; height: 20px; display: inline-block; margin-right: 5px;"></i> ' +
        depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] : '+') + ' km<br>';
    }

    return div;
  };

  // Finally, add the legend to the map.
  legend.addTo(myMap);
  });